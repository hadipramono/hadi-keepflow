# Workspace Navigation Test — Phase 3.7.1

**Target:** Hadi KeepFlow v1.3.6-dev  
**Scope:** Frontend workspace navigation only. No Drive migration is performed in this phase.

## Important compatibility note

Until Phase 3.7.2, the Inbox view is a presentation layer over legacy notes whose category is `Umum` (and any note with a missing/blank category). The Drive folder layout and stored category metadata remain unchanged.

## Manual test checklist

Run these tests in a dedicated Apps Script test deployment with a backup of the test data.

### Workspace navigation
- [ ] Dashboard opens and its navigation item is highlighted.
- [ ] Inbox opens and its navigation item is highlighted.
- [ ] All Notes opens and its navigation item is highlighted.
- [ ] Pinned opens and its navigation item is highlighted.
- [ ] Archive opens and its navigation item is highlighted.
- [ ] Category selection opens the selected category.
- [ ] Tag selection opens the selected tag.
- [ ] Navigation works on desktop and mobile.
- [ ] Mobile sidebar closes after selecting a destination.
- [ ] Sidebar collapse/expand behavior remains functional.

### Transitional Inbox view
- [ ] Notes with category `Umum` appear in Inbox.
- [ ] Notes with a missing/blank category appear in Inbox.
- [ ] Notes in named categories do not appear in Inbox.
- [ ] Archived `Umum` notes do not appear in active Inbox.
- [ ] Pinned `Umum` notes still appear in Inbox.
- [ ] Inbox count matches active `Umum`/uncategorized notes.
- [ ] Inbox count hides when the count is zero and caps its display at `99+`.
- [ ] Empty Inbox shows the Inbox-specific empty state.
- [ ] Search and date filters work while Inbox is selected.

### Existing behavior regression
- [ ] All Notes still includes active notes from every category and Inbox.
- [ ] Pinned view still excludes archived notes.
- [ ] Archive view still includes archived notes.
- [ ] Category counts exclude Inbox/legacy `Umum`.
- [ ] Category selector displays legacy `Umum` as Inbox while preserving its stored value.
- [ ] Creating a note while Inbox is selected stores it using the existing `Umum` default.
- [ ] Bulk category selector displays `Umum` as Inbox.
- [ ] Bulk move, pin, archive, and tag actions still work.
- [ ] Dashboard category links still open the correct category.
- [ ] Backup and restore entry points remain available.

### Data safety
- [ ] No Drive file was moved or renamed by opening Inbox.
- [ ] No note ID, title, body, tags, pin state, archive state, or timestamps changed just by navigating.
- [ ] Existing categories remain intact.
- [ ] Offline queue behavior remains functional.

## Test limitations

Static syntax checks do not replace these browser and Apps Script tests. Phase 3.7.1 intentionally does not perform the `Umum` to uncategorized data migration. That migration must be separately backed up, tested, and documented in Phase 3.7.2.
