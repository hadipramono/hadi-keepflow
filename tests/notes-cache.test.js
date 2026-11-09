'use strict';
/**
 * The local notes cache (IndexedDB with localStorage fallback) is extracted from
 * AppScripts.html and run against fake-indexeddb. A "reload" is a new cache
 * instance sharing the same IndexedDB and localStorage.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { IDBFactory } = require('fake-indexeddb');
const FDBDatabase = (m => m.default || m)(require('fake-indexeddb/lib/FDBDatabase'));

const html = fs.readFileSync(path.join(__dirname, '..', 'AppScripts.html'), 'utf8');
const SOURCE = html.slice(html.indexOf('// <notes-cache>'), html.indexOf('// </notes-cache>'));
assert.ok(SOURCE.length > 500, 'blok notes-cache tidak ditemukan');

const LOCAL_KEY = 'hadi_keepflow_offline_notes_v1';
const plain = v => JSON.parse(JSON.stringify(v));
const note = (id, extra = {}) => ({ id, title: 'Judul ' + id, content: '<p>isi ' + id + ' é😀</p>', category: '', tags: [], isPinned: false, isArchived: false, baseUpdatedAt: 'v1', ...extra });

function makeStorage(quotaChars) {
  const map = new Map();
  return {
    map,
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem(k, v) {
      const total = [...map].reduce((n, [mk, mv]) => n + (mk === k ? 0 : mk.length + mv.length), 0) + k.length + String(v).length;
      if (quotaChars && total > quotaChars) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; }
      map.set(k, String(v));
    },
    removeItem: k => { map.delete(k); }
  };
}

function makeEnv(over = {}) {
  return { factory: new IDBFactory(), storage: makeStorage(over.quota), ...over };
}

/** A fresh cache instance ("page load") on top of the environment. */
function openCache(env, state = { notes: [], errors: [] }, overrides = {}) {
  const context = {
    indexedDB: 'indexedDB' in overrides ? overrides.indexedDB : env.factory,
    localStorage: env.storage, LOCAL_KEY, console: { warn() {}, error() {}, log() {} },
    setTimeout, clearTimeout, Promise, JSON, Map, Set, Array, Object, String, Error, Infinity
  };
  vm.createContext(context);
  const cache = vm.runInContext(SOURCE + '\n;NotesCache', context);
  cache.init({ getNotes: () => state.notes, onError: e => state.errors.push(e) });
  return { cache, state };
}

async function settle(cache) { await new Promise(r => setTimeout(r, 0)); await cache.flush(); await new Promise(r => setTimeout(r, 0)); await cache.flush(); }

test('cache kosong: load mengembalikan [] dan mode idb', async () => {
  const env = makeEnv(); const { cache } = openCache(env);
  assert.deepEqual(plain(await cache.load()), []);
  assert.equal(cache.mode, 'idb');
});

test('simpan lalu "muat ulang": isi dan URUTAN persis sama (termasuk id numerik dan karakter khusus)', async () => {
  const env = makeEnv();
  const a = openCache(env); await a.cache.load();
  a.state.notes = [note('zz'), note('aa'), note('mm', { content: '<p>"kutip" \\ \u2028 😀</p>' })];
  a.cache.save(); await settle(a.cache);
  const b = openCache(env);
  const loaded = plain(await b.cache.load());
  assert.deepEqual(loaded.map(n => n.id), ['zz', 'aa', 'mm']);
  assert.deepEqual(loaded, plain(a.state.notes));
});

test('penulisan inkremental: hanya catatan yang berubah yang ditulis', async () => {
  const env = makeEnv(); const { cache, state } = openCache(env); await cache.load();
  state.notes = Array.from({ length: 50 }, (_, i) => note('n' + i));
  cache.save(); await settle(cache);
  assert.equal(cache.stats.puts, 50);
  state.notes[7] = { ...state.notes[7], title: 'Diubah' };
  cache.save(); await settle(cache);
  assert.equal(cache.stats.puts, 51, 'hanya 1 put tambahan');
  assert.equal(cache.stats.deletes, 0);
  cache.save(); await settle(cache);
  assert.equal(cache.stats.puts, 51, 'tanpa perubahan: tidak ada penulisan');
});

test('catatan yang dihapus dari memori ikut terhapus di IndexedDB', async () => {
  const env = makeEnv(); const a = openCache(env); await a.cache.load();
  a.state.notes = [note('a'), note('b'), note('c')];
  a.cache.save(); await settle(a.cache);
  a.state.notes = a.state.notes.filter(n => n.id !== 'b');
  a.cache.save(); await settle(a.cache);
  assert.equal(a.cache.stats.deletes, 1);
  const b = openCache(env);
  assert.deepEqual(plain(await b.cache.load()).map(n => n.id), ['a', 'c']);
});

test('perubahan urutan saja pun tersimpan', async () => {
  const env = makeEnv(); const a = openCache(env); await a.cache.load();
  a.state.notes = [note('a'), note('b'), note('c')];
  a.cache.save(); await settle(a.cache);
  a.state.notes = [a.state.notes[2], a.state.notes[0], a.state.notes[1]];
  a.cache.save(); await settle(a.cache);
  const b = openCache(env);
  assert.deepEqual(plain(await b.cache.load()).map(n => n.id), ['c', 'a', 'b']);
});

test('banyak save() sinkron digabung menjadi satu penulisan', async () => {
  const env = makeEnv(); const { cache, state } = openCache(env); await cache.load();
  state.notes = [note('a')];
  for (let i = 0; i < 40; i++) cache.save();
  await settle(cache);
  assert.equal(cache.stats.flushes, 1);
});

test('save() saat penulisan SEDANG berjalan: keadaan akhir sama dengan yang terbaru', async () => {
  const env = makeEnv(); const a = openCache(env); await a.cache.load();
  a.state.notes = [note('a')];
  a.cache.save();
  await Promise.resolve(); await Promise.resolve();      // microtask flush sudah mulai; transaksi belum selesai
  a.state.notes = [note('a', { title: 'v2' }), note('b')];
  a.cache.save();                                        // datang di tengah penulisan
  await new Promise(r => setTimeout(r, 60));            // sengaja TANPA flush() manual: harus selesai sendiri
  const b = openCache(env);
  const loaded = plain(await b.cache.load());
  assert.deepEqual(loaded.map(n => [n.id, n.title]), [['a', 'v2'], ['b', 'Judul b']]);
});

test('save() sebelum load() selesai TIDAK menghapus cache yang tersimpan', async () => {
  const env = makeEnv();
  const a = openCache(env); await a.cache.load();
  a.state.notes = [note('a'), note('b')];
  a.cache.save(); await settle(a.cache);
  const b = openCache(env);                              // halaman baru, state masih kosong
  b.cache.save(); await settle(b.cache);                 // dipanggil sebelum load()
  const loaded = plain(await b.cache.load());
  assert.deepEqual(loaded.map(n => n.id), ['a', 'b']);
});

test('migrasi dari localStorage: data berpindah, terverifikasi, salinan lama dihapus', async () => {
  const env = makeEnv();
  const legacy = [note('x1'), note('x2', { content: '<p>é😀</p>' }), note('x3')];
  env.storage.setItem(LOCAL_KEY, JSON.stringify(legacy));
  const a = openCache(env);
  const loaded = plain(await a.cache.load());
  assert.deepEqual(loaded, legacy);
  assert.equal(env.storage.getItem(LOCAL_KEY), null, 'salinan lama dihapus setelah terverifikasi');
  const b = openCache(env);                              // muat ulang membaca dari IndexedDB
  assert.deepEqual(plain(await b.cache.load()), legacy);
});

test('salinan localStorage basi setelah migrasi diabaikan dan dibersihkan (IndexedDB menang)', async () => {
  const env = makeEnv();
  env.storage.setItem(LOCAL_KEY, JSON.stringify([note('lama')]));
  await openCache(env).cache.load();                     // migrasi
  env.storage.setItem(LOCAL_KEY, JSON.stringify([note('basi')]));   // mis. versi aplikasi lama menulis lagi
  const loaded = plain(await openCache(env).cache.load());
  assert.deepEqual(loaded.map(n => n.id), ['lama']);
  assert.equal(env.storage.getItem(LOCAL_KEY), null);
});

test('migrasi gagal (penulisan ditolak): salinan localStorage TIDAK dihapus dan data tetap dimuat', async () => {
  const env = makeEnv();
  const legacy = [note('a'), note('b')];
  env.storage.setItem(LOCAL_KEY, JSON.stringify(legacy));
  const original = FDBDatabase.prototype.transaction;
  FDBDatabase.prototype.transaction = function (stores, mode) {
    if (mode === 'readwrite') { const e = new Error('disk penuh'); e.name = 'QuotaExceededError'; throw e; }
    return original.apply(this, arguments);
  };
  try {
    const a = openCache(env);
    const loaded = plain(await a.cache.load());
    assert.deepEqual(loaded, legacy, 'data tetap tersedia dari localStorage');
    assert.equal(a.cache.mode, 'localstorage');
    assert.ok(env.storage.getItem(LOCAL_KEY), 'salinan lama harus utuh');
  } finally { FDBDatabase.prototype.transaction = original; }
});

test('IndexedDB tidak tersedia: fallback penuh ke localStorage (baca dan tulis)', async () => {
  const env = makeEnv();
  env.storage.setItem(LOCAL_KEY, JSON.stringify([note('ls')]));
  const a = openCache(env, undefined, { indexedDB: undefined });
  assert.deepEqual(plain(await a.cache.load()).map(n => n.id), ['ls']);
  assert.equal(a.cache.mode, 'localstorage');
  a.state.notes = [note('ls'), note('baru')];
  a.cache.save();
  assert.deepEqual(JSON.parse(env.storage.getItem(LOCAL_KEY)).map(n => n.id), ['ls', 'baru'], 'localStorage ditulis sinkron');
});

test('IndexedDB tidak merespons (open menggantung): fallback setelah timeout', async () => {
  const env = makeEnv();
  env.storage.setItem(LOCAL_KEY, JSON.stringify([note('ls')]));
  const hanging = { open: () => ({}) };                   // tidak pernah memicu onsuccess/onerror
  const a = openCache(env, undefined, { indexedDB: hanging });
  a.cache.config.openTimeoutMs = 30;
  assert.deepEqual(plain(await a.cache.load()).map(n => n.id), ['ls']);
  assert.equal(a.cache.mode, 'localstorage');
});

test('IndexedDB melempar saat open: fallback ke localStorage', async () => {
  const env = makeEnv();
  const broken = { open() { throw new Error('SecurityError'); } };
  const a = openCache(env, undefined, { indexedDB: broken });
  assert.deepEqual(plain(await a.cache.load()), []);
  assert.equal(a.cache.mode, 'localstorage');
});

test('kegagalan menulis (kuota): onError dipanggil, tidak dianggap tersimpan, percobaan berikutnya berhasil', async () => {
  const env = makeEnv(); const a = openCache(env); await a.cache.load();
  a.state.notes = [note('a')];
  const original = FDBDatabase.prototype.transaction;
  FDBDatabase.prototype.transaction = function (stores, mode) {
    if (mode === 'readwrite') { const e = new Error('penuh'); e.name = 'QuotaExceededError'; throw e; }
    return original.apply(this, arguments);
  };
  try { a.cache.save(); await settle(a.cache); } finally { FDBDatabase.prototype.transaction = original; }
  assert.equal(a.state.errors.length >= 1, true);
  assert.equal(a.state.errors[0].name, 'QuotaExceededError');
  a.cache.save(); await settle(a.cache);                  // ruang tersedia lagi
  assert.deepEqual(plain(await openCache(env).cache.load()).map(n => n.id), ['a']);
});

test('record rusak diabaikan, record valid tetap dimuat', async () => {
  const env = makeEnv(); const a = openCache(env); await a.cache.load();
  a.state.notes = [note('a'), note('b')];
  a.cache.save(); await settle(a.cache);
  // Sisipkan record sampah langsung ke IndexedDB.
  const db = await new Promise((res, rej) => { const r = env.factory.open('hadi_keepflow', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  await new Promise((res, rej) => { const tx = db.transaction('notes', 'readwrite'); tx.objectStore('notes').put('bukan objek', 'sampah'); tx.objectStore('notes').put([1, 2], 'larik'); tx.oncomplete = res; tx.onerror = rej; });
  db.close();
  const loaded = plain(await openCache(env).cache.load());
  assert.deepEqual(loaded.map(n => n.id), ['a', 'b']);
});

test('data besar (30 catatan x 400 KB = 12 MB) tersimpan; localStorage 5 MB tidak sanggup', async () => {
  const big = i => note('big' + i, { content: '<p>' + 'x'.repeat(400000) + '</p>' });
  const notes = Array.from({ length: 30 }, (_, i) => big(i));
  // Perilaku lama: satu JSON besar ke localStorage berbatas ~5 juta karakter.
  const lsEnv = makeEnv({ quota: 5000000 });
  assert.throws(() => lsEnv.storage.setItem(LOCAL_KEY, JSON.stringify(notes)), /quota/);
  // Perilaku baru: IndexedDB.
  const env = makeEnv(); const a = openCache(env); await a.cache.load();
  a.state.notes = notes;
  a.cache.save(); await settle(a.cache);
  assert.equal(a.state.errors.length, 0);
  const loaded = await openCache(env).cache.load();
  assert.equal(loaded.length, 30);
  assert.equal(loaded[29].content.length, 400000 + 7);
});

test('flushNow menulis segera walau save() tidak dipanggil (untuk pagehide)', async () => {
  const env = makeEnv(); const a = openCache(env); await a.cache.load();
  a.state.notes = [note('a')];
  await a.cache.flushNow();
  assert.deepEqual(plain(await openCache(env).cache.load()).map(n => n.id), ['a']);
});

test('save() selama load() berlangsung (setelah DB terbuka) tidak menghapus cache', async () => {
  const env = makeEnv(); const a = openCache(env); await a.cache.load();
  a.state.notes = [note('c'), note('a'), note('b')];     // urutan sengaja bukan alfabet
  a.cache.save(); await settle(a.cache);
  const b = openCache(env);                              // state kosong, seolah belum dimuat
  let done = false;
  const loading = b.cache.load().then(v => { done = true; return v; });
  for (let i = 0; i < 2000 && !done; i++) { b.cache.save(); b.cache.flushNow(); await new Promise(r => setImmediate(r)); }
  const loaded = plain(await loading);
  assert.deepEqual(loaded.map(n => n.id), ['c', 'a', 'b']);
  assert.deepEqual(plain(await openCache(env).cache.load()).map(n => n.id), ['c', 'a', 'b'], 'data dan urutan di IndexedDB utuh');
});

test('transaksi yang GAGAL secara asinkron (abort) tidak dianggap tersimpan dan ditulis ulang berikutnya', async () => {
  const env = makeEnv(); const a = openCache(env); await a.cache.load();
  a.state.notes = [note('a')];
  const FDBObjectStore = (m => m.default || m)(require('fake-indexeddb/lib/FDBObjectStore'));
  const originalPut = FDBObjectStore.prototype.put;
  FDBObjectStore.prototype.put = function () {
    const r = originalPut.apply(this, arguments);
    const tx = this.transaction;
    Promise.resolve().then(() => { try { tx.abort(); } catch (e) { /* sudah selesai */ } });   // gagal SETELAH semua put antre
    return r;
  };
  try { a.cache.save(); await settle(a.cache); } finally { FDBObjectStore.prototype.put = originalPut; }
  assert.ok(a.state.errors.length >= 1, 'kegagalan harus dilaporkan');
  assert.deepEqual(plain(await openCache(env).cache.load()), [], 'tidak ada yang tertulis');
  a.cache.save(); await settle(a.cache);                  // tanpa gangguan
  assert.deepEqual(plain(await openCache(env).cache.load()).map(n => n.id), ['a'], 'harus ditulis ulang, bukan dikira sudah tersimpan');
});

test('perubahan di tempat (objek yang sama dimutasi) tetap terdeteksi dan tersimpan', async () => {
  const env = makeEnv(); const a = openCache(env); await a.cache.load();
  a.state.notes = [note('a'), note('b')];
  a.cache.save(); await settle(a.cache);
  a.state.notes[1].title = 'Dimutasi di tempat';          // objek sama, bukan salinan
  a.state.notes[1].tags.push('baru');
  a.cache.save(); await settle(a.cache);
  const loaded = plain(await openCache(env).cache.load());
  assert.equal(loaded[1].title, 'Dimutasi di tempat');
  assert.deepEqual(loaded[1].tags, ['baru']);
});
