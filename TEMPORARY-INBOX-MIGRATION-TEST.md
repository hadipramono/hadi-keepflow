# Temporary Inbox & Legacy Migration — Manual Test Guide

Run these tests in a dedicated Apps Script test deployment first. Do not test the migration against production data until a fresh backup is saved.

## A. Pre-migration checks

- [ ] Deploy the complete v1.3.6-dev source.
- [ ] Open the app while online and wait for cloud synchronization to finish.
- [ ] Confirm old notes from `Umum` appear in Inbox.
- [ ] Confirm other categories remain visible and unchanged.
- [ ] Confirm archived `Umum` notes do not increase the active Inbox count.
- [ ] Confirm the migration status appears under Data & Backup when legacy note files exist.
- [ ] Confirm the migration button is disabled before a backup is generated.

## B. Backup gate

- [ ] Click **Backup ZIP**.
- [ ] Confirm the ZIP downloads.
- [ ] Save the ZIP outside the browser's temporary download area or to a safe backup location.
- [ ] Confirm the migration button becomes enabled.
- [ ] Reload the app without generating a new backup; confirm the migration button is disabled again until a fresh backup is generated in that session.

## C. Migration confirmation and result

- [ ] Click the migration button.
- [ ] Confirm the dialog explains that `.md` and `.txt` notes move to the storage root.
- [ ] Cancel once and confirm no Drive files move.
- [ ] Generate a fresh backup again, then confirm migration.
- [ ] Confirm the result reports migrated notes and any remaining unrelated files/folders.
- [ ] Confirm empty `Umum` folder(s) are moved to Google Drive Trash.
- [ ] Confirm an `Umum` folder containing a PDF or nested folder remains in place.
- [ ] Confirm unrelated files and nested folders are not moved or deleted.

## D. Data integrity

Before and after migration, compare a representative set of notes:

- [ ] Drive file IDs remain unchanged.
- [ ] Filenames and titles remain unchanged.
- [ ] Note content remains unchanged.
- [ ] `createdAt` metadata remains unchanged.
- [ ] Tags remain unchanged.
- [ ] Pinned state remains unchanged.
- [ ] Archived state remains unchanged.
- [ ] Notes from other categories remain in their original folders.
- [ ] No duplicate note cards appear after migration.

## E. Inbox behavior after migration

- [ ] Migrated notes remain visible in Inbox.
- [ ] Inbox count matches active uncategorized notes.
- [ ] Archived Inbox notes remain excluded from the active Inbox count.
- [ ] Create a new note with Inbox selected; verify it is saved directly under `storage/`.
- [ ] Assign an Inbox note to a category; verify the Drive file moves to that category folder.
- [ ] Edit the note after moving it; verify no conflict is raised when there is no concurrent edit.
- [ ] Use bulk actions to move a categorized note back to Inbox.
- [ ] Confirm `Umum` is not offered as a normal category.

## F. Backup and restore compatibility

- [ ] Create a new ZIP backup after migration.
- [ ] Inspect the ZIP: Inbox notes should be at the archive root, not under an `Umum/` folder.
- [ ] Confirm the manifest does not list `Umum` as a category.
- [ ] Confirm duplicate note titles in the same category have distinct archive paths and retain their original titles in the manifest.
- [ ] Import a backup created by v1.3.5 containing `Umum/<note>.md`; confirm those notes preview and restore as Inbox.
- [ ] Confirm duplicate detection treats legacy `Umum` notes and new Inbox notes as the same category.
- [ ] Confirm restore does not create an `Umum` folder.

## G. Retry and offline checks

- [ ] Run migration a second time; confirm it is safe and does not duplicate files.
- [ ] If a legacy folder remains due to unrelated files, confirm migration status reports it.
- [ ] Queue an Inbox note edit while offline; reconnect and confirm it syncs to the storage root.
- [ ] Confirm old queued payloads containing `category: "Umum"` are accepted and saved as Inbox.
- [ ] Confirm conflict detection still protects concurrent edits.

## Pass criteria

The migration is ready for production only when all data-integrity, Inbox, backup/restore, and retry checks pass. Record any skipped file, remaining folder, or migration error before proceeding.
