'use strict';
/** Static checks: everything compiles, and the browser/server contract holds. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gsFiles = fs.readdirSync(root).filter(f => f.endsWith('.gs'));

// Functions the browser is allowed to call through google.script.run.
const PUBLIC_API = ['getNotes', 'getBackupSnapshot', 'getCategories', 'getLegacyInboxMigrationStatus',
  'migrateLegacyInbox', 'createCategoryFolder', 'deleteCategoryFolder', 'renameCategoryFolder', 'saveNote', 'deleteNote'];

test('semua file .gs dapat dikompilasi', () => {
  gsFiles.forEach(file => assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), file));
  assert.ok(gsFiles.includes('NoteFormat.gs') && gsFiles.includes('NotesIndex.gs'));
});

test('script inline AppScripts.html dapat dikompilasi', () => {
  const match = /<script[^>]*>([\s\S]*)<\/script>/.exec(read('AppScripts.html'));
  assert.ok(match, 'blok <script> tidak ditemukan');
  assert.doesNotThrow(() => new vm.Script(match[1], { filename: 'AppScripts.html' }));
});

// Run by the owner from the Apps Script editor; the UI must never call these.
const OWNER_TOOLS = ['benchmarkNotesRead'];

test('semua fungsi API publik ada di backend', () => {
  const source = gsFiles.map(read).join('\n');
  PUBLIC_API.concat(OWNER_TOOLS, ['doGet', 'include']).forEach(name =>
    assert.match(source, new RegExp('^function ' + name + '\\(', 'm'), 'fungsi hilang: ' + name));
});

test('setiap fungsi server yang dipanggil klien ada di daftar API publik', () => {
  const client = read('AppScripts.html');
  const called = new Set([
    ...[...client.matchAll(/callKeepFlowServer\('(\w+)'/g)].map(m => m[1]),
    ...[...client.matchAll(/\brunner\.(\w+)\(/g)].map(m => m[1])
  ].filter(name => !/^with/.test(name)));
  assert.ok(called.size >= 4, 'terlalu sedikit panggilan terdeteksi: ' + [...called]);
  called.forEach(name => assert.ok(PUBLIC_API.includes(name), 'klien memanggil fungsi di luar daftar API: ' + name));
  OWNER_TOOLS.forEach(name => assert.ok(!client.includes(name), 'UI tidak boleh memanggil alat pemilik: ' + name));
});

test('Index.html hanya me-include partial yang diizinkan backend', () => {
  const partials = [...read('Index.html').matchAll(/include\('(\w+)'\)/g)].map(m => m[1]);
  assert.deepEqual(partials.sort(), ['AppScripts', 'AppStyles']);
  assert.ok(fs.existsSync(path.join(root, 'AppScripts.html')) && fs.existsSync(path.join(root, 'AppStyles.html')));
});

test('tidak ada sisa diagnostik atau API legacy', () => {
  const all = [...gsFiles, 'Index.html', 'AppScripts.html', 'AppStyles.html'].map(read).join('\n');
  assert.doesNotMatch(all, /kfdiag|KEEPFLOW_DIAGNOSTICS|keepFlowDiagnostics/);
  assert.doesNotMatch(all, /\b(saveNotes|deleteNoteFromFile)\b/);
});

test('keamanan: tidak ada innerHTML dari HTML catatan yang belum disanitasi', () => {
  const client = read('AppScripts.html');
  // Detached elements still run <img onerror>; previews must use DOMParser.
  assert.doesNotMatch(client, /tempDiv\.innerHTML\s*=\s*source/);
  assert.match(client, /new DOMParser\(\)\.parseFromString\(String\(html \|\| ''\), 'text\/html'\)/);
  assert.doesNotMatch(client, /(?<![\w.])alert\(/, 'gunakan notify() agar tidak memblokir halaman');
});

test('manifest appsscript.json valid dan membatasi akses', () => {
  const manifest = JSON.parse(read('appsscript.json'));
  assert.equal(manifest.runtimeVersion, 'V8');
  assert.equal(manifest.webapp.access, 'MYSELF');
  assert.equal(manifest.webapp.executeAs, 'USER_DEPLOYING');
  assert.deepEqual(manifest.oauthScopes, ['https://www.googleapis.com/auth/drive']);
});

test('versi konsisten di source dan dokumen', () => {
  const version = /\*\*v(\d+\.\d+\.\d+)\*\*/.exec(read('README.md'));
  assert.ok(version, 'versi tidak ditemukan di README');
  assert.match(read('Index.html'), new RegExp('Hadi KeepFlow v' + version[1].replace(/\./g, '\\.')));
  assert.match(read('AppScripts.html'), new RegExp("applicationVersion: '" + version[1].replace(/\./g, '\\.') + "'"));
  assert.match(read('CHANGELOG.md'), new RegExp('## v' + version[1].replace(/\./g, '\\.')));
});
