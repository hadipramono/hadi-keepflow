'use strict';
/**
 * Delta loading: the server sends a stub for notes the browser already holds.
 * Invariant under test: for ANY server state and ANY client baseline, the array
 * the browser assembles equals what the full getNotes() returns.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { createEnvironment } = require('./drive-mock');
const { loadClientFunctions } = require('./client-extract');

const plain = v => JSON.parse(JSON.stringify(v));
const base = (over = {}) => ({ title: 'Catatan', content: '<p>isi</p>', category: '', tags: [], isPinned: false, isArchived: false, ...over });
const META = (t) => '---\nkeepflow: 2\ntitle: "' + t + '"\ncreated: ""\npinned: false\narchived: false\ntags: []\ncontent_type: html\n---\n\n';

function makeClient(notes, pendingOperations = []) {
  const client = loadClientFunctions(['cloneData', 'buildDeltaBaseline', 'assembleDeltaNotes'], { notes, pendingOperations });
  client.cloneData = v => JSON.parse(JSON.stringify(v));   // same behaviour as the page's helper
  return client;
}

/** Full round trip as the page does it. */
function roundTrip(env, clientNotes, pending = []) {
  const client = makeClient(clientNotes, pending);
  const { known, baseline } = client.buildDeltaBaseline();
  const response = env.api.getNotesDelta(known);
  // plain(): objects built inside the vm context belong to another realm.
  const assembled = plain(client.assembleDeltaNotes(plain(response), baseline));
  return { known: plain(known), response: plain(response), assembled, full: plain(env.api.getNotes()) };
}

function seed(env, n = 8) {
  env.api.createCategoryFolder('Kerja');
  return Array.from({ length: n }, (_, i) => env.api.saveNote(base({
    title: 'N' + i, content: '<p>isi ' + i + '</p>', category: i % 2 ? 'Kerja' : '', isPinned: i === 0
  }), 'd-' + i).note.id);
}

test('klien bersih: semua catatan menjadi stub, hasil rakitan identik dengan getNotes, payload kecil', () => {
  const env = createEnvironment(); seed(env, 40);
  const local = plain(env.api.getNotes());
  const r = roundTrip(env, local);
  assert.ok(r.response.notes.every(n => n.unchanged === true && Object.keys(n).length === 2));
  assert.deepEqual(r.assembled, r.full);
  const ratio = JSON.stringify(r.response).length / JSON.stringify(r.full).length;
  assert.ok(ratio < 0.15, 'payload delta harus jauh lebih kecil, rasio=' + ratio.toFixed(3));
});

test('klien kosong (belum punya apa-apa): server mengirim semua catatan penuh', () => {
  const env = createEnvironment(); seed(env, 5);
  const r = roundTrip(env, []);
  assert.deepEqual(r.known, {});
  assert.ok(r.response.notes.every(n => !n.unchanged));
  assert.deepEqual(r.assembled, r.full);
});

test('perubahan di server (edit, rename senyap, pindah kategori, pin, hapus, catatan baru) tercermin', () => {
  const env = createEnvironment(); const ids = seed(env, 8);
  const local = plain(env.api.getNotes());

  env.DriveApp.getFileById(ids[1]).setContent(META('N1') + '<p>edit luar</p>');          // edit
  env.DriveApp.getFileById(ids[2]).name = 'Rename Senyap.md';                            // rename tanpa ubah versi
  const moved = env.DriveApp.getFileById(ids[3]);                                         // pindah folder (versi sama)
  env.storage.addFile(moved); env.storage.getFolders().next().removeFile(moved);
  const pin = env.api.getNotes().find(n => n.id === ids[4]); env.api.saveNote({ ...pin, isPinned: true }, 'pin');
  const gone = env.api.getNotes().find(n => n.id === ids[5]); env.api.deleteNote(gone.id, gone.baseUpdatedAt, 'del');
  const created = env.api.saveNote(base({ title: 'Baru' }), 'new').note.id;

  const r = roundTrip(env, local);
  assert.deepEqual(r.assembled, r.full, 'rakitan harus identik dengan getNotes');
  const sent = r.response.notes.filter(n => !n.unchanged).map(n => n.id).sort();
  assert.deepEqual(sent, [ids[1], ids[2], ids[3], ids[4], created].sort(), 'hanya yang berubah dikirim penuh');
  assert.equal(r.assembled.some(n => n.id === ids[5]), false, 'catatan yang dihapus tidak muncul lagi');
  assert.equal(r.assembled.find(n => n.id === ids[2]).title, 'Rename Senyap');
  assert.equal(r.assembled.find(n => n.id === ids[3]).category, '');
});

test('catatan dengan operasi antrean tidak pernah diklaim "tidak berubah"', () => {
  const env = createEnvironment(); const ids = seed(env, 4);
  const local = plain(env.api.getNotes());
  const r = roundTrip(env, local, [{ type: 'save', id: ids[0], opId: 'x' }, { type: 'delete', id: ids[1], opId: 'y' }]);
  assert.equal(ids[0] in r.known, false);
  assert.equal(ids[1] in r.known, false);
  assert.equal(ids[2] in r.known, true);
  assert.deepEqual(r.assembled, r.full);
});

test('salinan lokal yang menyimpang (panjang isi berbeda) dikirim ulang walau versi sama', () => {
  const env = createEnvironment(); const ids = seed(env, 3);
  const local = plain(env.api.getNotes());
  local.find(n => n.id === ids[0]).content = '<p>terpotong</p>';
  const r = roundTrip(env, local);
  assert.equal(r.response.notes.find(n => n.id === ids[0]).unchanged, undefined);
  assert.deepEqual(r.assembled.find(n => n.id === ids[0]), r.full.find(n => n.id === ids[0]));
});

test('ID lama di klien yang sudah tidak ada di server diabaikan', () => {
  const env = createEnvironment(); seed(env, 3);
  const local = plain(env.api.getNotes());
  local.push({ ...local[0], id: 'hantu', baseUpdatedAt: '2020-01-01T00:00:00.000Z' });
  const r = roundTrip(env, local);
  assert.equal(r.assembled.some(n => n.id === 'hantu'), false);
  assert.deepEqual(r.assembled, r.full);
});

test('input `known` yang rusak atau berbahaya tidak menimbulkan error dan menghasilkan respons penuh', () => {
  const env = createEnvironment(); const ids = seed(env, 3);
  const full = plain(env.api.getNotes());
  const hostile = [null, undefined, 'teks', 42, [], [1, 2], {}, { [ids[0]]: 'x' }, { [ids[0]]: [1, 2, 3] },
    { [ids[0]]: [full[0].baseUpdatedAt, '', 'a'] }, JSON.parse('{"__proto__": [1,2,3,4]}'), { constructor: [1, 2, 3, 4] }];
  hostile.forEach(known => {
    const res = plain(env.api.getNotesDelta(known));
    assert.equal(res.format, 1);
    assert.ok(res.notes.every(n => !n.unchanged), 'tidak boleh ada stub untuk klaim cacat: ' + JSON.stringify(known));
    assert.equal(res.notes.length, 3);
  });
});

test('klaim yang benar hanya jika keempat nilai cocok persis (versi, kategori, judul, panjang isi)', () => {
  const env = createEnvironment(); const ids = seed(env, 2);
  const n = plain(env.api.getNotes()).find(x => x.id === ids[1]);
  const claim = [n.baseUpdatedAt, n.category, n.title, n.content.length];
  const ask = c => plain(env.api.getNotesDelta({ [n.id]: c })).notes.find(x => x.id === n.id);
  assert.equal(ask(claim).unchanged, true);
  [[0, 'x'], [1, 'Lain'], [2, 'Lain'], [3, claim[3] + 1]].forEach(([i, v]) => {
    const bad = claim.slice(); bad[i] = v;
    assert.equal(ask(bad).unchanged, undefined, 'klaim indeks ' + i + ' yang salah harus ditolak');
  });
});

test('assembleDeltaNotes menolak respons yang tidak dapat dipercaya (agar klien memuat penuh)', () => {
  const client = makeClient([]);
  const baseline = new Map([['a', { id: 'a' }]]);
  assert.equal(client.assembleDeltaNotes({ format: 1, notes: [{ id: 'zzz', unchanged: true }] }, baseline), null);
  assert.equal(client.assembleDeltaNotes({ format: 2, notes: [] }, baseline), null);
  assert.equal(client.assembleDeltaNotes({ format: 1, notes: 'x' }, baseline), null);
  assert.equal(client.assembleDeltaNotes(null, baseline), null);
  assert.equal(client.assembleDeltaNotes({ format: 1, notes: [null] }, baseline), null);
  assert.deepEqual(plain(client.assembleDeltaNotes({ format: 1, notes: [{ id: 'a', unchanged: true }] }, baseline)), [{ id: 'a' }]);
});

test('rakitan memakai salinan baseline (mengubah hasil tidak merusak baseline)', () => {
  const client = makeClient([]);
  const held = { id: 'a', title: 'T' };
  const baseline = new Map([['a', held]]);
  const out = client.assembleDeltaNotes({ format: 1, notes: [{ id: 'a', unchanged: true }] }, baseline);
  out[0].title = 'diubah';
  assert.equal(held.title, 'T');
});

test('INVARIAN (acak): untuk urutan perubahan server apa pun, delta yang dirakit == getNotes penuh', () => {
  let seedState = 12345;
  const rand = () => (seedState = (seedState * 1664525 + 1013904223) >>> 0) / 4294967296;
  const env = createEnvironment();
  const ids = seed(env, 12);
  let clientNotes = plain(env.api.getNotes());
  let created = 0;
  for (let step = 0; step < 160; step++) {
    const live = plain(env.api.getNotes());
    const pick = () => live[Math.floor(rand() * live.length)];
    const op = Math.floor(rand() * 7);
    if (live.length) {
      const n = pick();
      if (op === 0) env.DriveApp.getFileById(n.id).setContent(META(n.title) + '<p>luar ' + step + '</p>');
      else if (op === 1) env.DriveApp.getFileById(n.id).name = 'R' + step + '.md';
      else if (op === 2) { const f = env.DriveApp.getFileById(n.id); const fo = [env.storage, ...[...Array(1)].map(() => env.storage.getFolders().next())]; const to = fo[Math.floor(rand() * 2)]; const from = f.getParents().next(); if (from !== to) { to.addFile(f); from.removeFile(f); } }
      else if (op === 3) env.api.saveNote({ ...n, isPinned: !n.isPinned, title: n.title }, 'p' + step);
      else if (op === 4 && live.length > 3) env.api.deleteNote(n.id, n.baseUpdatedAt, 'd' + step);
      else if (op === 5) env.api.saveNote(base({ title: 'Baru ' + (created++), content: '<p>' + 'x'.repeat(Math.floor(rand() * 50)) + '</p>' }), 'c' + step);
    }
    if (rand() < 0.35) clientNotes = plain(env.api.getNotes());     // klien kadang sinkron
    const pending = rand() < 0.3 && clientNotes.length ? [{ type: 'save', id: clientNotes[0].id, opId: 'q' }] : [];
    const r = roundTrip(env, clientNotes, pending);
    assert.deepEqual(r.assembled, r.full, 'langkah ' + step + ' op ' + op);
  }
});
