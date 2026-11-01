# Hadi KeepFlow v1.3.6 — Template Management & Inbox UI Hotfix

## Changes

### Editable note templates
- Added a Template Manager from the note editor.
- Users can create, edit, and delete templates.
- Existing built-in templates (Catatan rapat, Studi Alkitab, Rencana proyek, Jurnal harian) are editable.
- Built-in templates can be restored to their defaults.
- Applying a template still replaces only the current editor draft after confirmation; it does not modify existing saved notes until the user saves the note.
- Template content is sanitized using the existing editor HTML sanitizer.
- Templates are stored in browser LocalStorage under `hadi_keepflow_templates_v1`.

### Inbox migration UI cleanup
- Removed the legacy migration button and its status text from Data & Backup.
- Removed frontend polling and invocation of the legacy migration UI workflow.
- Kept compatibility normalization for old local drafts, queued payloads, and backup imports. This is intentionally retained as a defensive compatibility layer; it is not shown to users.
- Kept the reserved category-name guard, but replaced the legacy-specific message with neutral wording.

## Important storage behavior

Templates are browser-local preferences. They are not stored in Google Drive, are not synchronized to another browser/device, and are not included in the note Backup ZIP. Notes and their existing storage/sync format are unchanged.

## Installation

1. Make a copy of the Apps Script project or deploy to a test deployment first.
2. Replace `Index.html` and `AppScripts.html` with the files in this patch.
3. Keep the current `AppStyles.html` and all backend `.gs` files unchanged.
4. Save and deploy a new Apps Script version.
5. Reload the web app. If the template manager does not appear, perform a hard refresh.

## Validation performed locally

- Frontend JavaScript syntax check.
- Required template manager element IDs are unique and referenced.
- Legacy migration UI element IDs and frontend migration polling/handlers are absent.
- Existing Inbox compatibility normalization remains in place.

Browser interaction, LocalStorage persistence across reloads, and live Apps Script deployment still require user-side verification.
