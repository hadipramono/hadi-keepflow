# Hadi KeepFlow v1.3.7 — Mobile Editor Experience (Candidate)

## Highlights

- Added a collapsed-by-default mobile formatting toolbar with a `Format` toggle.
- Kept the expanded mobile toolbar on one horizontally scrollable row.
- Added a mobile overflow menu for Pin, Archive/Restore, and Delete while keeping Save visible.
- Prevented automatic editor focus on mobile so opening a note does not intentionally summon the virtual keyboard.
- Added visual viewport handling for mobile keyboard and browser viewport changes.
- Improved mobile editor spacing and touch target sizing.
- Strengthened selection preservation around formatting and checklist toolbar interactions.
- Preserved the existing desktop toolbar and action handlers.

## Compatibility and data safety

- No backend `.gs` files changed.
- No Google Drive storage layout, metadata schema, or Markdown format changed.
- No LocalStorage keys, offline queue schema, backup format, or server API contracts changed.
- No new runtime dependencies introduced.

## Validation

- Frontend JavaScript syntax: passed.
- Mobile editor static regression tests: passed.
- Existing Phase 3.7.4 mocked backend regression tests: passed.
- Live Android/iOS browser, Apps Script deployment, and Google Drive operations: not run.

This is an implementation candidate. Complete the manual device checklist and live deployment verification before stable release.
