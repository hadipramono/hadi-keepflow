# Source Audit Report — Hadi KeepFlow v1.3.6-dev

## Scope

This report covers the v1.3.6-dev source through Phase 3.7.4:
- Apps Script backend (`Code.gs`, `DriveStorage.gs`, `NotesApi.gs`, `SyncOperations.gs`).
- Frontend (`Index.html`, `AppStyles.html`, `AppScripts.html`).
- README, roadmap, changelog, and phase test guides.
- Temporary Inbox storage behavior and legacy migration logic.

## Phase 3.7.2 implementation summary

- Uncategorized notes now use an empty category value and are stored directly under `storage/`.
- Root-level and legacy `Umum` notes are read as Inbox notes.
- `getCategories()` excludes `Umum`.
- Missing, blank, and legacy `Umum` save payloads normalize to Inbox.
- Added `getLegacyInboxMigrationStatus()` and `migrateLegacyInbox()`.
- Migration moves only direct `.md` and `.txt` files from direct `Umum` folders.
- Migration preserves Drive file IDs, filenames, file content, and embedded note metadata.
- Empty legacy folders are trashed; folders containing unrelated files or nested folders remain untouched.
- The migration is retryable and has a narrowly scoped recovery allowance for a file temporarily attached to both `storage/` and `storage/Umum/`.
- Backup ZIP writes Inbox notes at the archive root and restore treats old `Umum/` paths as Inbox.
- ZIP backup paths are unique for same-title notes in the same category; the manifest retains the original title/category.

## Important deployment security constraint

The application has no application-level authentication, per-user authorization, or tenant isolation. A deployment that executes as the owner and is accessible to other people could expose the owner's Drive operations through Apps Script server functions. Keep personal deployments restricted to **Only myself**. Each person should deploy their own Apps Script project and authorize it against their own Google Drive.

## Static and mocked validation performed

- Node.js syntax check passed for all four `.gs` files after copying them to `.js` files for parsing.
- JavaScript extracted from `AppScripts.html` passed `node --check`.
- A mocked Google Drive backend test passed for:
  - legacy `Umum` notes being read as Inbox before migration;
  - real categories excluding `Umum`;
  - backup snapshot excluding `Umum` as a category;
  - migration moving notes from multiple case-variant legacy folders into the storage root;
  - retrying migration without moving or recreating already-migrated notes;
  - empty legacy folders being trashed while folders with unrelated files/nested folders remain;
  - unrelated PDF files and nested folders remaining untouched;
  - Drive file ID and file content remaining unchanged;
  - blank and legacy `Umum` save payloads both being saved as Inbox.
- `Index.html` contains 117 unique IDs with no duplicates; all 109 literal `getElementById()` references resolve.
- A static scan of local Markdown links found no broken relative links.
- ZIP packaging checks verify required documentation and source files are present and no nested ZIP archive is included.

## Not verified

This work did not deploy the project to Apps Script and did not access the owner's Google Drive. It does not prove:
- Apps Script runtime correctness.
- Real Google Drive parent operations, authorization, or quota behavior.
- Browser UI behavior on desktop/mobile.
- ZIP download behavior in the actual deployment.
- Live migration on production data.
- Offline queue behavior across real devices.
- Full backup/restore correctness against live user data.
- Full security correctness.

Run `TEMPORARY-INBOX-MIGRATION-TEST.md` in a test deployment and save a fresh backup before migration.


## Phase 3.7.3 — Category Management

### Source changes

- Added case-insensitive category folder lookup and duplicate prevention.
- Added dedicated category rename behavior; Drive folder is renamed without rewriting note files.
- Category deletion moves `.md` and `.txt` files into Temporary Inbox, preserving file IDs, names, content, and embedded metadata.
- Unsupported files and nested folders are not trashed. The category folder remains until all contents are handled.
- Added retry handling for the exact two-parent state created by an interrupted Drive move.
- Frontend rename/delete operations are blocked while the cloud is unavailable, sync is active, pending note operations/category creates exist, or an editor draft is dirty.

### Validation

- Node syntax checks passed for all backend `.gs` files and frontend JavaScript.
- Mocked Drive test passed for category create idempotency, rename preservation, note migration to Inbox, unsupported PDF retention, retry, two-parent ownership validation, and nested-folder protection.
- `Index.html` contains 117 unique IDs with no duplicates; all 109 literal `getElementById()` references resolve.
- Local Markdown link scan found no broken relative links.

Live Apps Script and Google Drive behavior remains unverified; use `CATEGORY-MANAGEMENT-TEST.md` in a dedicated test deployment.


## Phase 3.7.4 — Integration & Reliability

### Source changes

- `getNotes()` and `getBackupSnapshot()` now prefer the storage-root representation when the same Drive file is temporarily visible through both the root and a former category folder.
- `saveNote()` resolves category folders case-insensitively and returns the canonical Drive folder name, preventing case-only duplicate category folders during restore or stale/imported writes.
- The frontend adopts acknowledged canonical category casing only when the local category still matches the acknowledged save, preserving newer local edits.
- Added an integration/reliability test guide covering workspace filters, search, dashboard, category lifecycle, interrupted moves, offline queue, conflicts, and backup/restore.

### Validation performed

- Backend `.gs` sources concatenated to a temporary `.js` file passed `node --check`.
- JavaScript extracted from `AppScripts.html` passed `node --check`.
- Repeatable `node tests/phase-3.7.4-regression.test.js` mock regression checks passed for case-insensitive category save, Inbox-first de-duplication in `getNotes()`, and Inbox-first de-duplication in backup snapshots.
- `Index.html` contains 117 unique IDs with no duplicates; all 195 literal `getElementById()` references resolve.
- Local Markdown relative-link scan found no broken links.

Live Apps Script, browser, multi-device/offline, and Google Drive verification remains pending. Run `PHASE-3.7.4-INTEGRATION-RELIABILITY-TEST.md` in a separate test deployment before production use.
