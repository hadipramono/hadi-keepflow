# Hadi KeepFlow

**A personal knowledge and note-taking workspace built with Google Apps Script, Google Drive, and browser storage.**

Hadi KeepFlow stores notes as Markdown-compatible files in the user's Google Drive. The browser provides the interface, local drafts, preferences, search, and an offline synchronization queue.

> **Stable release: v1.3.5. Current development snapshot: v1.3.6-dev — Phase 3.7.1 (Workspace Navigation).**
> This development snapshot adds the new workspace navigation and an Inbox view. The full Temporary Inbox data model and migration are still planned for Phase 3.7.2.

## Project status

| Area | Current status |
|---|---|
| Notes and categories | Implemented |
| Google Drive persistence | Implemented |
| Local cache and offline queue | Implemented |
| Conflict detection and retry receipts | Implemented |
| Backup and restore ZIP | Implemented; uses JSZip CDN |
| Search, filters, sorting | Implemented |
| Bulk note organization | Implemented |
| Editor formatting and drafts | Implemented |
| Dashboard and local preferences | Implemented |
| Templates and checklists | Implemented |
| Inbox navigation/view | Implemented in v1.3.6-dev; temporarily backed by legacy `Umum` notes |
| Uncategorized data migration | Planned for Phase 3.7.2 |
| Note linking and backlinks | Planned |
| Multi-user collaboration | Not supported |
| AI / vector search | Not included |

Feature descriptions reflect the source package and its accompanying changelogs. Browser behavior and live Google Drive behavior must be validated in the deployer's own Apps Script environment.

## Screenshots

Screenshots can be added here after capturing the deployed application. Avoid publishing screenshots that expose personal note content, Google account details, or Drive identifiers.

## Architecture

```text
Browser
├── Index.html          Application shell
├── AppStyles.html      Custom CSS
├── AppScripts.html     Frontend state, UI, editor, search, offline queue
└── LocalStorage        Cache, drafts, preferences, pending operations
          │
          │ google.script.run
          ▼
Google Apps Script
├── Code.gs             Web entry point and shared utilities
├── NotesApi.gs         Note and category APIs
├── DriveStorage.gs     Drive storage, parsing, ownership checks
└── SyncOperations.gs   Idempotency receipts and retry handling
          │
          ▼
Google Drive
└── My Drive/apps/KeepFlow/storage/
    ├── <category>/
    │   └── <note>.md
    └── <note>.md       Root-level notes are read as "Umum" 
```

### Source files

| File | Responsibility |
|---|---|
| `Code.gs` | `doGet()`, HTML include helper, safe-name and boolean utilities |
| `DriveStorage.gs` | Drive folder creation, file ownership validation, Markdown/metadata parsing |
| `NotesApi.gs` | List, save, delete, backup snapshot, and category operations |
| `SyncOperations.gs` | Idempotency receipts and safe replay of retried operations |
| `Index.html` | HTML shell and external frontend dependencies |
| `AppStyles.html` | Application styles |
| `AppScripts.html` | Frontend application logic |

All `.gs` files share the Apps Script global namespace. Keep public server function names compatible with calls made through `google.script.run`.

## Data model and storage behavior

- Google Drive is the persistent source of truth for cloud-synced notes.
- Notes are stored as `.md` files, with JSON metadata wrapped in the `---JSON---` delimiter at the start of the file.
- The current backend stores notes in a category folder. Notes directly under `storage/` are interpreted as category `Umum`.
- The current frontend/backend use `Umum` as the default category when a note has no category value. This is the existing v1.3.5 behavior; it is **not** the planned Temporary Inbox behavior.
- In the v1.3.6-dev Phase 3.7.1 interface, legacy `Umum` notes are displayed in the Inbox view and labelled as Inbox. Their Drive location and stored category value are unchanged; the data migration is reserved for Phase 3.7.2.
- LocalStorage is used for local note cache, pending sync operations, editor draft recovery, search history, category state, and user preferences.
- Do not clear LocalStorage during upgrades unless a migration guide explicitly instructs you to do so.

## Requirements

- A Google account.
- Access to Google Apps Script and Google Drive.
- A modern browser with JavaScript and LocalStorage enabled.
- Internet access for the current external CDN dependencies.
- Permission to authorize the Apps Script project to access Google Drive.

## Installation and deployment

See **[INSTALL.md](INSTALL.md)** for a step-by-step setup and deployment guide.

For a personal deployment, keep the web app restricted to **Only myself**. The application is designed as a single-user personal workspace, not as a public multi-user service.

## Security and privacy

Read **[SECURITY.md](SECURITY.md)** before deployment or publishing a fork.

Important points:

- The application has no application-level sign-in, tenant isolation, or per-user authorization layer.
- Do not deploy an instance that executes as the owner's account with public or broad access. Visitors could invoke server functions with the privileges of the deploying account.
- Each person should deploy their own Apps Script project and authorize it against their own Google Drive.
- Notes and LocalStorage data are not encrypted by this application.
- Do not commit personal notes, backup ZIP files, OAuth tokens, Apps Script deployment URLs, or private Drive identifiers.
- The project uses third-party CDN resources. Review their availability and supply-chain implications before production use.

## External dependencies

The current `Index.html` loads these libraries from public CDNs:

- Tailwind CSS Play CDN — styling utilities.
- Font Awesome 6.4.0 — icons.
- JSZip 3.10.1 — ZIP backup and restore.

These dependencies require network access in the browser. Tailwind's Play CDN is convenient for this Apps Script implementation but is not the recommended production build approach for a conventional web application.

## Testing

The repository contains manual test guides for:

- Sync queue and recovery
- Offline reconciliation
- Backend security and Drive ownership checks
- Conflict detection
- Category persistence and management
- Backup and restore
- Search and discovery
- Bulk note organization
- Editor behavior
- Dashboard and personalization
- Templates and checklists
- Workspace navigation and transitional Inbox view (**[WORKSPACE-NAVIGATION-TEST.md](WORKSPACE-NAVIGATION-TEST.md)**)
- Phase 3.7.1 implementation notes (**[PHASE-3.7.1-IMPLEMENTATION.md](PHASE-3.7.1-IMPLEMENTATION.md)**)

Start with **[TEST-CHECKLIST.md](TEST-CHECKLIST.md)** and then run the relevant phase-specific test documents.

Static JavaScript syntax checks can catch parsing errors, but they do not prove correct behavior in Apps Script, browser rendering, Google Drive permissions, or concurrent multi-device use. Those require deployment and manual testing.

## Roadmap

See **[ROADMAP.md](ROADMAP.md)**. Phase 3.7.1 (Workspace Navigation) is implemented in the current development snapshot. The next workstream is **Phase 3.7.2 — Temporary Inbox**, which will implement the uncategorized storage model and migrate legacy `Umum` notes safely.

The current Inbox navigation is a transitional presentation of legacy `Umum` notes. It does not yet change their Drive location or stored category metadata.

## Contributing

Bug reports, documentation improvements, and focused pull requests are welcome. Read **[CONTRIBUTING.md](CONTRIBUTING.md)** before submitting changes.

Please do not submit real user notes, personal backups, account details, or private Drive identifiers in issues or pull requests.

## License

This project is licensed under the **MIT License**. You may use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions in the [`LICENSE`](LICENSE) file.

The license requires preservation of the copyright notice and permission notice in copies or substantial portions of the software. The software is provided "as is", without warranty of any kind.

