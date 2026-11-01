# Phase 3.7.2 — Temporary Inbox & Legacy Data Migration

## Status

Source implementation complete in development snapshot `v1.3.6`. Live Google Apps Script and Google Drive migration is not verified by static or mock testing; the deployer must run the manual checklist.

## Storage contract

| Note category | Drive location | API category |
|---|---|---|
| Uncategorized / Inbox | `storage/<note>.md` | `""` |
| Categorized | `storage/<category>/<note>.md` | Category name |
| Legacy v1.3.5 note | `storage/Umum/<note>.md` until migration | `""` when read |

`Umum` is a compatibility alias for Inbox. It is not returned as a real category and cannot be created, renamed to, or deleted through category APIs.

## Backend changes

### `DriveStorage.gs`
- Root-level notes parse with an empty category.
- Ownership validation accepts a direct storage parent, a direct category folder, or the narrowly scoped two-parent state (`storage/` plus direct `storage/Umum/`) that can occur if a migration is interrupted after adding the destination parent.

### `NotesApi.gs`
- `getNotes()` reads root notes and legacy `Umum` notes as Inbox, and de-duplicates results by Drive file ID.
- `getBackupSnapshot()` excludes `Umum` from the category list and returns Inbox notes with an empty category.
- `getCategories()` returns only real category folders.
- `getLegacyInboxMigrationStatus()` reports legacy note files, unrelated files, and nested folders.
- `migrateLegacyInbox()` moves only `.md` and `.txt` files from direct `Umum` folders to the storage root.
- Migration preserves Drive file IDs, filenames, contents, and embedded JSON metadata.
- The migration is retryable. Empty legacy folders are trashed; non-empty folders containing unrelated files or nested folders are left in place and reported.
- `validateNotePayload()` normalizes missing, blank, or legacy `Umum` categories to an empty category.
- `saveNote()` writes uncategorized notes directly to the storage root.

### `SyncOperations.gs`
- Retry receipt replay interprets root and legacy `Umum` notes as Inbox.

## Frontend changes

### `AppScripts.html`
- No default `Umum` category is injected into category state.
- Legacy local cache values and old queued payloads are normalized as Inbox.
- Editor category selector provides `Inbox (tanpa kategori)` as an empty value.
- Bulk category action can move selected notes to Inbox.
- Search/category filtering uses normalized category values.
- Backup ZIP writes Inbox notes at the archive root.
- ZIP paths are made unique when multiple notes have the same title in the same category; manifest metadata preserves original title/category.
- Restore imports older `Umum/<note>.md` paths as Inbox.
- A migration action is shown when legacy `Umum` content exists. It is enabled only after a Backup ZIP is generated in the current browser session.

### `Index.html`
- Adds a migration action and status text under Data & Backup.

## Migration behavior and limits

- Migration is explicit and requires confirmation.
- The UI asks the user to create a backup in the current session before enabling migration.
- Only direct `.md` and `.txt` files inside direct `Umum` folders are migrated.
- Other files and nested folders are not moved or deleted.
- Empty `Umum` folders are moved to Google Drive Trash.
- If a migration is interrupted, rerun it after reviewing status. Notes already moved to `storage/` are not recreated.
- Existing local sync operations are not discarded. Old `category: "Umum"` save payloads are normalized by the backend to Inbox.

## Validation performed

- Node syntax check passed for all four `.gs` files (checked as JavaScript source).
- Node syntax check passed for JavaScript extracted from `AppScripts.html`.
- Mocked Drive test covered:
  - legacy `Umum` note returned as Inbox before migration;
  - real categories exclude `Umum`;
  - backup snapshot excludes `Umum` as a category;
  - migration moves legacy notes from multiple case-variant `Umum` folders to storage root;
  - rerunning migration does not move or recreate already-migrated notes;
  - empty legacy folders are trashed while folders containing unrelated files/nested folders remain;
  - non-note files and nested folders remain untouched;
  - note ID and file content remain unchanged;
  - blank category and legacy `Umum` save payloads both save as Inbox.
- Static HTML ID and reference checks are recorded in `AUDIT-REPORT.md`.

## Not verified

- Actual Apps Script runtime behavior.
- Actual Google Drive file-parent behavior and permissions.
- Browser-triggered ZIP download and user confirmation.
- Live migration on the owner's Drive.
- Real offline queue behavior across devices.
- Full backup/restore against a live deployment.

Use `TEMPORARY-INBOX-MIGRATION-TEST.md` before running the migration on production data.
