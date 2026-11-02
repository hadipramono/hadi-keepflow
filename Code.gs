/**
 * Hadi KeepFlow v1.3.6-rc.1 — Phase 3.7.4
 * Google Apps Script web entry point and shared utilities.
 * Backend modules: DriveStorage.gs, SyncOperations.gs, NotesApi.gs.
 * Storage: My Drive/apps/KeepFlow/storage/<category>/<note>.md
 *
 * Security rule: existing Drive files must belong to the KeepFlow storage
 * folder or one of its direct category folders. A narrowly scoped two-parent
 * state is accepted only to recover an interrupted move into Temporary Inbox.
 */

function doGet() {
  // Keep Apps Script's default X-Frame-Options protection.
  // Do not enable ALLOWALL unless embedding is an explicit, reviewed requirement.
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Hadi KeepFlow')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
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

/** Include an HTML partial in the main Apps Script template. */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
