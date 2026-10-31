# Hadi KeepFlow v1.3.0 — Phase 3.1: Data Portability & Backup

## Scope
- ZIP backup of cloud notes and category structure.
- ZIP restore/import with preview before writing.
- Markdown `.md` and `.txt` import support.
- Manifest with format/schema version, category list, note count, timestamps, and source note references.
- Duplicate detection by normalized category + title, with exact-content duplicates and differing-content title conflicts skipped.
- Restore is merge-only: existing notes are never deleted or overwritten.
- Empty categories listed in a KeepFlow backup are recreated.
- Note metadata (pinned, archived, tags, createdAt) is preserved in the existing KeepFlow `---JSON---` envelope.

## Safety
- Backup requires online state, a completed cloud load, and an empty sync queue.
- Restore requires online state and an empty sync queue.
- ZIP size limit: 25 MB; note count limit: 2,000; individual note content limit: 500,000 characters.
- Restore writes notes sequentially and reports partial completion if a later write fails. Re-running the same archive skips already imported exact duplicates.
- Conflicting category/title pairs with different content are skipped; no overwrite option is provided.
- No existing Drive notes are deleted during restore.

## Implementation
- Client-side ZIP generation/parsing with JSZip 3.10.1.
- Adds `getBackupSnapshot` to read notes and categories under one Drive script lock.
- Reuses existing `createCategoryFolder` and `saveNote` APIs for restore.
- Google Drive remains the source of truth; LocalStorage is updated only after acknowledged cloud writes.

## Validation
- Frontend JavaScript syntax checked with Node.js.
- Backend Apps Script syntax checked with Node.js.
- ZIP creation and live Google Drive behavior must still be tested in the user's deployed Apps Script environment.
