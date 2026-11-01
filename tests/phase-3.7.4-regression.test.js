/**
 * Lightweight Node regression tests for Phase 3.7.4.
 * Run from the project root: node tests/phase-3.7.4-regression.test.js
 * Google Apps Script services are mocked; this does not replace live testing.
 */
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const backendFiles = ['Code.gs', 'DriveStorage.gs', 'NotesApi.gs', 'SyncOperations.gs'];
const source = backendFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const context = {
  console,
  Date,
  Map,
  Set,
  JSON,
  String,
  Array,
  Object,
  RegExp,
  MimeType: { PLAIN_TEXT: 'text/plain' },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  safeName: (value, fallback) => String(value || fallback || '')
    .replace(/[\/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim() || fallback,
  toBoolean: value => value === true || value === 1 || String(value).toLowerCase() === 'true'
};
vm.createContext(context);
vm.runInContext(source, context);

function iterator(items) {
  let index = 0;
  return {
    hasNext() { return index < items.length; },
    next() { return items[index++]; }
  };
}

// 1. A save with category casing different from the existing folder must reuse
// that folder and return its canonical name, not create a duplicate.
let duplicateFolderCreated = false;
const existingCategory = {
  getName: () => 'Studi Alkitab',
  getId: () => 'category-1',
  isTrashed: () => false,
  getFilesByName: () => iterator([]),
  createFile(name, content) {
    return {
      id: 'new-note-1', name, content,
      getId() { return this.id; },
      getLastUpdated() { return new Date('2026-11-01T00:00:00Z'); },
      setName(value) { this.name = value; },
      setContent(value) { this.content = value; }
    };
  }
};
const storageForSave = {
  getId: () => 'storage-1',
  getFolders: () => iterator([existingCategory]),
  createFolder(name) {
    duplicateFolderCreated = true;
    throw new Error('Unexpected duplicate category folder: ' + name);
  }
};
context.getStorageFolder = () => storageForSave;
context.getOperationReceipt = () => null;
context.replayOperationReceipt = () => null;
context.storeOperationReceipt = () => {};
const saved = context.saveNote({
  title: 'Catatan Uji',
  category: 'STUDI ALKITAB',
  content: 'Isi uji'
}, 'phase374-case-category');
assert.strictEqual(saved.status, 'success');
assert.strictEqual(saved.note.category, 'Studi Alkitab');
assert.strictEqual(duplicateFolderCreated, false);

// 2. During a recoverable two-parent Drive move, root is collected first and
// must win de-duplication so the note is represented as Inbox.
const storageRoot = {
  getFiles: () => iterator([]),
  getFolders: () => iterator([existingCategory])
};
context.getStorageFolder = () => storageRoot;
context.collectFolderNotes = (folder, category, result) => {
  if (folder === storageRoot) {
    result.push({ id: 'shared-file', category: '', updatedAt: '2026-11-01T00:00:00Z' });
  } else if (folder === existingCategory) {
    result.push({ id: 'shared-file', category: 'Studi Alkitab', updatedAt: '2026-11-01T00:00:00Z' });
  }
};
const notes = context.getNotes();
assert.strictEqual(notes.length, 1);
assert.strictEqual(notes[0].category, '');

// 3. Backup must use the same Inbox-first representation as the live note read.
const snapshot = context.getBackupSnapshot();
assert.strictEqual(snapshot.notes.length, 1);
assert.strictEqual(snapshot.notes[0].category, '');
assert.strictEqual(snapshot.noteCount, 1);

console.log('PASS: saveNote reuses case-insensitive canonical category folder');
console.log('PASS: getNotes prefers storage-root note during two-parent recovery');
console.log('PASS: getBackupSnapshot prefers storage-root note during two-parent recovery');
