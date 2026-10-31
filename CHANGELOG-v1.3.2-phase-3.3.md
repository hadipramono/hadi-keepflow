# v1.3.2 — Phase 3.3: Note Organization

## Goal
Make it easier to organize multiple notes without changing the existing Google Apps Script + Google Drive Markdown + LocalStorage architecture.

## Changes
- Added an explicit selection mode in the note list.
- Added checkboxes for cards in both grid and list layouts. Clicking a card while selection mode is active toggles its selection instead of opening the editor.
- Added **Pilih yang tampil** to select all notes matching the current search, category/tag, status, and date filters.
- Added bulk move to an existing category. This does not create or delete category folders.
- Added bulk add/remove tags. Tag matching is case-insensitive; additions avoid duplicates and respect the existing 50-tag limit.
- Added bulk pin/unpin and archive/restore. For a mixed selection, the action normalizes all selected notes to the same state (pin/archive if at least one is not set; otherwise unpin/restore).
- All note changes flow through the existing `syncToBackend()` durable queue.
- Permanent deletion remains per-note and requires the existing confirmation flow.

## Compatibility and scope
- No `.gs` files changed.
- No database, Drive format, metadata schema, or LocalStorage key changes.
- Existing search, sort, category/tag/date filters, backup/restore, and offline queue remain in place.
- Bulk actions update the selected notes' `updatedAt` timestamp.

## Files changed
- `Index.html`
- `AppStyles.html`
- `AppScripts.html`
- `README.md`
- `INSTALL.md`
- `GIT_COMMIT.md`
- Added `NOTE-ORGANIZATION-TEST.md`
