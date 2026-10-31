# Productivity Features Test — v1.3.5

## A. Note templates
1. Create a new note and choose **Catatan rapat**. Confirm title and sections are inserted.
2. Repeat with **Studi Alkitab**, **Rencana proyek**, and **Jurnal harian**.
3. Edit the generated content normally, add category/tags, save, close, and reopen.
4. Choose a template while the editor already contains text. Cancel and verify the original content is unchanged.
5. Choose a template while the editor already contains text. Confirm replacement and verify the new template is inserted; an existing title should remain unchanged.
6. Reload the application and verify the saved note remains intact.

## B. Interactive checklist
1. Open a note, click the checklist toolbar button, and verify three checklist rows are inserted.
2. Type task labels and tick/untick checkboxes.
3. Verify the editor metric shows completed tasks / total tasks.
4. Save, close, and reopen. Verify checkbox states are preserved.
5. Verify note card preview and search text show `[x]` for completed tasks and `[ ]` for incomplete tasks.
6. Use `Ctrl/Cmd + Shift + L` and verify a checklist is inserted at the current caret.
7. Verify a checkbox toggle creates a local draft and syncs only after pressing **Simpan**, consistent with the existing editor workflow.

## C. Regression
1. Verify rich-text formatting, links, undo/redo, word/character counters, and draft recovery.
2. Verify categories, tags, pin/archive, bulk actions, search, sort, dashboard, and personalization.
3. Test offline editing and reconnect; confirm queued operations are preserved.
4. Create a ZIP backup and restore into a test environment; confirm checklist HTML and checked states are preserved.
5. Inspect a note containing checklist HTML after cloud save; verify no script, event handler, or non-checkbox input is retained.

## D. Expected limitations
- Checklists are embedded in note content, not independent task records. There is no due date, reminder, task assignment, or cross-note task dashboard in this phase.
- Live Apps Script, browser, Drive, and offline tests must be performed after deployment.
