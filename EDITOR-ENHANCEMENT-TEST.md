# Editor Enhancement Test — v1.3.3

Run these checks after deploying a new Apps Script version. Use a temporary note first.

## A. Formatting toolbar
- [ ] Bold, italic, underline, and strikethrough apply to selected text.
- [ ] Paragraph, H1, H2, and blockquote apply to the current block.
- [ ] Bullet and numbered lists can be created and edited.
- [ ] Undo and redo reverse and restore recent edits.
- [ ] Horizontal separator is inserted and remains after save/reopen.
- [ ] Clear formatting removes inline formatting from selected text.

## B. Links and safety
- [ ] Select text, choose Insert Link, enter an `https://` URL, and verify it is clickable after save/reopen.
- [ ] `mailto:` links are accepted.
- [ ] `javascript:` and other unsupported schemes are rejected with a validation message.
- [ ] Existing links remain safe after editing and saving.

## C. Keyboard and counters
- [ ] Ctrl/Cmd+B, Ctrl/Cmd+I, and Ctrl/Cmd+U apply native formatting.
- [ ] Ctrl/Cmd+K opens link insertion.
- [ ] Ctrl/Cmd+S saves the note.
- [ ] Word and character counters update while typing, deleting, and pasting.

## D. Draft recovery and synchronization
- [ ] Type content, wait for the local draft status, close/reopen the same note, and verify draft recovery prompt.
- [ ] Restore the draft and verify formatting and links are retained safely.
- [ ] Save the note, wait for sync status, refresh the app, and verify the saved content.
- [ ] Test offline editing and confirm the existing sync queue still handles the save when online again.

## E. Regression
- [ ] Existing notes with headings, lists, and links still render in the editor.
- [ ] Search, bulk organization, backup, and restore still work.
- [ ] Light and dark themes display the editor correctly.
