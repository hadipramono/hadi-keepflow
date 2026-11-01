# Security and Privacy

## Intended deployment model

Hadi KeepFlow v1.3.5 is a **single-user personal application**. It does not implement application-level authentication, user roles, tenant isolation, or per-user authorization.

The recommended model is:

- Each user creates their own Google Apps Script project.
- Each user deploys their own instance.
- Each user authorizes access to their own Google Drive.
- The web app is restricted to **Only myself**.

Do not expose a deployment running as the owner's Google account to public users. Google Apps Script server functions exposed through `google.script.run` are callable by the page. The backend validates that note files belong to the KeepFlow storage tree, but this is not a substitute for authenticating and authorizing each visitor.

## Data handling

- Cloud notes are stored in the deploying user's Google Drive under `apps/KeepFlow/storage`.
- Local cache, editor drafts, pending operations, preferences, and search history are stored in browser LocalStorage.
- The application does not encrypt note content itself.
- Anyone with sufficient access to the Google Drive files or the browser profile may be able to read the data.
- Backup ZIP files may contain the full content of notes and metadata. Treat them as sensitive personal data.

## Before publishing or deploying

- Never commit notes, backup archives, OAuth tokens, private keys, deployment URLs intended to be private, or personal Drive identifiers.
- Review every new external script, stylesheet, and CDN dependency.
- Keep the web app access setting restrictive.
- Use a separate test Google account and synthetic notes when validating changes.
- Back up the Drive storage before backend or data-format changes.
- Do not treat the current Drive ownership checks as a multi-user security boundary.

## Framing protection

`Code.gs` does not opt into `XFrameOptionsMode.ALLOWALL`; Apps Script's default framing protection is retained. Do not re-enable unrestricted framing without a specific embedding requirement and a security review.

## Reporting a vulnerability

Do not publish exploitable details or personal data in a public issue. Until a private security contact is configured, avoid submitting sensitive vulnerability details through GitHub. The project owner should add a private reporting channel before inviting security reports.
