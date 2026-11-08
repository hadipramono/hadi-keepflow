'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createEnvironment } = require('./drive-mock');
const { api } = createEnvironment();

const sample = {
  title: 'Rapat: anggaran "Q4" \\ 100%',
  createdAt: '2026-11-01T00:00:00.000Z',
  isPinned: true, isArchived: false,
  tags: ['rapat', 'q4, final', 'a:b', 'é😀', '"kutip"']
};

test('v2: serialize lalu parse mengembalikan data yang sama', () => {
  const body = '<p>Halo</p>\n<ul class="keepflow-checklist"><li><input type="checkbox"> <span>x</span></li></ul>';
  const text = api.serializeNoteFile(sample, body);
  assert.match(text, /^---\nkeepflow: 2\n/);
  const parsed = api.parseNoteText(text);
  assert.equal(parsed.format, 'v2');
  assert.equal(parsed.body, body);
  assert.deepEqual({ ...parsed.meta }, { ...sample, tags: [...sample.tags] });
});

test('v2: front matter adalah JSON-literal per baris (aman dibaca parser YAML)', () => {
  const text = api.serializeNoteFile({ ...sample, title: 'a\u2028b' }, 'x');
  const header = text.split('\n---\n')[0];
  assert.ok(!/\u2028/.test(header), 'U+2028 harus di-escape');
  header.split('\n').slice(1).forEach(line => assert.match(line, /^[a-z_]+: .*/));
});

test('v2: isi yang diawali --- atau ---JSON--- tidak mengganggu pemisah', () => {
  for (const body of ['---\nsisa', '---JSON---\n{}', '\n\nbaris kosong di awal', '', '---']) {
    const parsed = api.parseNoteText(api.serializeNoteFile(sample, body));
    assert.equal(parsed.format, 'v2');
    assert.equal(parsed.body, body);
  }
});

test('v1 (legacy ---JSON---) tetap terbaca', () => {
  const legacy = '---JSON---\n{\n  "isPinned": true,\n  "isArchived": "true",\n  "tags": ["a", 3, "b"],\n  "createdAt": "2025-01-02T03:04:05.000Z"\n}\n---JSON---\n\n<p>isi</p>';
  const parsed = api.parseNoteText(legacy);
  assert.equal(parsed.format, 'v1');
  assert.equal(parsed.body, '<p>isi</p>');
  assert.equal(parsed.meta.isPinned, true);
  assert.equal(parsed.meta.isArchived, true);
  assert.deepEqual([...parsed.meta.tags], ['a', 'b']);
  assert.equal(parsed.meta.createdAt, '2025-01-02T03:04:05.000Z');
});

test('v1 dengan metadata rusak: seluruh teks dipertahankan, tidak ada yang hilang', () => {
  const broken = '---JSON---\n{not json\n---JSON---\n\nisi';
  const parsed = api.parseNoteText(broken);
  assert.equal(parsed.format, 'plain');
  assert.equal(parsed.body, broken);
});

test('file polos dan YAML asing tanpa kunci keepflow tidak diubah', () => {
  assert.equal(api.parseNoteText('hanya teks').body, 'hanya teks');
  const foreign = '---\ntitle: Dari Obsidian\ntags: [x]\n---\n\nIsi';
  const parsed = api.parseNoteText(foreign);
  assert.equal(parsed.format, 'plain');
  assert.equal(parsed.body, foreign);
});

test('v2 yang diedit manual: tag blok, skalar polos, kutip tunggal, CRLF, BOM', () => {
  const text = '\uFEFF---\r\nkeepflow: 2\r\ntitle: \'Judul O\'\'Brien\'\r\npinned: true\r\ntags:\r\n  - satu\r\n  - "dua"\r\n---\r\n\r\nIsi';
  const parsed = api.parseNoteText(text);
  assert.equal(parsed.format, 'v2');
  assert.equal(parsed.meta.title, "Judul O'Brien");
  assert.equal(parsed.meta.isPinned, true);
  assert.deepEqual([...parsed.meta.tags], ['satu', 'dua']);
  assert.equal(parsed.body, 'Isi');
});

test('resolveNoteTitle: judul asli dipertahankan, nama file hasil rename luar menang', () => {
  assert.equal(api.resolveNoteTitle('Roma 8- Ayat 1.md', 'Roma 8: Ayat 1'), 'Roma 8: Ayat 1');
  assert.equal(api.resolveNoteTitle('Rapat (2).md', 'Rapat'), 'Rapat');
  assert.equal(api.resolveNoteTitle('Rapat (2).md', 'Rapat (2)'), 'Rapat (2)');
  assert.equal(api.resolveNoteTitle('Nama Baru.md', 'Rapat'), 'Nama Baru');
  assert.equal(api.resolveNoteTitle('Tanpa Meta.md', ''), 'Tanpa Meta');
});
