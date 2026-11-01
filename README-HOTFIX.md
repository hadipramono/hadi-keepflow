# Hadi KeepFlow v1.3.6 — Template Management Hotfix

This is a **patch package**, not a complete application source archive.

## Replace these files in Apps Script

- `Index.html`
- `AppScripts.html`
- `AppStyles.html`

Keep all existing backend `.gs` files unchanged.

## Features

- Manage note templates from the editor using **Kelola**.
- Create, edit, delete, and restore built-in templates.
- Template content is sanitized with the existing editor sanitizer.
- Template definitions are stored in this browser's LocalStorage, not Google Drive. They do not sync across browsers/devices and are not included in note Backup ZIP.
- The completed legacy Inbox migration notice, button, status polling, and frontend migration action have been removed from the UI.
- Internal compatibility normalization remains for older local drafts, queued operations, and imported backup paths.

See `TEMPLATE-MANAGEMENT-HOTFIX.md` and `TEMPLATE-MANAGEMENT-TEST.md`.
