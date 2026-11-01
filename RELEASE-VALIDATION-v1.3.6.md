# Release Validation — v1.3.6

## Source/package checks

- [x] All seven application source files are included (four `.gs`, three `.html`).
- [x] Backend Apps Script sources pass Node syntax parsing when concatenated for static checking.
- [x] Frontend JavaScript extracted from `AppScripts.html` passes Node syntax parsing.
- [x] `Index.html` contains 117 unique IDs.
- [x] All 195 literal `getElementById()` references resolve to existing IDs.
- [x] Phase 3.7.4 Node mock regression tests pass.
- [x] Local Markdown relative-link scan reports no broken links.
- [x] Release ZIP integrity verified.

## Deployment/live checks — required before stable release

- [ ] Deploy to a separate test Apps Script project.
- [ ] Verify workspace views, Inbox, categories, tags, search, and Dashboard in a browser.
- [ ] Verify category create, rename, and delete against a test Drive folder.
- [ ] Verify legacy `Umum` migration after generating and saving a Backup ZIP.
- [ ] Verify interrupted Drive move recovery and file ID preservation.
- [ ] Verify offline queue, reload while offline, reconnect, and conflict detection.
- [ ] Verify backup ZIP contents and restore into a separate test storage folder.
- [ ] Confirm no note loss, unexpected duplicates, or metadata changes.

## Release classification

GitHub pre-release. Source implementation is packaged; live Apps Script and Google Drive behavior has not been verified by the release preparer. Do not treat this package as production-stable until all deployment/live checks above pass.
