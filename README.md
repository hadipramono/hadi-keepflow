# Hadi KeepFlow

Personal notes application using Google Apps Script, Google Drive Markdown files, and browser LocalStorage for offline/local state.

## Current package
**v1.2.8 — Tahap 2.4: Maintainability & Code Structure**

## Source structure
- `Index.html`: page markup and shell.
- `AppStyles.html`: custom application CSS.
- `AppScripts.html`: frontend application logic.
- `Code.gs`: web entry point, HTML include helper, and general utilities.
- `DriveStorage.gs`: Drive folder access, ownership validation, parsing, and file naming.
- `SyncOperations.gs`: idempotency receipt lifecycle and replay.
- `NotesApi.gs`: note list/save/delete and category operations.

All `.gs` files share the Apps Script global namespace; public function names are retained for `google.script.run`.

## Data and reliability safeguards
This refactor is intended to preserve the v1.2.7 data format, LocalStorage keys, queue semantics, optimistic version checks, retry behavior, and Drive ownership checks. See prior `CHANGELOG-*.md` and test guides for the detailed safeguards and limitations.

## Tests
Run `MAINTAINABILITY-TEST.md` plus the existing sync, offline, security, conflict, recovery, performance, navigation, and editor test guides. Browser and live Drive validation remain the project owner's responsibility.


## Hotfix v1.2.8.1

Fixes a documentation-comment boundary in `DriveStorage.gs` that hid the storage folder helper declarations. Replace the backend file `DriveStorage.gs` with this hotfix version. No other project files need to change.
