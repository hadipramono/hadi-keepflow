# Phase 3.2 — Search & Discovery Test

## A. Search scope
Create or use notes with distinctive terms in:
- title
- body/content
- category name
- tags

Test each field separately.

Expected: all four fields are searchable.

## B. Multi-term search
1. Search `kasih keluarga`.
2. Confirm a note matches when both terms exist, even if they appear in different fields.
3. Search `kasih tidakada`.
4. Confirm notes without both terms are excluded.

Expected: every unquoted search term must match somewhere in the note (AND behavior).

## C. Exact phrase
1. Search `"kasih kristus"`.
2. Confirm the exact phrase is found.
3. Confirm a note with the words separated by unrelated words does not match that quoted phrase.

Expected: quoted text is treated as one phrase.

## D. Highlighting
1. Search a word in a note title.
2. Search a word in note content.
3. Confirm matches are highlighted in card/list view.
4. Try a query containing symbols such as `(`, `[`, `+`, or `.`.

Expected: highlighting works without breaking the page or rendering user text as HTML.

## E. Recent search history
1. Enter a query and press Enter.
2. Search for another query and press Enter.
3. Focus an empty search box.
4. Select a recent query.
5. Clear search history.

Expected: most recent first, maximum 8 entries, persisted in LocalStorage, and selectable.

## F. Sorting
Test each option:
- Terbaru diubah
- Terlama diubah
- Terbaru dibuat
- Terlama dibuat
- Judul A–Z
- Judul Z–A

Expected: notes are ordered consistently in grid and list views, including pinned/category/tag views.

## G. Combined filters
Combine search with:
- category selection
- tag selection
- pinned/archive views
- date presets and custom date range

Expected: filters are combined rather than replacing each other.

## H. Clear filters and keyboard
1. Apply search and date/category filters.
2. Click `Hapus filter`.
3. Press Ctrl+K (or Cmd+K on macOS).
4. Type a search and press Escape.

Expected: clear action resets active view/search/date filters; keyboard shortcuts focus and clear search as described.

## I. Offline behavior
Disconnect network and search existing locally loaded notes.

Expected: search continues to work because it operates on the locally loaded notes. Search history remains in browser LocalStorage.
