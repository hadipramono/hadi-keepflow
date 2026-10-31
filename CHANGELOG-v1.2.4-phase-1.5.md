# Changelog v1.2.4 — Tahap 1.5: Reliability & Recovery

## Frontend (`Index.html`)
- Added persisted retry metadata: attempt count, next retry time, and last error summary.
- Added exponential backoff with jitter, capped at five minutes.
- Automatic retries stop after ten consecutive failures; a manual **Coba lagi** action becomes available.
- Retry scheduling is restored from LocalStorage after reload; visibility/pageshow lifecycle events help recover delayed timers.
- Reconnect still reconciles the cloud baseline before replaying queued operations.
- The existing durable queue remains the recovery log; no queue key migration or clearing is required.

## Backend (`Code.gs`)
- `saveNote` and `deleteNote` accept an optional operation ID.
- Script Properties store compact seven-day idempotency receipts.
- Replaying a successful save returns the already-created/updated Drive note instead of creating another file.
- Replaying a successful delete returns success without repeating a destructive action.
- Expired KeepFlow receipts are pruned when a new receipt is stored.
- Existing callers remain compatible because the operation ID is optional.

## Important behavior
- A retry uses the same operation ID. Do not generate a new ID when retrying the same queued operation.
- Automatic retries are bounded. After ten failures, inspect Apps Script executions and connectivity, then use **Coba lagi**.
- Receipts expire after seven days. They are a retry-safety window, not a permanent audit log.
- Browser timers may be suspended while a tab is closed; retry metadata remains persisted and is reconsidered when the app is reopened.

## Validation scope
- JavaScript syntax checks and static consistency checks are performed on the package.
- Live multi-browser, Apps Script, and Google Drive tests remain required before production use.
