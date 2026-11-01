# Changelog

This file summarizes notable project releases. Detailed phase notes remain in the corresponding `CHANGELOG-*.md` files.

## v1.3.6-dev — Phase 3.7.1: Workspace Navigation

- Reorganized the sidebar into Workspace, Organization, and Data & Backup areas.
- Added Inbox navigation with an active uncategorized/legacy `Umum` note count.
- Added Inbox-specific filtering and empty-state messaging.
- Displayed legacy `Umum` notes as Inbox in note cards and category selectors.
- Kept the existing Drive folder layout and stored note metadata unchanged at the 3.7.1 stage; migration was deferred to Phase 3.7.2.
- Kept Dashboard, All Notes, Pinned, Categories, Tags, Archive, and backup/restore entry points.

At the Phase 3.7.1 implementation stage, this was a transitional Inbox presentation. Phase 3.7.2 below completes the uncategorized storage and migration work.

## Repository preparation (documentation and security defaults)

- Reworked GitHub-facing README and installation guide.
- Added security, contribution, roadmap, and source-audit documentation.
- Removed unrestricted `ALLOWALL` framing override from the web entry point.
- Removed the application header's dependency on a project-specific Google Drive image.
- Updated stale backend source version headers.

These repository-readiness changes do not implement Phase 3.7 and do not change the declared application feature version.

## v1.3.5 — Phase 3.6: Productivity Features

- Added reusable note templates.
- Added interactive checklist support and completion metrics.
- Preserved the existing note body format and synchronization architecture.

See `CHANGELOG-v1.3.5-phase-3.6.md`.


## v1.3.6-dev — Phase 3.7.2: Temporary Inbox & Legacy Data Migration

- Uncategorized notes now use an empty category and are stored directly under the Drive storage root.
- Legacy `Umum` folders are treated as Inbox sources until migrated.
- Added a read-only legacy migration status API and a retryable migration API.
- Added a migration action that requires a Backup ZIP generated in the current browser session.
- Migration preserves Drive file IDs, filenames, contents, and note metadata.
- Empty legacy `Umum` folders are moved to Drive Trash; unrelated files and nested folders are left untouched.
- Backup ZIP now stores Inbox notes at the archive root and omits `Umum` as a category.
- Restore remains compatible with older ZIP backups containing `Umum/` paths.
