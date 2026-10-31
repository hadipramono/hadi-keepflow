# Hadi KeepFlow

Personal notes application using Google Apps Script, Google Drive Markdown files, and browser LocalStorage for offline/local state.

## Current package

**v1.2.2 — Tahap 1.3: Backend Security & Data Integrity**

### Components
- `Index.html`: frontend SPA. v1.2.1 frontend with durable sync queue and offline reconciliation.
- `Code.gs`: Apps Script backend. v1.2.2 ownership checks for Drive update/delete operations.

### Storage layout

```text
My Drive/
└── apps/
    └── KeepFlow/
        └── storage/
            ├── Umum/
            │   └── note.md
            └── Work/
                └── project.md
```

Files directly under `storage` are also accepted as notes in category Umum for compatibility with the reader.

## Main safeguards
- Pending sync operations retain immutable payload snapshots.
- Reconnect triggers cloud baseline reconciliation.
- Local pending saves/deletes are preserved during reconciliation.
- Backend verifies a file's Drive parent chain before update or delete.
- Missing nonlocal IDs and ambiguous folder structures are rejected instead of silently creating or mutating files.
- Drive mutations use `LockService`.

## Installation
See `INSTALL.md`. Run all three test guides after deployment:
- `SYNC-QUEUE-TEST.md`
- `OFFLINE-RECONCILIATION-TEST.md`
- `BACKEND-SECURITY-TEST.md`

## Important limitations
- No cross-device version/ETag conflict detection yet.
- Browser, Apps Script deployment, and live Google Drive validation must be completed by the project owner.
