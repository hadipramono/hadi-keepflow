const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'AppScripts.html'), 'utf8');
const index = fs.readFileSync(path.join(root, 'Index.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'AppStyles.html'), 'utf8');

test('frontend no longer invokes blocking native confirm or prompt', () => {
  assert.doesNotMatch(app, /\b(?:window\.)?confirm\s*\(/);
  assert.doesNotMatch(app, /\b(?:window\.)?prompt\s*\(/);
});

test('internal dialog exposes accessible dialog semantics and labelled controls', () => {
  assert.match(index, /id="app-dialog"[^>]*role="dialog"[^>]*aria-modal="true"/);
  assert.match(index, /id="app-dialog-title"/);
  assert.match(index, /id="app-dialog-message"/);
  assert.match(index, /id="app-dialog-input"/);
  assert.match(index, /id="app-dialog-cancel"/);
  assert.match(index, /id="app-dialog-accept"/);
});

test('dialog implementation supports prompt, confirm, Escape, focus return and serialized requests', () => {
  assert.match(app, /function showAppDialog\s*\(/);
  assert.match(app, /function appConfirm\s*\(/);
  assert.match(app, /function appPrompt\s*\(/);
  assert.match(app, /appDialogQueue/);
  assert.match(app, /event\.key === 'Escape'/);
  assert.match(app, /previousFocus\.focus/);
  assert.match(app, /event\.key !== 'Tab'/);
});

test('dialog styles provide responsive layout, dark theme and visible focus', () => {
  assert.match(styles, /\.kf-dialog-overlay/);
  assert.match(styles, /\.dark \.kf-dialog-panel/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /max-width: 480px/);
});
