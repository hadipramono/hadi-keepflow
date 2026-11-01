# Phase 3.7.4 — Integration & Reliability

## Status

Source implementation and local regression checks are complete in development snapshot `v1.3.6-dev`. Live Apps Script, browser, and Google Drive verification remain pending.

## Scope

This phase hardens the integration points introduced by Temporary Inbox and Category Management. It does not change the product architecture or Markdown storage format.

## Source changes

### Drive move recovery and Inbox consistency

- `getNotes()` de-duplicates by immutable Drive file ID and now keeps the first representation encountered. Since storage-root files are collected before category folders, an interrupted move with both `storage/` and category parents is represented as Inbox.
- `getBackupSnapshot()` applies the same root-first rule so a backup taken during a recoverable two-parent state does not incorrectly record the note under its former category.
- The narrow two-parent ownership allowance remains limited to the storage root plus one direct category folder.

### Category canonicalization

- `saveNote()` now resolves the destination category case-insensitively, matching category create/rename behavior.
- Saving or restoring a note whose category differs only by letter casing reuses the existing Drive folder rather than creating a second folder.
- The saved note response returns the actual Drive folder name as its canonical category.
- The frontend adopts canonical category casing after an acknowledged save only when the current local category still matches that operation; a newer local category edit is not overwritten.

### Search, workspace, and data portability review

- Reviewed Inbox, All Notes, Pinned, Archive, category, and tag filtering against empty-category semantics.
- Reviewed dashboard active/archive/pinned/category counts and search matching across title, content, category, and tags.
- Reviewed backup snapshot, ZIP path generation, legacy `Umum/` import, category restoration, and merge-only restore behavior.
- Reviewed category rename/delete guards against active sync, pending note operations, pending category creates, and dirty editor drafts.

## Validation performed

- Backend `.gs` sources concatenated to a temporary `.js` file passed `node --check`.
- JavaScript extracted from `AppScripts.html` passed `node --check`.
- Repeatable Node mock regression test `tests/phase-3.7.4-regression.test.js` passed for case-insensitive category save reusing the canonical folder, `getNotes()` preferring the storage-root representation during a two-parent recovery state, and `getBackupSnapshot()` applying the same Inbox preference.
- `Index.html` contains 117 unique IDs with no duplicates; all 195 literal `getElementById()` references resolve.
- Local Markdown relative-link scan found no broken links.

## Not verified

No Apps Script deployment, real Google Drive operation, browser UI session, multi-device/offline session, or live ZIP download/restore was performed. Those checks require the deployer's Google account and Apps Script environment.

## Exit criteria

Before treating this phase as production-ready, run `PHASE-3.7.4-INTEGRATION-RELIABILITY-TEST.md` in a separate test deployment and confirm the Drive file IDs and contents remain unchanged throughout category rename, deletion, recovery, backup, and restore.
