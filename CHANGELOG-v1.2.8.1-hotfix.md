# Hadi KeepFlow v1.2.8.1 — Hotfix

## Fixed
- Corrected an unclosed documentation comment in `DriveStorage.gs` that caused `getUniqueFolderByName()`, `getOrCreateSubFolder()`, and `getStorageFolder()` to be parsed as comments.
- Restored the storage-folder helper functions required by `getNotes()`, `saveNote()`, `deleteNote()`, and category operations.

## Scope
- No data format, LocalStorage key, sync queue, or API contract changes.
- Only `DriveStorage.gs` changes from v1.2.8.
