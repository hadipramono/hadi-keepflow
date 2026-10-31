# Hadi KeepFlow v1.3.1 — Phase 3.2: Search & Discovery

## Search improvements
- Search note title, plain-text content, category, and tags.
- Multi-term search uses AND matching: every term must appear somewhere in the searchable note fields.
- Quoted phrases are treated as a phrase, e.g. `"kasih kristus" keluarga`.
- Search results highlight matching terms in note titles and content previews.
- Search remains local-first against the notes already loaded in the app; no new server endpoint or external search service is introduced.
- Search input supports Ctrl+K / Cmd+K focus and Escape to clear the active query.

## Discovery improvements
- Recent search history stored in browser LocalStorage, limited to 8 terms.
- Recent search dropdown with one-click reuse and clear-history action.
- Sort notes by updated date, created date, and title (ascending/descending).
- Existing category, tag, pinned/archive, and date filters continue to combine with search.
- The "Hapus filter" action now clears the active view, search query, and date range filters.

## Compatibility
- No backend `.gs` changes.
- Existing notes, Drive files, LocalStorage notes, category state, sync queue, and backup ZIP format are unchanged.
- New LocalStorage key: `hadi_keepflow_search_history_v1`.

## Validation
- Frontend JavaScript syntax: PASS.
- Backend JavaScript syntax: PASS (unchanged).
- Search helper tests: PASS for AND terms, quoted phrase, missing term, title sorting, and safe HTML highlighting.
- Live browser performance and interaction testing remain required after deployment.
