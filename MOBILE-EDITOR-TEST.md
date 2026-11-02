# Mobile Editor — Manual Regression Checklist

Test at approximately 320px, 360px, 390px and tablet width where possible. Include Android Chrome and iOS Safari if available.

## Opening and navigation
- [ ] Open an existing note: editor appears without automatically opening the keyboard.
- [ ] Scroll/read a long note without the keyboard appearing unexpectedly.
- [ ] Tap title, content, category and tags: keyboard appears only after the relevant field is tapped.
- [ ] Close the editor; reopen the same note; verify saved content is intact.

## Keyboard and viewport
- [ ] Focus the title, then content; modal remains within the visible screen above the keyboard.
- [ ] Scroll to the end of a long note while keyboard is visible.
- [ ] Rotate the device while editor is open; header, toolbar and content remain reachable.
- [ ] Verify bottom safe-area spacing on devices with gesture navigation/notches.

## Toolbar and selection
- [ ] Select a word or sentence, then apply bold, italic, underline and strike-through.
- [ ] Select text and create a link; verify the selected text receives the link.
- [ ] Apply heading, quote, bullet list and numbered list.
- [ ] Horizontally scroll toolbar to reach checklist, link, separator and clear-format actions.
- [ ] Verify touch targets are usable and the editor does not jump to the beginning after formatting.

## Draft durability
- [ ] Type content and wait for local draft status to report saved.
- [ ] Type content and immediately switch apps/background the browser; return and verify draft can be recovered.
- [ ] Type content and reload/close the tab; reopen note and verify draft recovery prompt.
- [ ] Archive with unsaved edits; reopen note and verify local draft is offered for recovery.
- [ ] Delete a note; verify it is removed and its local draft is cleared.

## Note actions and data
- [ ] Pin/unpin, archive/restore and delete notes.
- [ ] Repeat with note IDs represented as strings and numbers if test fixtures allow.
- [ ] Save a new note and edit an existing note; verify category, tags and content.
- [ ] Test offline editing and subsequent sync using the existing sync workflow.

## Record results
- Device/browser:
- Screen width:
- Test date:
- Passed:
- Failed / screenshots:
