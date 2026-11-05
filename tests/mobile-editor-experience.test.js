const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'Index.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'AppStyles.html'), 'utf8');
const appScripts = fs.readFileSync(path.join(root, 'AppScripts.html'), 'utf8');
const scriptMatch = appScripts.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(scriptMatch, 'AppScripts.html must contain an application script block');
const script = scriptMatch[1];

// Compile the actual browser script without executing browser/GAS side effects.
assert.doesNotThrow(() => new vm.Script(script), 'AppScripts.html JavaScript syntax must be valid');

function countId(id) {
  return (index.match(new RegExp(`\\bid=["']${id}["']`, 'g')) || []).length;
}

[
  'editor-format-region',
  'editor-format-toggle',
  'editor-toolbar',
  'modal-mobile-actions-toggle',
  'modal-mobile-actions-menu',
  'mobile-pin-action',
  'mobile-archive-action',
  'mobile-delete-action',
  'modal-save-btn'
].forEach(id => {
  assert.equal(countId(id), 1, `Index.html must contain exactly one #${id}`);
});

assert.match(index, /aria-controls="editor-toolbar"/, 'Format toggle must be associated with toolbar');
assert.match(index, /aria-expanded="false"/, 'Collapsible controls must expose initial collapsed state');
assert.match(index, /id="modal-save-btn"[^>]*>[\s\S]*?Simpan/, 'Save action must remain in the editor header');
assert.match(index, /id="modal-mobile-actions-menu"[\s\S]*?role="menu"/, 'Mobile actions must use an accessible menu container');

assert.match(styles, /#editor-modal\.format-toolbar-open #editor-toolbar\s*\{\s*display:\s*flex;/, 'Toolbar must expand when editor enters expanded state');
assert.match(styles, /flex-wrap:\s*nowrap/, 'Mobile toolbar must remain on one row');
assert.match(styles, /overflow-x:\s*auto/, 'Mobile toolbar must scroll horizontally');
assert.match(styles, /min-width:\s*44px;\s*min-height:\s*44px/, 'Mobile toolbar controls must have touch-sized targets');
assert.match(styles, /var\(--keepflow-visual-height,\s*100dvh\)/, 'Editor must support dynamic visual viewport height');

assert.match(script, /function setEditorFormatToolbar\(open\)/, 'Toolbar state handler must exist');
assert.match(script, /editorFormatToggle\.addEventListener\('click'/, 'Format toggle must be interactive');
assert.match(script, /function syncEditorVisualViewport\(\)/, 'Visual viewport handler must exist');
assert.match(script, /visualViewport\.addEventListener\('resize'/, 'Visual viewport resize must be observed');
assert.match(script, /visualViewport\.addEventListener\('scroll'/, 'Visual viewport offset changes must be observed');
assert.match(script, /function captureEditorSelection\(\)/, 'Editor selection capture must exist');
assert.match(script, /function restoreEditorSelection\(editor\)/, 'Editor selection restoration must exist');
assert.match(script, /existingAction\.click\(\)/, 'Mobile overflow actions must reuse existing action handlers');
assert.match(script, /matchMedia\('\(min-width: 768px\)'\)\.matches/, 'Automatic editor focus must be desktop-only');
assert.match(script, /setEditorFormatToolbar\(false\)/, 'Toolbar must reset to collapsed state when opening a note');

// Guard the intended scope: this test suite only concerns frontend editor behavior.
for (const backendFile of ['Code.gs', 'DriveStorage.gs', 'NotesApi.gs', 'SyncOperations.gs']) {
  assert.ok(fs.existsSync(path.join(root, backendFile)), `Backend file ${backendFile} must remain present`);
}

console.log('PASS: frontend JavaScript syntax compiles');
console.log('PASS: mobile editor controls and accessibility hooks are present');
console.log('PASS: responsive toolbar and dynamic viewport rules are present');
console.log('PASS: selection preservation and existing action dispatch are present');
console.log('PASS: mobile editor regression static checks completed');
