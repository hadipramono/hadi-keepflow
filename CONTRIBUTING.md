# Contributing

Thank you for considering a contribution to Hadi KeepFlow.

## Current scope

The current source package is v1.3.5. The next planned work is Phase 3.7 (Workspace & Category Architecture). Please check `ROADMAP.md` and open an issue to discuss substantial changes before starting implementation.

## Development principles

- Preserve Google Drive as the persistent source of truth.
- Preserve the current Apps Script + HTML Service architecture unless a change is explicitly agreed.
- Keep LocalStorage as local cache, drafts, preferences, and offline queue—not as a replacement cloud database.
- Preserve offline queue, conflict detection, retry/idempotency, recovery, and backup/restore behavior.
- Avoid introducing a database, framework migration, AI service, or vector database without an explicit project decision.
- Keep the application single-user unless a complete authentication and authorization design is proposed and reviewed.
- Keep data format changes backward-compatible where practical and document any required migration.

## Pull request expectations

A pull request should include:

1. A clear problem statement and scope.
2. The files changed and why.
3. Compatibility or migration notes.
4. Manual test steps and observed results.
5. Updated changelog or documentation when behavior changes.

Do not claim live Apps Script or Google Drive tests unless they were actually run against a deployed instance.

## Local checks

- Run JavaScript syntax checks for changed `.gs` files using a JavaScript parser compatible with Apps Script V8.
- Extract and syntax-check the JavaScript in `AppScripts.html`.
- Review HTML IDs referenced by `getElementById`.
- Run relevant manual test guides in a dedicated test deployment.

Static checks do not replace browser and Apps Script testing.

## Data and privacy

Never include real personal notes, backup ZIP files, Google account details, private Drive IDs, or deployment credentials in issues, commits, or pull requests. Use synthetic test data.
