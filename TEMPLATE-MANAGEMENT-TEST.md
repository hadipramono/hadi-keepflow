# Template Management Test

## A. Built-in templates
- [ ] Open a new note and verify all four built-in templates appear.
- [ ] Apply each template to an empty note.
- [ ] Apply a template to a non-empty draft and verify replacement confirmation appears.
- [ ] Cancel replacement and verify draft remains unchanged.

## B. Edit existing template
- [ ] Open **Kelola**.
- [ ] Select **Studi Alkitab**.
- [ ] Change its name, note title, and body structure.
- [ ] Save and verify the editor template selector uses the new name.
- [ ] Apply it to a new note and verify the edited structure is inserted.
- [ ] Reload the app and verify the edited template remains available in the same browser.

## C. Create and delete custom template
- [ ] Create a new template with a unique name.
- [ ] Save and apply it.
- [ ] Delete it and verify it disappears from the selector.
- [ ] Verify notes previously created from it are unchanged.

## D. Restore defaults
- [ ] Change a built-in template.
- [ ] Choose **Pulihkan bawaan** and confirm.
- [ ] Verify the four original built-in templates return.

## E. Sanitization and persistence
- [ ] Paste ordinary formatted content and save the template.
- [ ] Verify scripts, event attributes, and unsafe links do not execute or remain active.
- [ ] Reload the app and verify LocalStorage-backed templates persist.
- [ ] Open the app in another browser/profile and verify templates are not assumed to sync (browser-local by design).

## F. Inbox UI cleanup
- [ ] Open Data & Backup.
- [ ] Verify no migration notice or legacy folder status is displayed.
- [ ] Verify Inbox and category navigation still work.
- [ ] Verify backup and restore controls remain available.
