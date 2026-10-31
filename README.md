# Hadi KeepFlow

Personal notes application using Google Apps Script, Google Drive Markdown files, and browser LocalStorage for offline/local state.

## Current package

**v1.2.3 — Tahap 1.4: Conflict Detection & Version Control**

### Components
- `Index.html`: frontend SPA with durable sync queue, offline reconciliation, and explicit conflict resolution.
- `Code.gs`: Apps Script backend with Drive ownership checks and optimistic version checks for update/delete.

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
- Existing notes carry a `baseUpdatedAt` version token; stale save/delete requests return a conflict instead of overwriting cloud data.
- Conflict resolution requires an explicit local-vs-cloud choice.

## Installation
See `INSTALL.md`. Run all four test guides after deployment:
- `SYNC-QUEUE-TEST.md`
- `OFFLINE-RECONCILIATION-TEST.md`
- `BACKEND-SECURITY-TEST.md`
- `CONFLICT-VERSION-TEST.md`

## Important limitations
- Version detection uses Drive modification timestamps, not a content hash or atomic Drive ETag precondition. Avoid direct manual edits to stored Markdown files while KeepFlow is in use.
- Browser, Apps Script deployment, and live Google Drive validation must be completed by the project owner.
