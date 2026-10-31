# v1.3.3 — Phase 3.4: Editor Enhancement

## Goal
Improve everyday note writing while preserving the existing contenteditable editor, local draft recovery, Drive storage format, and durable sync queue.

## Changes
- Expanded formatting toolbar with undo, redo, paragraph, H1/H2, blockquote, bullet/numbered lists, link insertion, horizontal separator, and clear-formatting controls.
- Added safe link insertion: only `http:`, `https:`, and `mailto:` URLs are accepted. The existing HTML sanitizer continues to remove unsafe protocols and event attributes on save and draft restore.
- Added keyboard shortcuts: Ctrl/Cmd+S save, Ctrl/Cmd+K insert link, and native Ctrl/Cmd+B/I/U formatting.
- Added live word and character counters for the editor body.
- Improved editor typography for headings, lists, quotes, links, and separators in light/dark themes.
- Added textbox/toolbar accessibility semantics and visible keyboard focus.
- Preserved local draft autosave/recovery and existing save/sync behavior.

## Compatibility and scope
- No `.gs` files changed.
- No Drive format, metadata schema, or LocalStorage key changes.
- Existing notes remain compatible. Horizontal rules (`<hr>`) are now retained by the editor sanitizer.
- The editor continues to use the browser's existing `document.execCommand` editing commands for compatibility with the current implementation; this API is deprecated by browsers but remains in use here.

## Files changed
- `Index.html`
- `AppStyles.html`
- `AppScripts.html`
- `README.md`
- `INSTALL.md`
- `GIT_COMMIT.md`
- Added `EDITOR-ENHANCEMENT-TEST.md`
