# Category Management — Manual Test Guide

Run these checks in a test deployment before using category deletion on important notes.

## A. Create category

- [ ] Create a category with a normal name.
- [ ] Confirm it appears in the sidebar and editor category selector.
- [ ] Create the same name again; confirm no duplicate Drive folder is created.
- [ ] Try a duplicate differing only in capitalization; confirm it resolves to the existing category.
- [ ] Try creating `Umum`; confirm the app explains that the name is reserved.
- [ ] Create a category while offline; reconnect and confirm the pending category is synchronized once.

## B. Rename category

Prepare a category with multiple notes, including a pinned note, an archived note, and a note with tags.

- [ ] Wait until cloud loading and synchronization finish.
- [ ] Rename the category.
- [ ] Confirm the new name appears in the sidebar and editor selector.
- [ ] Confirm the old folder name is gone and the new folder exists in Google Drive.
- [ ] Confirm notes remain in the renamed folder.
- [ ] Compare Drive file IDs before and after; they must be identical.
- [ ] Confirm titles, content, tags, pinned state, archive state, and `createdAt` remain unchanged.
- [ ] Confirm the current category view remains selected under the new name.
- [ ] Try renaming to an existing category name, including a capitalization-only duplicate; confirm the operation is rejected.
- [ ] Try renaming to `Umum`; confirm the operation is rejected.
- [ ] Try rename while offline or while sync operations are pending; confirm the operation is blocked.

## C. Delete category with notes

Prepare a category with at least three notes. Include one archived note and one pinned/tagged note.

- [ ] Wait until cloud loading and synchronization finish.
- [ ] Click the category delete action.
- [ ] Confirm the dialog states that notes will move to Temporary Inbox, not be deleted.
- [ ] Cancel once and confirm no Drive files move.
- [ ] Confirm deletion.
- [ ] Confirm the category folder is moved to Drive Trash only after it becomes empty.
- [ ] Confirm all notes now appear in Inbox.
- [ ] Confirm note IDs, filenames, content, tags, pinned state, archived state, and `createdAt` remain unchanged.
- [ ] Confirm the active Inbox count excludes archived notes.
- [ ] Confirm no duplicate notes appear.
- [ ] Confirm other categories are unchanged.

## D. Unsupported files and nested folders

- [ ] Put a PDF file in a category folder alongside Markdown notes.
- [ ] Delete the category.
- [ ] Confirm Markdown/text notes move to Inbox.
- [ ] Confirm the PDF is not deleted or moved and the category folder remains.
- [ ] Confirm the UI reports the skipped file and remaining file count.
- [ ] Move or remove the PDF manually, then retry category deletion.
- [ ] Confirm the now-empty category folder is moved to Drive Trash.
- [ ] In another category, create a nested folder.
- [ ] Attempt category deletion; confirm it is rejected before any notes move and the nested folder remains intact.

## E. Retry and recovery

- [ ] Repeat category deletion after a completed deletion; confirm the API safely reports that the category no longer exists.
- [ ] If possible in a test deployment, simulate a file attached to both `storage/` and its category folder.
- [ ] Retry category deletion; confirm it removes the old category parent without recreating the note.
- [ ] Confirm normal note reads and edits still work after the recovery state is resolved.

## F. Regression

- [ ] Create a new note directly in Inbox.
- [ ] Move it into a category using the editor.
- [ ] Move it back to Inbox using the editor.
- [ ] Move selected notes to Inbox using the bulk action.
- [ ] Confirm search, filters, dashboard category counts, archive, and pinned views still work.
- [ ] Create a fresh Backup ZIP and confirm category names and note category paths are correct.
- [ ] Restore a test backup into a separate test instance and verify the notes.

## Pass criteria

Category management is ready for production only when create, rename, delete, preservation, retry, and regression checks pass. Keep a fresh Backup ZIP before the first production category deletion.
