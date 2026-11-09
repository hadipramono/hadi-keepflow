'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const scripts = fs.readFileSync(path.join(root, 'AppScripts.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'AppStyles.html'), 'utf8');

test('list view renders dedicated title and preview tracks', () => {
  assert.match(scripts, /class="card-list-title[^\"]*"/);
  assert.match(scripts, /class="card-list-preview[^\"]*"/);
});

test('list title is shrinkable and clipped with ellipsis', () => {
  assert.match(styles, /\.view-list \.card-list-title\s*\{[^}]*min-width:\s*5rem;[^}]*text-overflow:\s*ellipsis/s);
});

test('list preview uses remaining width without overlapping title', () => {
  assert.match(styles, /\.view-list \.card-list-preview\s*\{[^}]*flex:\s*1 1 0;[^}]*min-width:\s*0;[^}]*text-overflow:\s*ellipsis/s);
});

test('mobile list layout wraps preview below title when space is limited', () => {
  assert.match(styles, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.view-list \.card-list-preview\s*\{[^}]*flex:\s*1 1 100%/);
});
