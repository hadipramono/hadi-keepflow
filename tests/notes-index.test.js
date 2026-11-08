'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createEnvironment } = require('./drive-mock');

const INDEX = '.keepflow-index.json';
const plain = v => JSON.parse(JSON.stringify(v));
const base = (over = {}) => ({ title: 'Catatan', content: '<p>isi</p>', category: '', tags: [], isPinned: false, isArchived: false, ...over });

function seed(env, count = 6) {
  env.api.createCategoryFolder('Kerja');
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(env.api.saveNote(base({
      title: 'Catatan ' + i + (i === 2 ? ': titik dua?' : ''), content: '<p>isi ' + i + ' é😀</p>',
      category: i % 2 ? 'Kerja' : '', tags: i === 1 ? ['a,b', 'c'] : [], isPinned: i === 0
    }), 'seed-' + i).note.id);
  }
  return ids;
}
const direct = env => plain(env.api.collectAllNotes_(env.storage, { useIndex: false }).notes);
const indexed = env => env.api.collectAllNotes_(env.storage);
const indexFile = env => { const it = env.storage.getFilesByName(INDEX); return it.hasNext() ? it.next() : null; };
const reset = env => { env.counters.noteReads = 0; env.counters.indexReads = 0; };

test('pembacaan pertama (dingin) membuat indeks; hasil identik dengan pembacaan langsung', () => {
  const env = createEnvironment(); seed(env);
  assert.equal(indexFile(env), null);
  reset(env);
  const first = indexed(env);
  assert.equal(first.stats.reads, 6);
  assert.equal(first.stats.hits, 0);
  assert.ok(indexFile(env), 'file indeks harus dibuat');
  assert.deepEqual(plain(first.notes), direct(env));
});

test('pembacaan berikutnya (hangat): 0 unduhan file catatan, hasil tetap identik', () => {
  const env = createEnvironment(); seed(env);
  indexed(env);
  reset(env);
  const warm = indexed(env);
  assert.equal(env.counters.noteReads, 0, 'tidak boleh mengunduh isi catatan');
  assert.equal(env.counters.indexReads, 1, 'indeks dibaca sekali');
  assert.equal(warm.stats.hits, 6);
  assert.equal(warm.stats.reads, 0);
  assert.deepEqual(plain(warm.notes), direct(env));
});

test('hasil lewat indeks identik untuk format v2, v1 lama, file polos, dan karakter khusus', () => {
  const env = createEnvironment(); seed(env);
  const k = env.storage.getFolders().next();
  k.createFile('Lama.md', '---JSON---\n{"isPinned":true,"tags":["x"],"createdAt":"2025-05-05T05:05:05.000Z"}\n---JSON---\n\n<p>lama</p>');
  env.storage.createFile('Polos.txt', 'hanya teks\nbaris dua');
  env.storage.createFile('Foto.png', 'bukan catatan');
  indexed(env);
  reset(env);
  const warm = indexed(env);
  assert.equal(env.counters.noteReads, 0);
  assert.deepEqual(plain(warm.notes), direct(env));
  assert.equal(warm.notes.length, 8);   // file .png tidak dihitung
});

test('mengedit satu catatan hanya membaca ulang catatan itu', () => {
  const env = createEnvironment(); const ids = seed(env);
  indexed(env);
  const note = env.api.getNotes().find(n => n.id === ids[3]);
  env.api.saveNote({ ...note, content: '<p>diubah</p>' }, 'edit-1');
  reset(env);
  const after = indexed(env);
  assert.equal(env.counters.noteReads, 1);
  assert.equal(after.stats.reads, 1);
  assert.equal(after.notes.find(n => n.id === ids[3]).content, '<p>diubah</p>');
  assert.deepEqual(plain(after.notes), direct(env));
});

test('rename file dari luar: dibaca ulang dan judul mengikuti nama baru', () => {
  const env = createEnvironment(); const ids = seed(env);
  indexed(env);
  env.DriveApp.getFileById(ids[4]).setName('Nama Dari Luar.md');
  reset(env);
  const after = indexed(env);
  assert.equal(env.counters.noteReads, 1);
  assert.equal(after.notes.find(n => n.id === ids[4]).title, 'Nama Dari Luar');
  assert.deepEqual(plain(after.notes), direct(env));
});

test('mengubah isi file dari luar (waktu ubah berubah) tidak pernah menyajikan data basi', () => {
  const env = createEnvironment(); const ids = seed(env);
  indexed(env);
  env.DriveApp.getFileById(ids[0]).setContent('---\nkeepflow: 2\ntitle: "X"\ncreated: ""\npinned: false\narchived: false\ntags: []\ncontent_type: html\n---\n\n<p>edit eksternal</p>');
  const after = indexed(env);
  assert.equal(after.notes.find(n => n.id === ids[0]).content, '<p>edit eksternal</p>');
});

test('kategori selalu mengikuti folder: memindahkan file tanpa mengubah isi tetap benar (dan tetap hit)', () => {
  const env = createEnvironment(); const ids = seed(env);
  indexed(env);
  const file = env.DriveApp.getFileById(ids[0]);          // semula di Inbox (root)
  const kerja = env.storage.getFolders().next();
  kerja.addFile(file); env.storage.removeFile(file);
  reset(env);
  const after = indexed(env);
  assert.equal(after.notes.find(n => n.id === ids[0]).category, 'Kerja');
  assert.equal(env.counters.noteReads, 0, 'isi tidak berubah, jadi tidak perlu dibaca ulang');
  assert.deepEqual(plain(after.notes), direct(env));
});

test('catatan yang dihapus/dibuang dikeluarkan dari indeks', () => {
  const env = createEnvironment(); const ids = seed(env);
  indexed(env);
  const n = env.api.getNotes().find(x => x.id === ids[2]);
  env.api.deleteNote(n.id, n.baseUpdatedAt, 'del-1');
  const after = indexed(env);
  assert.equal(after.notes.length, 5);
  const stored = JSON.parse(indexFile(env).getBlob().getDataAsString());
  assert.equal(Object.keys(stored.entries).length, 5);
  assert.equal(ids[2] in stored.entries, false);
});

test('indeks rusak, format asing, atau entri cacat diabaikan; hasil tetap benar dan indeks dibangun ulang', () => {
  const env = createEnvironment(); const ids = seed(env);
  indexed(env);
  indexFile(env).setContent('{bukan json');
  assert.deepEqual(plain(indexed(env).notes), direct(env));
  assert.doesNotThrow(() => JSON.parse(indexFile(env).getBlob().getDataAsString()));

  indexFile(env).setContent(JSON.stringify({ format: 99, entries: {} }));
  assert.equal(indexed(env).stats.reads, 6);

  // Entri dengan versi dan nama cocok tetapi isi bertipe salah tidak boleh dipercaya.
  const file = env.DriveApp.getFileById(ids[0]);
  const entries = {};
  entries[ids[0]] = { v: file.getLastUpdated().toISOString(), n: file.getName(), t: 5, b: null, p: 'ya', a: false, g: [], cr: 'x' };
  indexFile(env).setContent(JSON.stringify({ format: 1, entries }));
  const after = indexed(env);
  assert.equal(after.stats.reads, 6);
  assert.deepEqual(plain(after.notes), direct(env));
});

test('file indeks tidak pernah muncul sebagai catatan dan tidak mengganggu kategori', () => {
  const env = createEnvironment(); seed(env);
  indexed(env);
  assert.equal(env.api.getNotes().some(n => /keepflow-index/.test(n.title)), false);
  assert.deepEqual([...env.api.getCategories()], ['Kerja']);
  assert.equal(env.api.deleteCategoryFolder('Kerja').status, 'error');   // masih berisi catatan
});

test('backup membaca langsung dari file: tidak memakai dan tidak mengubah indeks', () => {
  const env = createEnvironment(); seed(env);
  indexed(env);
  const before = indexFile(env).getBlob().getDataAsString();
  reset(env);
  const snap = env.api.getBackupSnapshot();
  assert.equal(env.counters.noteReads, 6, 'semua file harus dibaca langsung');
  assert.equal(env.counters.indexReads, 0);
  assert.equal(snap.notes.length, 6);
  assert.equal(indexFile(env).getBlob().getDataAsString(), before);
});

test('indeks terlalu besar tidak ditulis, pembacaan tetap berhasil', () => {
  const env = createEnvironment(); seed(env);
  env.api.NOTES_INDEX_MAX_CHARS = 50;
  const result = indexed(env);
  assert.equal(result.notes.length, 6);
  assert.equal(result.stats.indexChars, 0);
  assert.equal(indexFile(env), null);
});

test('kegagalan menulis indeks tidak menggagalkan pembacaan', () => {
  const env = createEnvironment({ failIndexWrite: true }); seed(env);
  const result = indexed(env);
  assert.equal(result.notes.length, 6);
  assert.match(result.stats.indexError, /gagal menulis indeks/);
  assert.equal(env.api.getNotes().length, 6);
});

test('indeks hangat tidak ditulis ulang bila tidak ada perubahan', () => {
  const env = createEnvironment(); seed(env);
  indexed(env);
  const stamp = indexFile(env).getLastUpdated().getTime();
  indexed(env); indexed(env);
  assert.equal(indexFile(env).getLastUpdated().getTime(), stamp);
});

test('operasi tulis tidak pernah bergantung pada indeks (deteksi konflik tetap dari file)', () => {
  const env = createEnvironment(); const ids = seed(env);
  indexed(env);
  const stale = env.api.getNotes().find(n => n.id === ids[1]);
  env.DriveApp.getFileById(ids[1]).setContent('---\nkeepflow: 2\ntitle: "Catatan 1"\ncreated: ""\npinned: false\narchived: false\ntags: []\ncontent_type: html\n---\n\n<p>edit luar</p>');
  const res = env.api.saveNote({ ...stale, content: '<p>timpa?</p>' }, 'conf-1');
  assert.equal(res.status, 'conflict');
  assert.equal(res.currentNote.content, '<p>edit luar</p>');
});

test('benchmarkNotesRead melaporkan pembacaan langsung versus lewat indeks', () => {
  const env = createEnvironment(); seed(env, 5);
  const report = env.api.benchmarkNotesRead();
  assert.equal(report.notes, 5);
  assert.equal(report.indexedReadHits, 5);
  assert.equal(report.indexedReadFileReads, 0);
  assert.ok(report.indexChars > 0);
});

test('skala: 300 catatan, muat kedua kali tanpa satu pun unduhan isi', () => {
  const env = createEnvironment();
  for (let i = 0; i < 300; i++) env.api.saveNote(base({ title: 'N' + i, content: '<p>' + i + '</p>' }), 'bulk-' + i);
  reset(env);
  indexed(env);
  assert.equal(env.counters.noteReads, 300);
  reset(env);
  const warm = indexed(env);
  assert.equal(env.counters.noteReads, 0);
  assert.equal(warm.notes.length, 300);
});

test('rename tanpa perubahan waktu ubah: pemeriksaan nama saja sudah cukup untuk menolak entri basi', () => {
  const env = createEnvironment(); const ids = seed(env);
  indexed(env);
  // Meniru rename yang tidak menaikkan waktu ubah: ubah nama tanpa menyentuh versi.
  env.DriveApp.getFileById(ids[4]).name = 'Rename Senyap.md';
  reset(env);
  const after = indexed(env);
  assert.equal(env.counters.noteReads, 1);
  assert.equal(after.notes.find(n => n.id === ids[4]).title, 'Rename Senyap');
});

test('setiap field entri yang cacat (satu per satu) ditolak dan hanya catatan itu dibaca ulang', () => {
  const defects = { v: 123, n: 5, t: 5, b: null, p: 'ya', a: undefined, g: ['ok', 7], cr: 9 };
  for (const [field, bad] of Object.entries(defects)) {
    const env = createEnvironment(); const ids = seed(env);
    indexed(env);
    const file = indexFile(env);
    const stored = JSON.parse(file.getBlob().getDataAsString());
    if (bad === undefined) delete stored.entries[ids[0]][field]; else stored.entries[ids[0]][field] = bad;
    file.setContent(JSON.stringify(stored));
    reset(env);
    const after = indexed(env);
    assert.equal(env.counters.noteReads, 1, 'field ' + field + ' cacat harus memicu pembacaan ulang');
    assert.deepEqual(plain(after.notes), direct(env), 'field ' + field);
  }
});

test('indeks berformat asing (walau entrinya tampak valid) tidak dipercaya', () => {
  const env = createEnvironment(); seed(env);
  indexed(env);
  const file = indexFile(env);
  const stored = JSON.parse(file.getBlob().getDataAsString());
  stored.format = 99;
  file.setContent(JSON.stringify(stored));
  reset(env);
  const after = indexed(env);
  assert.equal(env.counters.noteReads, 6);
  assert.equal(after.stats.hits, 0);
  assert.equal(JSON.parse(indexFile(env).getBlob().getDataAsString()).format, 1, 'indeks dibangun ulang dengan format yang benar');
});

test('checkpoint: pembacaan dingin yang terputus (batas waktu) dilanjutkan, bukan diulang dari nol', () => {
  const env = createEnvironment();
  for (let i = 0; i < 250; i++) env.api.saveNote(base({ title: 'B' + i, content: '<p>' + i + '</p>' }), 'cp-' + i);
  env.api.NOTES_INDEX_CHECKPOINT_EVERY = 50;
  reset(env);
  env.options.throwAfterNoteReads = 130;                  // eksekusi "habis waktu" di tengah jalan
  assert.throws(() => env.api.getNotes(), /batas waktu eksekusi habis/);
  const partial = JSON.parse(indexFile(env).getBlob().getDataAsString());
  assert.equal(Object.keys(partial.entries).length, 100, 'checkpoint terakhir menyimpan 100 catatan (2 x 50)');

  env.options.throwAfterNoteReads = null;                 // percobaan berikutnya
  reset(env);
  const result = indexed(env);
  assert.equal(result.notes.length, 250);
  assert.equal(env.counters.noteReads, 150, 'hanya sisa 150 yang dibaca; 100 dilanjutkan dari checkpoint');
  assert.equal(result.stats.hits, 100);
  assert.deepEqual(plain(result.notes), direct(env));
  reset(env);
  indexed(env);
  assert.equal(env.counters.noteReads, 0, 'setelah selesai, pembacaan berikutnya penuh dari indeks');
});

test('indeks parsial tidak pernah menyajikan data basi (entri tetap divalidasi per file)', () => {
  const env = createEnvironment();
  const ids = [];
  for (let i = 0; i < 120; i++) ids.push(env.api.saveNote(base({ title: 'P' + i }), 'pp-' + i).note.id);
  env.api.NOTES_INDEX_CHECKPOINT_EVERY = 40;
  env.options.throwAfterNoteReads = 90;
  assert.throws(() => env.api.getNotes());
  env.options.throwAfterNoteReads = null;
  // Catatan yang sudah ada di checkpoint diubah dari luar sebelum percobaan berikutnya.
  const partial = JSON.parse(indexFile(env).getBlob().getDataAsString());
  const target = Object.keys(partial.entries)[0];
  env.DriveApp.getFileById(target).setContent('---\nkeepflow: 2\ntitle: "Berubah"\ncreated: ""\npinned: false\narchived: false\ntags: []\ncontent_type: html\n---\n\n<p>baru</p>');
  const after = indexed(env);
  assert.equal(after.notes.find(n => n.id === target).content, '<p>baru</p>');
  assert.deepEqual(plain(after.notes), direct(env));
});

test('kegagalan menulis checkpoint tidak menggagalkan pembacaan', () => {
  const env = createEnvironment({ failIndexWrite: true });
  for (let i = 0; i < 30; i++) env.api.saveNote(base({ title: 'F' + i }), 'fw-' + i);
  env.api.NOTES_INDEX_CHECKPOINT_EVERY = 10;
  const result = indexed(env);
  assert.equal(result.notes.length, 30);
  assert.ok(result.stats.indexError);
});

test('checkpoint mempertahankan entri lama yang belum dikunjungi saat eksekusi terputus', () => {
  const env = createEnvironment();
  const ids = [];
  for (let i = 0; i < 100; i++) ids.push(env.api.saveNote(base({ title: 'W' + i }), 'wm-' + i).note.id);
  indexed(env);                                            // indeks hangat berisi 100 entri
  for (let i = 0; i < 30; i++) {                           // 30 catatan pertama diubah dari luar
    env.DriveApp.getFileById(ids[i]).setContent('---\nkeepflow: 2\ntitle: "W' + i + '"\ncreated: ""\npinned: false\narchived: false\ntags: []\ncontent_type: html\n---\n\n<p>ubah ' + i + '</p>');
  }
  env.api.NOTES_INDEX_CHECKPOINT_EVERY = 10;
  reset(env);
  env.options.throwAfterNoteReads = 20;
  assert.throws(() => env.api.getNotes(), /batas waktu eksekusi habis/);
  env.options.throwAfterNoteReads = null;
  reset(env);
  const after = indexed(env);
  assert.equal(env.counters.noteReads, 10, 'hanya 10 yang tersisa dari 30 yang berubah; 70 tak berubah tetap dari indeks');
  assert.equal(after.stats.hits, 90);
  assert.deepEqual(plain(after.notes), direct(env));
});
