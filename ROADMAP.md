# Hadi KeepFlow Roadmap

This document distinguishes implemented code from work that still requires deployment-level verification. A feature marked implemented in source is not considered live-verified until it has been tested in the deployer's Apps Script and Google Drive environment.

## Release baseline

- Stable public release: **v1.3.5**
- Current development snapshot: **v1.3.6-dev**
- Current workstream: **Phase 3.7.4 — Integration & Reliability**

## Product direction

Hadi KeepFlow is evolving into a Personal Knowledge Management (PKM) system while retaining its lightweight Google Apps Script, Google Drive, Markdown, and LocalStorage architecture.

### Agreed Temporary Inbox behavior

- Inbox is a view for active notes without a category, not a permanent category.
- New notes can be saved without selecting a category.
- Uncategorized notes are stored directly in `storage/`.
- Assigning a category moves the note into `storage/<category>/`.
- Removing a category assignment returns the note to `storage/`.
- Archived notes are excluded from the active Inbox count.
- Deleting a category moves supported note files back to Inbox without deleting or recreating them.
- The legacy `Umum` category is reserved for compatibility and cannot be created as a normal category.

## Phase 3.7 — Workspace & Category Architecture

### 3.7.1 — Workspace Navigation

**Source implementation: complete.**

- Dashboard, Inbox, All Notes, Pinned, Categories, Tags, Archive, and Data & Backup navigation.
- Inbox count and Inbox-specific empty state.
- Navigation views are independent from Drive folder structure.

### 3.7.2 — Temporary Inbox & Legacy Data Migration

**Source implementation: complete; live migration must be run and verified by the deployer.**

- Empty category represents Inbox in frontend and backend.
- New uncategorized notes are saved directly under the Drive storage root.
- `getCategories()` returns actual category folders and excludes `Umum`.
- Older `Umum` folder notes remain readable as Inbox until migrated.
- Added read-only migration status and retryable migration endpoint.
- Migration moves `.md` and `.txt` notes without changing file IDs, names, content, or note metadata.
- Empty legacy `Umum` folders are moved to Drive Trash.
- Non-note files and nested folders are left untouched and reported.
- Backup ZIP stores Inbox notes at archive root and imports older `Umum/` backup paths as Inbox.
- Migration action is gated by a successful Backup ZIP generation in the current browser session.

### 3.7.3 — Category Management

**Source implementation: complete; live Google Drive verification pending.**

- Create categories with case-insensitive duplicate prevention.
- Rename categories by renaming the Drive folder; note files and IDs are not rewritten.
- Delete categories by moving direct `.md` and `.txt` note files to the storage root / Temporary Inbox.
- Preserve note file IDs, names, contents, and embedded metadata during category deletion.
- Support retry after a partial Drive parent update.
- Do not trash a category folder if unsupported files, subfolders, or file-operation errors remain.
- Reserve `Umum` for legacy compatibility; it cannot be created, renamed to, or deleted through normal category management.
- Require online state, a loaded cloud snapshot, and an empty sync queue before rename/delete actions.
- Reject case-insensitive duplicate category names.

### 3.7.4 — Integration & Reliability

**Source implementation complete; live integration verification pending.**

- Hardened duplicate-file resolution during interrupted Drive moves; storage-root representation wins for Inbox.
- Backup snapshot applies the same recovery rule.
- Note saves resolve category folders case-insensitively and return canonical folder names.
- Frontend synchronization adopts canonical category casing without overwriting newer local edits.
- Reviewed Search, Dashboard, Inbox, All Notes, Pinned, Archive, Categories, Tags, Sync Queue, conflict handling, and Backup/Restore integration.
- Added `PHASE-3.7.4-INTEGRATION-RELIABILITY-TEST.md`; test deployment and live Drive checks remain pending.

## Migration safety notes

The migration is explicit, not automatic. Before running it:

1. Deploy the v1.3.6-dev source to a test deployment first.
2. Wait for cloud data to finish loading and pending sync operations to settle.
3. Generate and save a fresh Backup ZIP.
4. Run the migration from **Data & Backup**.
5. Review the migration result and remaining-folder counts.
6. Verify Inbox, categories, note contents, tags, pinned state, archive state, and backup/restore.
7. Keep the backup until verification is complete.

A partial migration is retryable. The migration does not delete note files. A legacy folder containing unrelated files or nested folders is not trashed.

## Later planned phases

- Phase 3.8 — Knowledge Organization.
- Phase 3.9 — Note Linking & Backlinks.
- Phase 4.0 — Knowledge Dashboard.
- Phase 4.1 — Knowledge Discovery.

These are planning directions and may change based on implementation findings.
