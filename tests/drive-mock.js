'use strict';
/**
 * Minimal in-memory stand-ins for the Apps Script services used by the backend
 * (DriveApp, LockService, PropertiesService, Utilities). Only what KeepFlow
 * calls is implemented. Not a faithful Drive emulator.
 */
const crypto = require('crypto');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

function iter(items) {
  let i = 0;
  return { hasNext: () => i < items.length, next: () => items[i++] };
}

function createEnvironment(options = {}) {
  let clock = Date.parse('2026-11-01T00:00:00.000Z');
  let idCounter = 0;
  const tick = () => new Date((clock += 1000));
  const nodes = new Map();
  // Number of file-content downloads, the expensive Drive operation.
  const counters = { noteReads: 0, indexReads: 0 };
  const INDEX_NAME = '.keepflow-index.json';

  class Node {
    constructor(name, isFolder) {
      this.id = (isFolder ? 'folder' : 'file') + (++idCounter);
      this.name = name; this.isFolder = isFolder; this.trashed = false;
      this.parents = []; this.children = []; this.content = '';
      this.created = tick(); this.updated = this.created;
      nodes.set(this.id, this);
    }
    getId() { return this.id; }
    getName() { return this.name; }
    setName(n) { this.name = n; this.updated = tick(); return this; }
    isTrashed() { return this.trashed; }
    setTrashed(v) { this.trashed = !!v; this.updated = tick(); return this; }
    getParents() { return iter(this.parents.filter(p => !p.trashed || true)); }
    getLastUpdated() { return this.updated; }
    getDateCreated() { return this.created; }
    getBlob() {
      const self = this;
      return { getDataAsString: () => {
        if (self.name !== INDEX_NAME && options.throwAfterNoteReads != null && counters.noteReads >= options.throwAfterNoteReads) {
          throw new Error('simulasi: batas waktu eksekusi habis');
        }
        counters[self.name === INDEX_NAME ? 'indexReads' : 'noteReads']++;
        return self.content;
      } };
    }
    setContent(c) {
      if (options.failIndexWrite && this.name === INDEX_NAME) throw new Error('simulasi: gagal menulis indeks');
      this.content = String(c); this.updated = tick(); return this;
    }
    // folder API
    getFolders() { return iter(this.children.filter(c => c.isFolder)); }
    getFiles() { return iter(this.children.filter(c => !c.isFolder)); }
    getFoldersByName(n) { return iter(this.children.filter(c => c.isFolder && !c.trashed && c.name === n)); }
    getFilesByName(n) { return iter(this.children.filter(c => !c.isFolder && !c.trashed && c.name === n)); }
    createFolder(n) { const f = new Node(n, true); f.parents.push(this); this.children.push(f); return f; }
    createFile(n, content) { if (options.failIndexWrite && n === INDEX_NAME) throw new Error('simulasi: gagal menulis indeks'); const f = new Node(n, false); f.content = String(content); f.parents.push(this); this.children.push(f); return f; }
    addFile(file) { if (!this.children.includes(file)) { this.children.push(file); file.parents.push(this); } return this; }
    removeFile(file) { this.children = this.children.filter(c => c !== file); file.parents = file.parents.filter(p => p !== this); return this; }
  }

  const root = new Node('Root', true);
  const DriveApp = {
    getRootFolder: () => root,
    getFileById(id) { const n = nodes.get(id); if (!n || n.isFolder) throw new Error('Not found: ' + id); return n; }
  };

  const props = new Map();
  let propertyReads = 0;
  const PropertiesService = {
    getScriptProperties: () => ({
      getProperty: k => (props.has(k) ? props.get(k) : null),
      getProperties: () => { propertyReads++; return Object.fromEntries(props); },
      setProperty: (k, v) => {
        const size = [...props].reduce((n, [pk, pv]) => n + pk.length + pv.length, 0) + k.length + String(v).length;
        if (options.propertyQuota && size > options.propertyQuota) throw new Error('Exceeded maximum property storage size');
        props.set(k, String(v));
      },
      deleteProperty: k => { props.delete(k); }
    })
  };

  const context = {
    DriveApp, PropertiesService,
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      computeDigest: (alg, s) => [...crypto.createHash('sha256').update(String(s)).digest()].map(b => (b > 127 ? b - 256 : b)),
      base64EncodeWebSafe: bytes => Buffer.from(bytes.map(b => (b < 0 ? b + 256 : b))).toString('base64url')
    },
    MimeType: { PLAIN_TEXT: 'text/plain' },
    HtmlService: { createHtmlOutputFromFile: n => ({ getContent: () => '<!-- ' + n + ' -->' }) },
    console: { log() {}, warn() {}, error() {} },
    Map, Set, Date, JSON, Math, Array, Object, String, Number, Promise, Error, RegExp
  };
  vm.createContext(context);

  const repo = path.join(__dirname, '..');
  const files = ['Code.gs', 'DriveStorage.gs', 'SyncOperations.gs', 'NoteFormat.gs', 'NotesIndex.gs', 'NotesApi.gs'];
  // `var`/function declarations land on the context; const/let would not, so
  // expose the few top-level constants the tests read.
  const source = files.map(f => fs.readFileSync(path.join(repo, f), 'utf8')).join('\n;\n');
  vm.runInContext(source, context, { filename: 'backend.gs' });

  const storage = root.createFolder('apps').createFolder('KeepFlow').createFolder('storage');
  return { api: context, root, storage, DriveApp, props, tick, counters, options, propertyReads: () => propertyReads, Node };
}

module.exports = { createEnvironment };
