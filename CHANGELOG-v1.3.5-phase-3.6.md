# Hadi KeepFlow v1.3.5 — Phase 3.6: Productivity Features

## Note templates
- Added reusable templates for meeting notes, Bible study, project planning, and daily journaling.
- Applying a template to a non-empty note requires confirmation; existing title is retained when already populated.
- Templates are ordinary note body HTML and remain editable after insertion.

## Interactive checklists
- Added checklist insertion from the editor toolbar and `Ctrl/Cmd + Shift + L`.
- Checkbox state is persisted as a sanitized checkbox attribute in the existing note content.
- Added completed/total task count in editor metrics.
- Note previews and search text include `[x]` / `[ ]` markers for checklist items.

## Compatibility and security
- No backend `.gs` changes, database, new Drive folders, or note schema migrations.
- Existing local draft autosave, offline cache, sync queue, backup/restore, categories, tags, and preferences are retained.
- Sanitizer permits only checkbox inputs; other input types are removed. Event attributes and other arbitrary attributes remain stripped. Only the `keepflow-checklist` class is retained on list elements.
- Backup manifest application version updated to 1.3.5.
