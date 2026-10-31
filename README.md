# Hadi KeepFlow

Personal notes application using Google Apps Script, Google Drive Markdown files, and browser LocalStorage for offline/local state.

## Current package
**v1.3.5 — Phase 3.6 Productivity Features**

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


## Hotfix v1.2.8.2
Fixes newly created categories not appearing in the sidebar/editor category list and not surviving reload. Adds a Drive category-folder API and a local pending category queue. See `CATEGORY-PERSISTENCE-TEST.md` and `CATEGORY-MANAGEMENT-TEST.md`.


## v1.2.8.3 — Category Management
- Only `Umum` is a built-in default category.
- `Pekerjaan` and `Pribadi` are no longer injected as defaults; existing Drive folders and categories used by notes remain visible.
- Empty non-default category folders can be moved to Google Drive Trash from the sidebar.
- Categories containing any Drive file or nested folder are protected by a server-side check.
- Archived notes are included in the UI count and prevent deletion.
- Cloud category reconciliation removes stale local-only default entries while retaining categories used by notes and pending category creation.


## Latest release: v1.3.0 — Phase 3.1
Data Portability & Backup: ZIP backup, ZIP restore/import, manifest, category structure, metadata preservation, import preview, duplicate detection, and merge-only restore. See `CHANGELOG-v1.3.0-phase-3.1.md` and `DATA-PORTABILITY-TEST.md`.


## v1.3.0.1 hotfix
Adds visible progress reporting for ZIP backup and restore/import. See `CHANGELOG-v1.3.0.1-progress-ui.md`.


## v1.3.1 — Phase 3.2
Adds multi-field, multi-term search, quoted phrases, match highlighting, recent search history, sorting, and combined filters. See `CHANGELOG-v1.3.1-phase-3.2.md` and `SEARCH-DISCOVERY-TEST.md`.


## v1.3.2 — Phase 3.3 Note Organization
Adds multi-note selection and bulk organization actions: move to an existing category, add/remove tags, pin/unpin, and archive/restore. Selection is performed against the current filtered result set; permanent deletion remains an individual action for safety. No backend or data schema changes. See `CHANGELOG-v1.3.2-phase-3.3.md` and `NOTE-ORGANIZATION-TEST.md`.


## v1.3.3 — Phase 3.4 Editor Enhancement
Improves the writing experience with undo/redo, paragraph and heading formatting, blockquotes, lists, safe link insertion, horizontal separators, clear-formatting action, keyboard shortcuts, live word/character counts, and clearer editor typography. Existing local draft recovery and the sync queue are retained. No backend or data schema changes. See `CHANGELOG-v1.3.3-phase-3.4.md` and `EDITOR-ENHANCEMENT-TEST.md`.


## v1.3.4 — Phase 3.5 Dashboard & Personalization
Adds a dedicated dashboard with active/pinned/archived/today-updated note statistics, recently updated notes, and category distribution. Adds local browser preferences for display name, system/light/dark theme, grid/list layout, and default sorting. Preferences are stored separately in LocalStorage; no backend, Drive metadata, or note schema changes. See `CHANGELOG-v1.3.4-phase-3.5.md` and `DASHBOARD-PERSONALIZATION-TEST.md`.


## v1.3.5 — Phase 3.6 Productivity Features
Adds four reusable note templates (meeting, Bible study, project plan, daily journal), interactive checklists, task completion metrics, and checklist state markers in note previews/search. Checklist content remains inside the existing note body; no task database or backend changes are introduced. See `CHANGELOG-v1.3.5-phase-3.6.md` and `PRODUCTIVITY-FEATURES-TEST.md`.
