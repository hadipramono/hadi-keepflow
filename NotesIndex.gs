/**
 * Hadi KeepFlow v1.3.8 backend module: notes index.
 *
 * Why: getNotes() used to download the content of EVERY note file on every
 * load, one Drive round trip per file. Listing files and reading their
 * metadata is cheap; fetching their content is what is slow.
 *
 * How: one JSON file, storage/.keepflow-index.json, remembers the parsed
 * content of each note together with the file's Drive ID, last-updated time
 * and name. On load, a note whose ID, version and name all still match is
 * taken from the index; any other note is read from Drive as before.
 *
 * Rules that keep this safe:
 *  - The index is only a cache. Correctness never depends on it: a missing,
 *    corrupt, oversized or unwritable index just means files are read directly.
 *  - Writes (saveNote, deleteNote, ...) never use the index. Version checks
 *    for conflicts always come from the Drive file itself.
 *  - The category is not stored: it is derived from the folder on every read,
 *    so moving a file between folders is always reflected.
 *  - Backups read the files directly and neither use nor modify the index.
 *  - A very large first (cold) read could hit Apps Script's 6 minute limit
 *    before the index is written. The index is therefore checkpointed every
 *    NOTES_INDEX_CHECKPOINT_EVERY file downloads, so the next attempt resumes
 *    instead of starting over.
 *  - The file is outside every category folder and does not end in .md/.txt,
 *    so it is never listed as a note. It is safe to delete; it is rebuilt.
 *
 * The index duplicates note content inside the same Drive folder, so it has
 * the same access as the notes themselves.
 */

var NOTES_INDEX_NAME = '.keepflow-index.json';
var NOTES_INDEX_FORMAT = 1;
// Above this size the index is not written (a full read is used instead).
var NOTES_INDEX_MAX_CHARS = 12000000;
// Write a partial index after this many file downloads in one run.
var NOTES_INDEX_CHECKPOINT_EVERY = 100;

/** Load the index file and its entries. Never throws. */
function loadNotesIndex_(storage) {
  const result = { file: null, entries: {} };
  try {
    const files = storage.getFilesByName(NOTES_INDEX_NAME);
    while (files.hasNext()) {
      const file = files.next();
      if (file.isTrashed()) continue;
      if (!result.file) result.file = file;
    }
    if (!result.file) return result;
    const data = JSON.parse(result.file.getBlob().getDataAsString('UTF-8'));
    if (data && data.format === NOTES_INDEX_FORMAT && data.entries &&
        typeof data.entries === 'object' && !Array.isArray(data.entries)) {
      result.entries = data.entries;
    }
  } catch (e) {
    result.entries = {};
  }
  return result;
}

/**
 * Write the index. Returns { chars, file }; chars is 0 when skipped because the
 * index would be larger than NOTES_INDEX_MAX_CHARS.
 */
function saveNotesIndex_(storage, indexFile, entries) {
  const text = JSON.stringify({
    format: NOTES_INDEX_FORMAT,
    generatedAt: new Date().toISOString(),
    entries: entries
  });
  if (text.length > NOTES_INDEX_MAX_CHARS) return { chars: 0, file: indexFile };
  if (indexFile) {
    indexFile.setContent(text);
    return { chars: text.length, file: indexFile };
  }
  return { chars: text.length, file: storage.createFile(NOTES_INDEX_NAME, text, 'application/json') };
}

/**
 * Persist progress during a long cold read. Entries not visited yet stay as
 * they were; every entry is re-validated against its file on each read, so a
 * partial index can never serve stale data. Failures are ignored.
 */
function checkpointNotesIndex_(ctx) {
  try {
    const merged = Object.assign({}, ctx.entries, ctx.next);
    const saved = saveNotesIndex_(ctx.storage, ctx.file, merged);
    ctx.file = saved.file;
    ctx.stats.checkpoints = (ctx.stats.checkpoints || 0) + 1;
  } catch (e) {
    ctx.stats.indexError = String(e && e.message || e).slice(0, 200);
  }
}

function entryFromNote_(note, fileName) {
  return {
    v: note.baseUpdatedAt,
    n: fileName,
    t: note.title,
    b: note.content,
    p: note.isPinned,
    a: note.isArchived,
    g: note.tags,
    cr: note.createdAt
  };
}

/** Rebuild a note from an index entry, or null when the entry is malformed. */
function noteFromEntry_(id, entry, category) {
  if (!entry || typeof entry !== 'object' ||
      typeof entry.v !== 'string' || typeof entry.n !== 'string' ||
      typeof entry.t !== 'string' || typeof entry.b !== 'string' ||
      typeof entry.cr !== 'string' || typeof entry.p !== 'boolean' ||
      typeof entry.a !== 'boolean' || !Array.isArray(entry.g) ||
      entry.g.some(function (tag) { return typeof tag !== 'string'; })) {
    return null;
  }
  return {
    id: id,
    title: entry.t,
    content: entry.b,
    category: category || '',
    isPinned: entry.p,
    isArchived: entry.a,
    tags: entry.g,
    createdAt: entry.cr,
    updatedAt: entry.v,
    baseUpdatedAt: entry.v
  };
}

/**
 * Read one note through the index. ctx = { entries, next, stats }:
 * entries = previous index, next = entries for this run, stats = counters.
 */
function readNoteIndexed_(file, category, ctx) {
  ctx.stats.files++;
  const id = file.getId();
  const name = file.getName();
  const version = file.getLastUpdated().toISOString();
  // A file visible through two parents (interrupted move) is read only once.
  const entry = ctx.next[id] || ctx.entries[id];
  let note = null;
  if (entry && entry.v === version && entry.n === name) {
    note = noteFromEntry_(id, entry, category);
  }
  if (note) {
    ctx.stats.hits++;
    ctx.next[id] = entryFromNote_(note, name);
    return note;
  }

  note = parseNoteFile(file, category);
  ctx.stats.reads++;
  ctx.next[id] = entryFromNote_(note, name);
  if (ctx.stats.reads % NOTES_INDEX_CHECKPOINT_EVERY === 0) checkpointNotesIndex_(ctx);
  return note;
}

/**
 * Owner tool: run from the Apps Script editor (Run > benchmarkNotesRead) and
 * read the result in the Execution log. Reports how long a full read takes
 * versus a read through the index on your real data.
 */
function benchmarkNotesRead() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const direct = collectAllNotes_(storage, { useIndex: false }).stats;
    const first = collectAllNotes_(storage).stats;
    const second = collectAllNotes_(storage).stats;
    const report = {
      notes: direct.files,
      fullReadMs: direct.ms,
      indexBuildMs: first.ms,
      indexedReadMs: second.ms,
      indexedReadHits: second.hits,
      indexedReadFileReads: second.reads,
      indexChars: first.indexChars || second.indexChars || 0
    };
    console.log('KeepFlow benchmarkNotesRead: ' + JSON.stringify(report));
    return report;
  } finally {
    lock.releaseLock();
  }
}
