# v1.3.6-dev — Phase 3.7.4: Integration & Reliability

- Prefer the storage-root representation when de-duplicating notes exposed through both Inbox and a former category parent during interrupted Drive moves.
- Apply the same Inbox-first recovery rule to atomic backup snapshots.
- Resolve note-save destinations case-insensitively to prevent duplicate category folders that differ only by capitalization.
- Return canonical Drive category names from note saves and reconcile acknowledged local category casing safely.
- Add repeatable Node mock regression tests and a manual integration checklist for workspace views, offline sync, conflicts, migration, and backup/restore.

Live Apps Script, browser, multi-device/offline, and Google Drive verification remains pending.
