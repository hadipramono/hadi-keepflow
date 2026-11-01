# Hadi KeepFlow v1.3.6 — Workspace & Category Architecture

> **Pre-release:** source implementation is packaged, but live Apps Script and Google Drive verification is still pending. Do not treat this version as production-stable until the live validation checklist is complete.

## Highlights

- Added Workspace navigation: Dashboard, Inbox, All Notes, Pinned, Categories, Tags, Archive, and Data & Backup.
- Introduced Temporary Inbox semantics. Notes without a category are stored directly in the Google Drive `storage/` root.
- Added explicit, backup-gated, retryable migration for legacy notes stored in `Umum/` folders.
- Added category creation, rename, and deletion with case-insensitive duplicate prevention.
- Category deletion moves supported `.md` and `.txt` notes to Inbox while preserving Drive file IDs, filenames, content, and embedded metadata.
- Improved recovery from interrupted Drive moves and duplicate parent representations.
- Improved category-name canonicalization during note saves and backup snapshots.
- Added implementation documentation, manual regression checklists, and repeatable Node mock regression tests.

## Upgrade from v1.3.5

1. Generate and save a fresh Backup ZIP before upgrading.
2. Replace all four backend files: `Code.gs`, `DriveStorage.gs`, `NotesApi.gs`, and `SyncOperations.gs`.
3. Replace all three frontend files: `Index.html`, `AppStyles.html`, and `AppScripts.html`.
4. Keep the existing Google Drive `apps/KeepFlow/storage/` folder. Do not delete LocalStorage during upgrade.
5. Deploy first to a separate test Apps Script project and run `RELEASE-VALIDATION-v1.3.6.md`.
6. Legacy `Umum/` notes remain readable as Inbox notes. Migration is explicit; generate and save a Backup ZIP in the current browser session before running it.

## Validation

**Passed locally:** backend and frontend JavaScript syntax checks, Phase 3.7.4 Node mock regression tests, HTML ID/reference checks, Markdown relative-link checks, and ZIP integrity check.

**Still required:** live Apps Script deployment, browser UI verification, real Google Drive operations, offline/multi-device synchronization, and backup/restore validation. See `RELEASE-VALIDATION-v1.3.6.md`.

## Security

Hadi KeepFlow is a single-user personal application. Deploy your own Apps Script instance with access restricted to **Only myself**. Do not expose an owner-executed deployment publicly. See `SECURITY.md`.
