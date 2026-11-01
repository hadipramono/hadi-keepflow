# Phase 3.7.4 — Integration & Reliability Test

Run in a dedicated Apps Script test deployment with disposable notes and categories. Do not use production data for destructive tests.

## A. Workspace and filtering regression

Prepare notes in Inbox and at least two categories. Include pinned, archived, and tagged notes.

- [ ] Inbox shows only active notes with an empty category; archived Inbox notes are excluded from the Inbox count.
- [ ] All Notes shows active notes across Inbox and categories.
- [ ] Pinned shows pinned active notes regardless of category.
- [ ] Archive shows archived notes, including notes previously in Inbox and categories.
- [ ] Category views show pinned and unpinned active notes in that category.
- [ ] Tag views show matching active notes across categories.
- [ ] Search works in All Notes, Inbox, Pinned, Archive, category, and tag views without leaking notes from other views.
- [ ] Search matches title, body text, category, and tags.
- [ ] Dashboard active, pinned, updated-today, archive, and category figures match the underlying notes.
- [ ] Dashboard recent-note and category shortcuts open the correct note/view.

## B. Category lifecycle integration

- [ ] Create a category and save a note into it.
- [ ] Save/restore a note whose category differs from an existing category only by capitalization; confirm no duplicate Drive folder is created.
- [ ] Confirm the saved note response and refreshed UI use the actual canonical folder name.
- [ ] Rename a category and verify its notes remain accessible through search, category view, tags, pinned, and archive.
- [ ] Delete a category with active and archived notes; confirm both are moved to Inbox without changing Drive file IDs or note metadata.
- [ ] Confirm unsupported files remain in the category and are reported.
- [ ] Confirm nested folders prevent deletion before any note moves.
- [ ] Retry a partial deletion after manually handling unsupported content.

## C. Interrupted Drive move recovery

In a disposable test deployment, simulate a note temporarily having both the storage-root parent and its former category parent.

- [ ] `getNotes()` returns one note only.
- [ ] The note is represented as Inbox while the storage-root parent exists.
- [ ] Backup snapshot contains one copy of the note and records its category as empty.
- [ ] Retrying the relevant migration/deletion operation removes the old category parent.
- [ ] After recovery, normal note editing and deletion still work.

## D. Offline queue and conflict regression

- [ ] Edit a note offline; confirm the note remains visible and the operation is durable after reload.
- [ ] Reconnect; confirm the operation synchronizes once and the queue clears only after acknowledgement.
- [ ] Simulate a lost response and retry; confirm the same operation ID does not create a duplicate file.
- [ ] Modify the same note from another browser/session; confirm stale local edits trigger conflict handling.
- [ ] Confirm choosing cloud or local conflict resolution leaves one coherent note and a cleared/resumable queue.
- [ ] Confirm category rename/delete is blocked while note operations or category creates remain queued.

## E. Backup and restore compatibility

- [ ] Generate a fresh Backup ZIP after category create/rename/delete and Inbox migration.
- [ ] Confirm Inbox notes are at ZIP root and no `Umum/` category is generated.
- [ ] Confirm manifest categories match current Drive category folders.
- [ ] Confirm note metadata retains pinned, archived, tags, and createdAt.
- [ ] Restore the ZIP into a separate test deployment; confirm categories and notes are reconstructed.
- [ ] Restore the same ZIP again; confirm exact duplicates are skipped and existing notes are not overwritten.
- [ ] Import an older ZIP containing `Umum/` paths; confirm those notes become Inbox notes.
- [ ] Confirm interrupted restore can be retried without duplicate note files.

## F. Acceptance criteria

- No duplicate notes or category folders are created.
- No note is lost, silently overwritten, or assigned to the wrong category.
- Drive file IDs remain stable for category rename/delete/migration operations.
- Inbox classification is consistent in UI, search, dashboard, and backup.
- Offline queue and conflict behavior remain consistent with the pre-3.7.4 contract.
- All tests above pass in the deployer's test environment before Phase 3.8 begins.

## Evidence to retain

Record test date, deployment version, Apps Script execution logs, before/after Drive file IDs, ZIP manifest, browser console output, and any queue/conflict details. Redact private note content.
