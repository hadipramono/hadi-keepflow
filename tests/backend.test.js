'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createEnvironment } = require('./drive-mock');

const base = (over = {}) => ({ title: 'Catatan', content: '<p>isi</p>', category: '', tags: [], isPinned: false, isArchived: false, ...over });

test('saveNote membuat file v2; judul dengan karakter terlarang tetap utuh', () => {
  const env = createEnvironment();
  const res = env.api.saveNote(base({ title: 'Roma 8: Ayat 1?' }), 'op-1');
  assert.equal(res.status, 'success');
  assert.equal(res.note.title, 'Roma 8: Ayat 1?');
  const file = env.DriveApp.getFileById(res.note.id);
  assert.equal(file.getName(), 'Roma 8- Ayat 1-.md');
  assert.match(file.getBlob().getDataAsString(), /^---\nkeepflow: 2\ntitle: "Roma 8: Ayat 1\?"/);
  const [loaded] = env.api.getNotes();
  assert.equal(loaded.title, 'Roma 8: Ayat 1?');
});

test('judul kembar: nama file diberi (1) tetapi judul tampilan tidak berubah', () => {
  const env = createEnvironment();
  const a = env.api.saveNote(base({ title: 'Rapat' }), 'a');
  const b = env.api.saveNote(base({ title: 'Rapat' }), 'b');
  assert.equal(env.DriveApp.getFileById(b.note.id).getName(), 'Rapat (1).md');
  assert.equal(b.note.title, 'Rapat');
  const titles = env.api.getNotes().map(n => n.title).sort();
  assert.deepEqual(titles, ['Rapat', 'Rapat']);
  assert.notEqual(a.note.id, b.note.id);
});

test('konflik versi: simpan dengan baseUpdatedAt basi ditolak, tanpa menimpa', () => {
  const env = createEnvironment();
  const first = env.api.saveNote(base({ content: '<p>v1</p>' }), 'o1').note;
  const ok = env.api.saveNote({ ...first, content: '<p>v2</p>' }, 'o2');
  assert.equal(ok.status, 'success');
  const stale = env.api.saveNote({ ...first, content: '<p>basi</p>' }, 'o3');
  assert.equal(stale.status, 'conflict');
  assert.equal(stale.reason, 'version_mismatch');
  assert.equal(stale.currentNote.content, '<p>v2</p>');
  const none = env.api.saveNote({ ...first, baseUpdatedAt: '' }, 'o4');
  assert.equal(none.reason, 'version_missing');
});

test('file v1 lama: terbaca benar, dan ditingkatkan ke v2 saat disimpan tanpa kehilangan data', () => {
  const env = createEnvironment();
  const folder = env.storage.createFolder('Kerja');
  const legacy = folder.createFile('Lama.md',
    '---JSON---\n{"isPinned":true,"isArchived":false,"tags":["x","y"],"createdAt":"2025-05-05T05:05:05.000Z"}\n---JSON---\n\n<p>isi lama</p>');
  const [n] = env.api.getNotes();
  assert.deepEqual({ t: n.title, c: n.category, p: n.isPinned, tags: [...n.tags], created: n.createdAt, body: n.content },
    { t: 'Lama', c: 'Kerja', p: true, tags: ['x', 'y'], created: '2025-05-05T05:05:05.000Z', body: '<p>isi lama</p>' });
  const saved = env.api.saveNote({ ...n, content: '<p>isi baru</p>' }, 'up');
  assert.equal(saved.status, 'success');
  const text = legacy.getBlob().getDataAsString();
  assert.match(text, /^---\nkeepflow: 2\n/);
  const again = env.api.getNotes()[0];
  assert.equal(again.isPinned, true);
  assert.deepEqual([...again.tags], ['x', 'y']);
  assert.equal(again.createdAt, '2025-05-05T05:05:05.000Z');
  assert.equal(again.content, '<p>isi baru</p>');
});

test('pindah kategori memindahkan file, kategori dicocokkan tanpa peka huruf', () => {
  const env = createEnvironment();
  env.api.createCategoryFolder('Studi Alkitab');
  const n = env.api.saveNote(base({ category: 'studi alkitab' }), 'c1').note;
  assert.equal(n.category, 'Studi Alkitab');
  assert.equal(env.storage.getFolders().hasNext(), true);
  const moved = env.api.saveNote({ ...n, category: '' }, 'c2');
  assert.equal(moved.note.category, '');
  assert.equal(env.api.getNotes()[0].category, '');
});

test('hapus catatan: masuk sampah, versi wajib cocok', () => {
  const env = createEnvironment();
  const n = env.api.saveNote(base(), 'd1').note;
  assert.equal(env.api.deleteNote(n.id, '', 'd2').reason, 'version_missing');
  assert.equal(env.api.deleteNote(n.id, n.baseUpdatedAt, 'd3').deleted, true);
  assert.equal(env.DriveApp.getFileById(n.id).isTrashed(), true);
  assert.equal(env.api.getNotes().length, 0);
});

test('validasi: tipe salah, judul/isi/tag terlalu besar ditolak; createdAt palsu diganti', () => {
  const env = createEnvironment();
  assert.throws(() => env.api.saveNote(base({ title: 5 }), 'v1'), /Judul catatan harus berupa teks/);
  assert.throws(() => env.api.saveNote(base({ title: 'x'.repeat(181) }), 'v2'), /terlalu panjang/);
  assert.throws(() => env.api.saveNote(base({ content: 'x'.repeat(500001) }), 'v3'), /terlalu besar/);
  assert.throws(() => env.api.saveNote(base({ tags: new Array(51).fill('a') }), 'v4'), /Daftar tag/);
  const res = env.api.saveNote(base({ createdAt: 'bukan tanggal', title: 'a\u0000b\n c' }), 'v5');
  assert.equal(res.note.title, 'a b c');
  assert.ok(!isNaN(Date.parse(res.note.createdAt)));
});

test('getNotes dan getBackupSnapshot memakai pembaca yang sama (hasil identik)', () => {
  const env = createEnvironment();
  env.api.saveNote(base({ title: 'A', category: 'K1' }), 'x1');
  env.api.saveNote(base({ title: 'B' }), 'x2');
  const notes = env.api.getNotes();
  const snap = env.api.getBackupSnapshot();
  assert.deepEqual(JSON.parse(JSON.stringify(snap.notes)), JSON.parse(JSON.stringify(notes)));
  assert.deepEqual([...snap.categories], ['K1']);
  assert.equal(snap.noteCount, 2);
});

test('API legacy yang tidak dipakai sudah dihapus', () => {
  const env = createEnvironment();
  assert.equal(typeof env.api.saveNotes, 'undefined');
  assert.equal(typeof env.api.deleteNoteFromFile, 'undefined');
});

test('include() hanya mengizinkan partial yang dikenal', () => {
  const env = createEnvironment();
  assert.match(env.api.include('AppScripts'), /AppScripts/);
  assert.throws(() => env.api.include('Code'), /tidak diizinkan/);
});

test('retry dengan operationId yang sama tidak membuat file ganda (idempotensi)', () => {
  const env = createEnvironment();
  const a = env.api.saveNote(base({ title: 'Sekali' }), 'same-op');
  const b = env.api.saveNote(base({ title: 'Sekali' }), 'same-op');
  assert.equal(b.alreadyProcessed, true);
  assert.equal(b.note.id, a.note.id);
  assert.equal(env.api.getNotes().length, 1);
});

test('kuota PropertiesService penuh: simpan tetap sukses (tidak memicu duplikat)', () => {
  const env = createEnvironment({ propertyQuota: 10 });   // praktis selalu penuh
  const res = env.api.saveNote(base({ title: 'Tetap tersimpan' }), 'quota-op');
  assert.equal(res.status, 'success');
  assert.equal(env.api.getNotes().length, 1);
});

test('pruning receipt dibatasi: tidak memindai semua properti pada setiap simpan', () => {
  const env = createEnvironment();
  for (let i = 0; i < 25; i++) env.api.saveNote(base({ title: 'N' + i }), 'op-' + i);
  assert.ok(env.propertyReads() <= 2, 'getProperties dipanggil ' + env.propertyReads() + ' kali');
});

test('receipt kedaluwarsa dibersihkan saat pruning berjalan', () => {
  const env = createEnvironment();
  env.props.set('keepflow_op_lama', JSON.stringify({ completedAt: Date.now() - 8 * 24 * 3600 * 1000 }));
  env.props.set('keepflow_receipt_pruned_at', '0');
  env.api.saveNote(base(), 'fresh');
  assert.equal(env.props.has('keepflow_op_lama'), false);
});
