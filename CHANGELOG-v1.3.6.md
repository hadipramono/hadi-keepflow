# Hadi KeepFlow v1.3.6 — Phase 3.7: Workspace & Category Architecture

## Highlights

- Added dedicated Workspace navigation for Dashboard, Inbox, All Notes, Pinned, Categories, Tags, Archive, and Data & Backup.
- Introduced Temporary Inbox semantics: notes without a category are stored directly in the Drive `storage/` root.
- Added an explicit, backup-gated, retryable migration for legacy notes in `Umum/` folders.
- Added category creation, rename, and deletion with case-insensitive duplicate protection.
- Category deletion moves supported Markdown/text notes to Inbox while preserving Drive file IDs, filenames, content, and embedded metadata.
- Added recovery handling for interrupted Drive moves and duplicate parent representations.
- Improved category canonicalization during note saves and backup snapshots.
- Added phase implementation notes, manual regression checklists, and a repeatable Node mock regression test.

## Upgrade notes

- From v1.3.5, replace all four backend `.gs` files and all three frontend `.html` files.
- Do not replace or delete the existing Google Drive `apps/KeepFlow/storage/` folder.
- Back up the current data before upgrading.
- Legacy `Umum/` notes remain readable as Inbox notes. Migration is explicit and should only be run after generating and saving a Backup ZIP in the current browser session.
- Review `INSTALL.md`, `SECURITY.md`, and `TEMPORARY-INBOX-MIGRATION-TEST.md` before deployment.

## Validation status

- Backend and frontend JavaScript syntax checks: passed.
- Phase 3.7.4 Node mock regression tests: passed.
- HTML ID/reference and Markdown relative-link checks: passed.
- Live Apps Script deployment, real Google Drive operations, browser UI, multi-device/offline behavior, and live ZIP restore: not verified in this release preparation.

This GitHub release is marked as a **pre-release** until live validation and stabilization are complete.


### Editor layout hotfix
- Fix editor content overlapping word/character/task metrics and tag input on long notes.
- Keep the editor body as the scroll container and allow the editable content to grow naturally with its content.
- Prevent metrics and tag controls from shrinking over the editable area.
