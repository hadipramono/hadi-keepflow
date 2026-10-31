# Phase 3.3 — Note Organization Test

Run after deploying v1.3.2. Use test notes or a small reversible sample first.

## A. Selection mode
1. Open the app and wait for cloud sync to finish.
2. Click **Pilih**.
3. Confirm checkboxes appear in both grid and list view.
4. Select/deselect a note using its checkbox.
5. Click another part of a card while selection mode is active.
6. Click **Selesai**.

Expected: selection mode toggles cleanly; card clicks select rather than open the editor; exiting mode clears selection.

## B. Select visible notes
1. Apply a search query or category/tag/date filter.
2. Enter selection mode and click **Pilih yang tampil**.
3. Confirm the selection count equals the number of notes currently shown.

Expected: only the current filtered result set is selected. Repeating after changing filters adds the newly visible notes to the selection.

## C. Move category
1. Select at least two notes.
2. Choose an existing category in **Pindah kategori**.
3. Click **Pindahkan**.
4. Refresh the app and verify both notes appear in the target category.

Expected: category changes persist to Drive and the local cache. Existing categories only; no folder is created by this action.

## D. Add/remove tags
1. Select multiple notes and click **Tambah tag**.
2. Enter one or more comma-separated tags, including a tag already present on one note.
3. Confirm tags appear on all selected notes without case-insensitive duplicates.
4. Click **Hapus tag** and enter one or more tags.

Expected: requested tags are added/removed across selected notes; other tags remain unchanged.

## E. Pin/unpin
1. Select a mix of pinned and unpinned notes.
2. Click **Sematkan**.
3. Confirm all selected notes become pinned.
4. Click **Lepas pin**.

Expected: mixed selection is normalized to pinned; a fully pinned selection is unpinned.

## F. Archive/restore
1. Select active notes and click **Arsipkan**.
2. Open the Archive view and verify the notes are present.
3. Select those notes and click **Pulihkan arsip**.

Expected: all selected notes receive the same archive state and remain recoverable.

## G. Persistence and sync recovery
1. Perform one bulk action while online and wait for sync completion.
2. Reload the app and verify the changes.
3. If safe, repeat one bulk action offline, reconnect, and wait for the durable queue to flush.

Expected: no changes are lost; existing sync status and retry behavior remain functional.

## H. Regression checks
- Search, sorting, date filters, category/tag navigation continue working.
- Grid and list layouts both support selection.
- Editor opens normally when selection mode is off.
- Backup ZIP includes the updated metadata after sync.
- No bulk delete action is present; permanent deletion remains a per-note confirmed action.
