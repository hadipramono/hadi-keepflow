# Changelog — v1.3.6

- Prepared the stable version metadata from the latest complete Phase 8 source snapshot.
- Retained the Phase 7 dashboard rendering optimization.
- Preserved Google Drive as the source of truth and LocalStorage for cache, draft, and offline queue.
- No new product features or architectural changes.
- Release QA findings, verification boundaries, and unresolved live gates are documented in `RELEASE-AUDIT.md` and `TEST-CHECKLIST.md`.

## v1.3.7 — Mobile Editor Experience (candidate)

- Added a collapsed-by-default mobile formatting toolbar with a `Format` toggle and horizontal scrolling when expanded.
- Added a mobile overflow menu for Pin, Archive/Restore, and Delete while keeping Save visible.
- Improved mobile editor spacing, touch targets, and visual viewport handling for virtual keyboard changes.
- Preserved editor selection around formatting and checklist interactions.
- Kept desktop toolbar behavior and existing backend/storage contracts unchanged.
- Automated source and regression checks passed; real-device and live Apps Script verification remain outstanding.
