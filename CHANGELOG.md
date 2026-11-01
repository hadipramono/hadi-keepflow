# Changelog

This file summarizes notable project releases. Detailed phase notes remain in the corresponding `CHANGELOG-*.md` files.

## v1.3.6-dev — Phase 3.7.1: Workspace Navigation

- Reorganized the sidebar into Workspace, Organization, and Data & Backup areas.
- Added Inbox navigation with an active uncategorized/legacy `Umum` note count.
- Added Inbox-specific filtering and empty-state messaging.
- Displayed legacy `Umum` notes as Inbox in note cards and category selectors.
- Kept the existing Drive folder layout and stored note metadata unchanged; migration is deferred to Phase 3.7.2.
- Kept Dashboard, All Notes, Pinned, Categories, Tags, Archive, and backup/restore entry points.

This is a development snapshot, not a published stable release. Full Temporary Inbox storage semantics are not included yet.

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
