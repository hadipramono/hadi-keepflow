# Hadi KeepFlow v1.3.0.1 — Backup & Restore Progress UI

## Changes
- Added a modal progress dialog for Backup ZIP and Restore / Import ZIP.
- Backup shows cloud snapshot preparation, note collection, and JSZip compression progress.
- Restore shows ZIP inspection, per-file extraction/validation, category creation, per-note saving, and local cache refresh progress.
- Added indeterminate progress animation while the browser waits for the Apps Script snapshot or opens the ZIP archive.
- Added accessible progress semantics (`role=progressbar`, `aria-valuenow`) and a completion/error state.
- The restore process remains merge-only and sequential; this update does not change backup format or Drive data behavior.

## Validation
- Frontend JavaScript syntax: PASS.
- Backend JavaScript syntax: PASS.
- Static checks for dialog, styles, backup progress, restore progress, and completion control: PASS.
- Live browser and Apps Script deployment behavior still requires user testing.
