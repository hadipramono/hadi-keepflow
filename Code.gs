/**
 * Hadi KeepFlow v1.3.8
 * Google Apps Script web entry point and shared utilities.
 * Backend modules: DriveStorage.gs, SyncOperations.gs, NoteFormat.gs, NotesApi.gs.
 * Storage: My Drive/apps/KeepFlow/storage/<category>/<note>.md (YAML front matter + HTML body)
 *
 * Security rule: existing Drive files must belong to the KeepFlow storage
 * folder or one of its direct category folders. A narrowly scoped two-parent
 * state is accepted only to recover an interrupted move into Temporary Inbox.
 */

function doGet(e) {
  // Keep Apps Script's default X-Frame-Options protection.
  // Do not enable ALLOWALL unless embedding is an explicit, reviewed requirement.
  const template = HtmlService.createTemplateFromFile('Index');
  // IMPORTANT (mobile keyboard): Apps Script renders Index.html inside a sandboxed
  // iframe, and the browser only honours the viewport meta of the OUTER page,
  // i.e. the one added here (the <meta name="viewport"> inside Index.html is
  // ignored). Without "interactive-widget=resizes-content", Chrome/Android
  // (108+) lets the virtual keyboard overlay the page and the iframe never
  // learns about it, so a bottom-anchored toolbar ends up hidden behind the
  // keyboard. With it, the layout viewport (and the iframe) shrink when the
  // keyboard opens, so the editor dock stays directly above the keyboard.
  return template.evaluate()
    .setTitle('Hadi KeepFlow')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, interactive-widget=resizes-content');
}

function safeName(value, fallback) {
  const result = String(value || fallback || '')
    .replace(/[\/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return result || fallback || 'Tanpa Judul';
}

function toBoolean(value) {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    return ['true', '1'].indexOf(value.trim().toLowerCase()) !== -1;
  }
  return false;
}

/**
 * Include an HTML partial in the main Apps Script template.
 * Every public function can be called from the browser through
 * google.script.run, so only the known partials are allowed.
 */
var INCLUDABLE_PARTIALS = ['AppStyles', 'AppScripts'];

function include(filename) {
  if (INCLUDABLE_PARTIALS.indexOf(filename) === -1) {
    throw new Error('Partial tidak diizinkan: ' + filename);
  }
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
