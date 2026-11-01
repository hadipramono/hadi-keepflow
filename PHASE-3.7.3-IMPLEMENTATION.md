# Phase 3.7.3 — Category Management

## Status

Source implementation complete in development snapshot `v1.3.6-dev`. Live Apps Script and Google Drive verification remains the deployer's responsibility.

## Scope

Category management now supports:
- Create category.
- Rename category.
- Delete category and return its notes to Temporary Inbox.

Category reorder, nested categories, category icons, and category color customization are not part of this phase.

## Create category

Backend: `createCategoryFolder(categoryName)`

- Trims and validates the category name.
- Reserves `Umum` for legacy compatibility.
- Enforces a maximum of 120 characters after sanitization.
- Prevents duplicates case-insensitively.
- Repeated calls for an existing category return the existing category rather than creating another folder.
- Existing offline create queue remains available. The pending category is synchronized when online.

## Rename category

Backend: `renameCategoryFolder(oldName, newName)`

- Finds the source category case-insensitively.
- Rejects a destination name already used by another category, case-insensitively.
- Rejects blank names and reserved name `Umum`.
- Renames the Google Drive folder directly.
- Does not rewrite, recreate, rename, or change the contents of note files.
- Drive file IDs and embedded note metadata remain unchanged.

Frontend behavior:
- Uses the dedicated rename endpoint; it no longer treats a category rename as a bulk note save.
- Updates local note category values and the last-observed baseline after server success.
- Updates the active category view and editor category selection.
- Does not enqueue unnecessary per-note writes.

## Delete category

Backend: `deleteCategoryFolder(categoryName)`

Deleting a category does not delete its notes.

1. The backend locks category operations.
2. It rejects categories containing nested folders, leaving all data untouched.
3. It enumerates direct files in the category.
4. Only `.md` and `.txt` note files are moved to the storage root.
5. Each note file is attached to the storage root before its category parent is removed.
6. If an execution stops between those two Drive operations, a retry recognizes the two-parent recovery state and removes the old category parent.
7. The category folder is moved to Drive Trash only when no files or subfolders remain and no file errors occurred.

Preserved note properties:
- Drive file ID.
- Filename/title.
- Content.
- Embedded JSON metadata, including tags, pinned state, archived state, and `createdAt`.

Unsupported files (for example PDF attachments) are not moved or trashed. They are reported and keep the category folder in place. Nested folders are rejected before any files are moved. File-operation errors are returned individually and the operation can be retried.

The frontend shows a confirmation explaining that notes return to Inbox. It reports moved files, files already in Inbox, remaining files/folders, skipped files, and errors.

## Synchronization and safety

Rename and delete are structural Drive operations, not note edits. They require:
- Browser online.
- Cloud snapshot loaded.
- No synchronization currently running.
- No pending note operations.
- No pending category creates.
- No dirty editor draft.

This prevents a queued note save from recreating the old category after a folder rename or deletion. If the sync queue is not empty, the UI asks the user to wait for synchronization.

Create remains compatible with the existing pending category-create queue.

## Drive ownership validation

`assertFileBelongsToStorage()` now accepts a narrowly defined recovery state where a file has exactly two parents:
- the KeepFlow `storage/` folder; and
- one direct child category folder.

This is required when a category deletion or legacy migration is interrupted after the destination parent is added but before the source parent is removed. All other unexpected multi-parent layouts remain rejected.

## Validation performed

- Node syntax checks passed for all four `.gs` files and JavaScript extracted from `AppScripts.html`.
- Mocked Drive tests covered:
  - case-insensitive category creation and duplicate prevention;
  - folder rename with note ID and content preservation;
  - moving `.md` and `.txt` notes to Inbox;
  - preserving pinned, archived, tags, and `createdAt` metadata;
  - leaving unsupported PDF files in the category folder;
  - successful retry after unsupported content is manually handled;
  - accepting the exact two-parent recovery state;
  - rejecting category deletion when nested folders exist.
- HTML IDs and literal `getElementById()` references were checked.
- Local Markdown links were checked for missing targets.

## Not verified

No Apps Script deployment or live Google Drive operation was performed. Verify the workflow in a test deployment before using it with important data. Google Drive permissions, quotas, and actual parent-operation behavior must be confirmed in the user's environment.
