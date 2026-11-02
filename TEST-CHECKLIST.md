# v1.3.6 QA and Release Checklist

## Completed locally

- [x] Latest complete source snapshot includes frontend and four GAS backend files.
- [x] Phase 8 source SHA-256 manifest verified.
- [x] Existing Node mock regression harness passed (3 assertion groups).
- [x] Frontend/backend syntax passed; 129 unique HTML IDs, 223 literal ID references with no missing IDs, CSS brace balance and viewport fallback checks passed; no RC1 markers remain in application source.
- [x] Release ZIP integrity verified after packaging.

## Required before production deployment and stable tag

- [ ] Isolated Apps Script deployment and authorization review.
- [ ] Core feature regression against test Google Drive.
- [ ] Backup/restore, including malformed and oversized ZIP cases.
- [ ] Offline queue/reload/reconnect and lost-response retry.
- [ ] Retry of an operation older than seven days; verify no duplicate.
- [ ] Two-session version conflicts and interrupted category move recovery.
- [ ] PropertiesService failure after successful Drive mutation.
- [ ] LocalStorage denied/full behavior for queue, categories, and templates.
- [ ] Browser console/network review and small/medium/large data performance checks.
- [ ] Supported desktop/mobile browser matrix and real-device checks.
- [ ] Record evidence; confirm no data loss, unintended duplicate, or metadata change.
- [ ] Only after all required checks pass: deploy stable v1.3.6 and create Git tag `v1.3.6`.
