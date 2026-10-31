# Hadi KeepFlow

Personal notes application using Google Apps Script, Google Drive Markdown files, and browser LocalStorage for offline/local state.

## Current package

**v1.2.6 — Tahap 2.2: UX & Navigation**

### Components
- `Index.html`: frontend SPA with durable sync queue, offline reconciliation, explicit conflict resolution, bounded retry scheduling, cached frontend rendering, responsive sidebar navigation, active-view context, empty states, and persistent sync status.
- `Code.gs`: Apps Script backend with Drive ownership checks, optimistic version checks, and retry idempotency receipts.

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
- Pending sync operations retain immutable payload snapshots and stable operation IDs.
- Queue metadata and note snapshots are persisted in LocalStorage.
- Reconnect triggers cloud baseline reconciliation before queued writes are replayed.
- Local pending saves/deletes are preserved during reconciliation.
- Backend verifies a file's Drive parent chain before update or delete.
- Drive mutations use `LockService` and stale save/delete requests return conflicts.
- Conflict resolution requires an explicit local-vs-cloud choice.
- Retry uses exponential backoff with jitter, capped at five minutes, and stops after ten consecutive failures pending manual retry.
- Backend idempotency receipts make retrying the same operation ID safe after a lost browser response. Receipts are retained for seven days.

## Installation
See `INSTALL.md`. Run the test guides after deployment:
- `SYNC-QUEUE-TEST.md`
- `OFFLINE-RECONCILIATION-TEST.md`
- `BACKEND-SECURITY-TEST.md`
- `CONFLICT-VERSION-TEST.md`
- `SYNC-RECOVERY-TEST.md`
- `PERFORMANCE-UX-TEST.md`
- `UX-NAVIGATION-TEST.md`

## Important limitations
- Version detection uses Drive modification timestamps, not a content hash or atomic Drive ETag precondition. Avoid direct manual edits to stored Markdown files while KeepFlow is in use.
- Idempotency receipts are temporary Script Properties, not a permanent audit log. The retry guarantee applies to the same operation ID during the receipt retention window.
- Browser, Apps Script deployment, and live Google Drive validation must be completed by the project owner.
