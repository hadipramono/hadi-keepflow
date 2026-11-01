# Hadi KeepFlow Roadmap

This document distinguishes implemented functionality from planned work. A roadmap item is not a feature commitment until its implementation is merged and tested.

## Current release: v1.3.5

Phase 3.6 — Productivity Features:
- Reusable note templates.
- Interactive checklists.
- Checklist progress display.
- Existing Google Drive and LocalStorage synchronization architecture retained.

## Next: Phase 3.7 — Workspace & Category Architecture

**Status: planned; not included in v1.3.5.**

### Product decision: Temporary Inbox

Inbox is a view/state for active notes that have not yet been assigned to a category. It is not a permanent category and does not require a dedicated Google Drive folder.

Expected behavior:
- New notes may be saved without selecting a category.
- Active notes without a category appear in Inbox.
- Assigning a category removes the note from Inbox.
- Removing a category assignment returns the active note to Inbox.
- Archived notes do not appear in the active Inbox.
- Deleting a category must not delete its notes; affected notes should be safely returned to Inbox.
- The Inbox count must reflect active uncategorized notes.

### Implementation workstreams

1. **3.7.1 — Workspace Navigation**
   - Dashboard, Inbox, All Notes, Categories, Tags, Archive.
   - Keep navigation views separate from Drive folder structure.
2. **3.7.2 — Temporary Inbox**
   - Explicit uncategorized state.
   - Inbox count, quick assignment, bulk assignment, and archive actions.
3. **3.7.3 — Category Management**
   - Create, rename, reorder, and delete categories.
   - Safe handling of notes when a category is deleted.
4. **3.7.4 — Integration & Reliability**
   - Search and dashboard integration.
   - Offline queue and conflict handling.
   - Backup/restore compatibility and regression testing.

### Compatibility constraint

The current v1.3.5 implementation uses `Umum` as its default category and stores root-level Drive notes as `Umum`. Phase 3.7 must explicitly design a backward-compatible transition from this behavior. Do not simply reinterpret every existing `Umum` note as uncategorized without a migration/compatibility decision.

## Later planned phases

- Phase 3.8 — Knowledge Organization.
- Phase 3.9 — Note Linking & Backlinks.
- Phase 4.0 — Knowledge Dashboard.
- Phase 4.1 — Knowledge Discovery.

These are planning directions and may change based on implementation findings.
