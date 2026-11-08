'use strict';
/**
 * The note format is implemented twice (NoteFormat.gs on the server, inline in
 * AppScripts.html for backup/restore). This test extracts the browser functions
 * straight from AppScripts.html and checks they agree with the server ones.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createEnvironment } = require('./drive-mock');

const html = fs.readFileSync(path.join(__dirname, '..', 'AppScripts.html'), 'utf8');

function extractFunction(name) {
  const start = html.indexOf('function ' + name + '(');
  assert.notEqual(start, -1, 'fungsi tidak ditemukan di AppScripts.html: ' + name);
  const open = html.indexOf('{', html.indexOf(')', start));
  let depth = 0;
  for (let i = open; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}' && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error('kurung tidak seimbang: ' + name);
}

const names = ['yamlString', 'serializeNoteFile', 'parseYamlScalar', 'parseYamlTags', 'parseNoteText', 'looksLikeHtml', 'plainTextToHtml', 'escapeHTML', 'normalizeBooleanFlag'];
const client = {};
vm.createContext(client);
vm.runInContext(names.map(extractFunction).join('\n'), client);

const { api: server } = createEnvironment();
const plain = value => JSON.parse(JSON.stringify(value));

function rng(seed) { let s = seed; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const ALPHABET = ['a', 'Z', ' ', '"', "'", '\\', ':', ',', '#', '-', '---', '\n', '\r\n', '\t', '\u2028', '\u2029', 'é', '😀', '[', ']', '{', '}', '%', '<', '>', '&', '0', 'true', 'null'];
function randomText(rand, max) {
  let out = '';
  for (let i = Math.floor(rand() * max); i > 0; i--) out += ALPHABET[Math.floor(rand() * ALPHABET.length)];
  return out;
}

test('klien dan server menghasilkan teks file yang identik byte demi byte', () => {
  const rand = rng(42);
  for (let i = 0; i < 300; i++) {
    const meta = {
      title: randomText(rand, 12).replace(/[\r\n\u2028\u2029]/g, ' '),
      createdAt: '2026-11-01T00:00:00.000Z',
      isPinned: rand() > 0.5, isArchived: rand() > 0.5,
      tags: [randomText(rand, 5), randomText(rand, 5)].filter(Boolean)
    };
    const body = randomText(rand, 40);
    assert.equal(client.serializeNoteFile(meta, body), server.serializeNoteFile(meta, body), 'iterasi ' + i);
  }
});

test('acak: yang ditulis salah satu sisi dibaca sama persis oleh sisi lain', () => {
  const rand = rng(7);
  for (let i = 0; i < 400; i++) {
    const meta = {
      title: randomText(rand, 12).replace(/[\r\n\u2028\u2029]/g, ' ').trim(),
      createdAt: '2026-11-01T00:00:00.000Z',
      isPinned: rand() > 0.5, isArchived: rand() > 0.5,
      tags: [randomText(rand, 5), randomText(rand, 5)].filter(Boolean)
    };
    const body = randomText(rand, 60);
    const text = server.serializeNoteFile(meta, body);
    for (const parser of [server.parseNoteText, client.parseNoteText]) {
      const parsed = plain(parser(text));
      assert.equal(parsed.format, 'v2', 'iterasi ' + i + ' ' + JSON.stringify(text));
      assert.equal(parsed.body, body, 'isi iterasi ' + i);
      assert.equal(parsed.meta.title, meta.title);
      assert.deepEqual(parsed.meta.tags, meta.tags);
      assert.equal(parsed.meta.isPinned, meta.isPinned);
      assert.equal(parsed.meta.isArchived, meta.isArchived);
    }
  }
});

test('file legacy v1 dan teks polos dibaca sama oleh klien dan server', () => {
  const samples = [
    '---JSON---\n{"isPinned":true,"tags":["a"],"createdAt":"2025-01-01T00:00:00.000Z"}\n---JSON---\n\n<p>x</p>',
    '---JSON---\n{rusak\n---JSON---\n\nisi',
    'teks biasa',
    '---\ntitle: asing\n---\n\nisi',
    '\uFEFF---\r\nkeepflow: 2\r\ntitle: "T"\r\ntags:\r\n  - a\r\n---\r\n\r\nB'
  ];
  samples.forEach(text => assert.deepEqual(plain(client.parseNoteText(text)), plain(server.parseNoteText(text)), text));
});

test('plainTextToHtml meloloskan HTML dan menjaga baris kosong', () => {
  assert.equal(client.plainTextToHtml('a <b>\n\nc & d'), '<p>a &lt;b&gt;</p><p><br></p><p>c &amp; d</p>');
  assert.equal(client.looksLikeHtml('<p>x</p>'), true);
  assert.equal(client.looksLikeHtml('a < b dan c > d'), false);
  assert.equal(client.looksLikeHtml('# Judul\n\n- butir'), false);
});
