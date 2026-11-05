# Hadi KeepFlow — Mobile Editor Experience v0.1.0

**Implementation baseline:** v1.3.6 source ZIP  
**Target release:** v1.3.7 (candidate; not deployed)  
**Scope:** Frontend-only editor enhancement

## Implemented

- Mobile editor opens without forcing focus or opening the virtual keyboard.
- Mobile formatting toolbar is collapsed by default behind an accessible `Format` toggle.
- Expanded toolbar remains a single horizontally scrollable row.
- Toolbar controls use touch-friendly minimum dimensions.
- Pin, Archive/Restore, and Delete are grouped into a mobile overflow menu; existing action handlers are reused.
- Save remains visible in the editor header.
- Visual viewport resize/scroll events update the editor modal height and offset when supported.
- Content selection is captured and restored around toolbar interactions, including checklist insertion.
- Desktop retains visible formatting toolbar and automatic editor focus.
- Editor metadata and spacing are more compact on mobile.

## Files changed

- `Index.html`
- `AppStyles.html`
- `AppScripts.html`
- `VERSION.txt`
- `CHANGELOG.md`
- `CHANGELOG-v1.3.7.md`
- `MOBILE-EDITOR-EXPERIENCE-v0.1.0.md`
- `MOBILE-EDITOR-EXPERIENCE-TEST.md`
- `tests/mobile-editor-experience.test.js`

## Explicitly unchanged

- All backend `.gs` files.
- Google Drive storage layout and data format.
- LocalStorage keys and offline queue format.
- Backup/restore format.
- Server API contracts.

## Validation boundary

Static source checks and Node regression tests can verify markup hooks, JavaScript syntax, CSS behavior declarations, and existing mocked backend regressions. They cannot prove actual virtual-keyboard behavior, touch selection behavior, or layout correctness in Android Chrome/iOS Safari. Real-device and deployed Apps Script tests remain required before release.
