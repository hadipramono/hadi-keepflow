# Sync Recovery Test — v1.2.4 / Tahap 1.5

Run after deploying both `Code.gs` and `Index.html`. Use a disposable test note.

## A. Retry and backoff
1. Open DevTools Network and temporarily block the Apps Script request (or test while offline).
2. Edit a note. Confirm the note remains visible and its operation remains in LocalStorage key `hadi_keepflow_pending_v1`.
3. Restore the network. Confirm the app retries after a delay rather than continuously looping.
4. Repeat with several simulated failures. Confirm the delay increases and is capped at approximately five minutes.
5. Confirm after ten consecutive failures the automatic retry stops and **Coba lagi** appears.
6. Restore service and click **Coba lagi**. Confirm the queue resumes and clears only after success.

## B. Reload and recovery
1. Queue an edit while offline.
2. Close the tab before reconnecting.
3. Reopen the Web App while online.
4. Confirm the app loads the cloud baseline first, retains the pending local edit, then synchronizes it.
5. Confirm the queue is empty after successful acknowledgement.

## C. Retry-safe save (idempotency)
1. Create a new test note and observe the corresponding save request.
2. Simulate a lost client response after the backend has completed the save (for example, interrupt the browser connection immediately after submission).
3. Allow the same queued operation to retry.
4. Confirm only one Drive Markdown file exists for that operation and the response resolves to the existing file.
5. Repeat for an update to an existing test note; confirm no duplicate file is created.

## D. Retry-safe delete
1. Create and synchronize a disposable note.
2. Queue its deletion and simulate a lost client response after backend completion.
3. Allow the same operation to retry.
4. Confirm the note remains deleted and the retry is acknowledged without a second destructive action.

## E. Regression checks
- Run `SYNC-QUEUE-TEST.md`.
- Run `OFFLINE-RECONCILIATION-TEST.md`.
- Run `BACKEND-SECURITY-TEST.md`.
- Run `CONFLICT-VERSION-TEST.md`.

## Expected result
- Failed operations remain durable in LocalStorage.
- Retries use the same `opId` and do not duplicate a successful save.
- Automatic retry is bounded; manual retry remains available after the limit.
- No queued operation is removed before a successful acknowledgement or explicit conflict resolution.

## Evidence to collect if a test fails
- Browser console output.
- Current queue entry (redact note content if private; retain `opId`, `type`, `attempts`, `nextAttemptAt`).
- Apps Script > Executions result and timestamp.
- Whether a Drive file was created, updated, or trashed.
