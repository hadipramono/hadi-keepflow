# Hadi KeepFlow — Mobile Editor Phase 1

Basis: uploaded frontend snapshot dated 2026-11-02 (`AppScripts.html`, `AppStyles.html`, `Index.html`).

## Changes

1. **No forced mobile keyboard on open** — opening a note now leaves the editor in reading/navigation mode on viewports below 768px. Desktop retains editor focus.
2. **Viewport and keyboard adaptation** — the page tracks `visualViewport` height and offset, and the editor modal follows the visible viewport. `100dvh` is retained as a fallback. Safe-area padding is applied to the editor.
3. **Mobile toolbar** — toolbar stays on one horizontally scrollable row, with larger touch targets. Less-used actions remain reachable by horizontal scrolling.
4. **Selection preservation** — the current contenteditable range is saved and restored before formatting commands, including pointer interaction.
5. **Draft durability** — pending local draft writes are flushed on `visibilitychange`, `pagehide`, and `beforeunload`.
6. **ID consistency** — archive and delete compare note IDs as strings. Archiving flushes pending edits into a recoverable local draft instead of silently deleting the draft.

## Files

- `Index.html`
- `AppStyles.html`
- `AppScripts.html`

No backend `.gs` files or Drive data format were changed.

## Deployment

1. Make a backup of the current Apps Script project/files first.
2. Replace the corresponding three frontend files in the Apps Script project.
3. Save all files and create a new deployment version (or update the existing deployment).
4. Test on a phone using the deployed web app, not only the desktop responsive preview.
5. If testing fails, restore the three backed-up files and redeploy.

## Validation performed here

- JavaScript syntax check of the `AppScripts.html` script block using Node.js: passed.
- Static inspection of the three updated frontend files: passed.
- No live Apps Script deployment, Google Drive operation, or physical Android/iOS browser test was performed in this environment.
