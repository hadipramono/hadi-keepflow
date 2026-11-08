/**
 * Hadi KeepFlow v1.3.8 backend module: note file format.
 *
 * Format v2 (written by this version) is a Markdown file with standard YAML
 * front matter. Every value is a JSON literal (a valid YAML subset), so any
 * YAML reader - Obsidian, Jekyll, Hugo, yq - can read it as is:
 *
 *   ---
 *   keepflow: 2
 *   title: "Rapat: anggaran \"Q4\""
 *   created: "2026-11-01T00:00:00.000Z"
 *   pinned: false
 *   archived: false
 *   tags: ["rapat", "q4"]
 *   content_type: html
 *   ---
 *
 *   <p>Isi catatan...</p>
 *
 * The body is a restricted HTML subset (see sanitizeEditorHTML in the UI).
 * `content_type` documents that, so a future Markdown migration can detect it.
 *
 * Legacy format v1 (`---JSON---` block) and plain files without metadata are
 * still readable. Notes are upgraded to v2 the next time they are saved.
 *
 * KEEP IN SYNC with serializeNoteFile/parseNoteText in AppScripts.html
 * (backup/restore). tests/note-format.test.js checks both implementations
 * against each other.
 */

var KEEPFLOW_NOTE_FORMAT_VERSION = 2;

function yamlString_(value) {
  // U+2028/U+2029 are line breaks in YAML 1.1; escape them explicitly.
  return JSON.stringify(String(value == null ? '' : value))
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Build the full text of a note file from metadata and an HTML body. */
function serializeNoteFile(meta, body) {
  const m = meta || {};
  const tags = (Array.isArray(m.tags) ? m.tags : [])
    .filter(function (tag) { return typeof tag === 'string'; })
    .map(yamlString_)
    .join(', ');
  return [
    '---',
    'keepflow: ' + KEEPFLOW_NOTE_FORMAT_VERSION,
    'title: ' + yamlString_(m.title || ''),
    'created: ' + yamlString_(m.createdAt || ''),
    'pinned: ' + (m.isPinned ? 'true' : 'false'),
    'archived: ' + (m.isArchived ? 'true' : 'false'),
    'tags: [' + tags + ']',
    'content_type: html',
    '---',
    '',
    String(body == null ? '' : body)
  ].join('\n');
}

function parseYamlScalar_(raw) {
  const text = String(raw).trim();
  if (text === '') return '';
  try {
    return JSON.parse(text);
  } catch (e) {
    // Hand-edited file: accept bare scalars and single-quoted strings.
    if (/^'.*'$/.test(text)) return text.slice(1, -1).replace(/''/g, "'");
    if (text === 'true') return true;
    if (text === 'false') return false;
    return text;
  }
}

function parseYamlTags_(rawValue, followingLines) {
  const value = String(rawValue).trim();
  if (value.charAt(0) === '[') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      const end = value.lastIndexOf(']');
      return value.slice(1, end === -1 ? value.length : end)
        .split(',')
        .map(function (item) { return String(parseYamlScalar_(item)); })
        .filter(Boolean);
    }
  }
  if (value) {
    return value.split(',').map(function (item) { return String(parseYamlScalar_(item)); }).filter(Boolean);
  }
  // Block list:   tags:\n  - a\n  - b
  const result = [];
  for (let i = 0; i < followingLines.length; i++) {
    const match = /^\s*-\s+(.*)$/.exec(followingLines[i]);
    if (!match) break;
    result.push(String(parseYamlScalar_(match[1])));
  }
  return result;
}

/**
 * Split note file text into metadata and body.
 * @return {{format: string, meta: Object, body: string}}
 *   format is 'v2', 'v1' (legacy ---JSON---) or 'plain' (no metadata).
 */
function parseNoteText(text) {
  const raw = String(text == null ? '' : text);
  const src = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;

  const v2 = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(src);
  if (v2 && /^keepflow:/m.test(v2[1])) {
    const lines = v2[1].split(/\r?\n/);
    const meta = {};
    for (let i = 0; i < lines.length; i++) {
      const match = /^([A-Za-z_][\w-]*):[ \t]*(.*)$/.exec(lines[i]);
      if (!match) continue;
      const key = match[1];
      if (key === 'tags') {
        meta.tags = parseYamlTags_(match[2], lines.slice(i + 1));
      } else {
        meta[key] = parseYamlScalar_(match[2]);
      }
    }
    return {
      format: 'v2',
      meta: {
        title: typeof meta.title === 'string' ? meta.title : '',
        createdAt: typeof meta.created === 'string' ? meta.created : '',
        isPinned: meta.pinned === true || meta.pinned === 'true',
        isArchived: meta.archived === true || meta.archived === 'true',
        tags: (Array.isArray(meta.tags) ? meta.tags : []).filter(function (tag) { return typeof tag === 'string'; })
      },
      body: src.slice(v2[0].length).replace(/^\r?\n/, '')
    };
  }

  if (src.indexOf('---JSON---') === 0) {
    const parts = src.split('---JSON---');
    if (parts.length >= 3) {
      try {
        const legacy = JSON.parse(parts[1].trim()) || {};
        return {
          format: 'v1',
          meta: {
            title: '',
            createdAt: typeof legacy.createdAt === 'string' ? legacy.createdAt : '',
            isPinned: toBoolean(legacy.isPinned),
            isArchived: toBoolean(legacy.isArchived),
            tags: (Array.isArray(legacy.tags) ? legacy.tags : []).filter(function (tag) { return typeof tag === 'string'; })
          },
          body: parts.slice(2).join('---JSON---').replace(/^\s+/, '')
        };
      } catch (e) {
        // Malformed metadata: keep the whole text visible instead of losing it.
      }
    }
  }

  return {
    format: 'plain',
    meta: { title: '', createdAt: '', isPinned: false, isArchived: false, tags: [] },
    body: src
  };
}

/**
 * Pick the display title. The front matter title keeps characters that are not
 * allowed in Drive file names ("Roma 8: Ayat 1") and ignores the " (1)" suffix
 * added to make file names unique. If someone renamed the file in Drive, the
 * file name wins.
 */
function resolveNoteTitle(fileName, metaTitle) {
  const fileBase = String(fileName).replace(/\.(md|txt)$/i, '');
  const title = String(metaTitle || '').trim();
  if (!title) return fileBase;
  const safe = safeName(title, '');
  const withoutSuffix = fileBase.replace(/ \(\d+\)$/, '');
  return (safe === fileBase || safe === withoutSuffix) ? title : fileBase;
}
