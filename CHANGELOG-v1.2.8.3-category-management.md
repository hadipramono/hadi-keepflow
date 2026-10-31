# Hadi KeepFlow v1.2.8.3 — Category Management

## Changes
- Reduced built-in default categories to `Umum` only.
- Removed automatic inclusion of `Pekerjaan` and `Pribadi` from the backend category list.
- Kept existing category folders and categories referenced by notes.
- Added `deleteCategoryFolder()` to move an empty, non-default category folder to Google Drive Trash.
- Added backend protection against deleting `Umum`, missing categories, and folders containing files or nested folders.
- Added a sidebar delete action only for categories with zero notes. Archived notes count as notes.
- Blocked category deletion while offline.
- Reconciled the local category registry against cloud categories, note categories, and pending creates so stale former defaults do not remain indefinitely.
- Added an offline-safe local migration that hides legacy `Pekerjaan`/`Pribadi` entries unless notes or pending category creation still use them; a cloud refresh restores any actual existing Drive folders.

## Files changed
- `NotesApi.gs`
- `AppScripts.html`
- Documentation and test checklist files.

## Data safety
- Existing note files are not deleted or migrated.
- Existing `Pekerjaan`, `Pribadi`, and other folders are not deleted automatically.
- Category deletion is permitted only when the Drive folder is truly empty.
- Successful deletion moves the folder to Google Drive Trash, not permanent deletion.
- LocalStorage note data, editor drafts, and pending note sync operations are unchanged.

## Validation scope
Syntax and mocked backend tests are run for this package. A live Apps Script deployment and real Google Drive behavior must still be verified by the project owner.
