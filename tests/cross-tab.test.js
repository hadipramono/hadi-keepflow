'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'AppScripts.html'), 'utf8');

test('cross-tab transport uses BroadcastChannel and storage-event fallback', () => {
  assert.match(app, /new BroadcastChannel\(CROSS_TAB_CHANNEL_NAME\)/);
  assert.match(app, /window\.addEventListener\('storage'/);
  assert.match(app, /CROSS_TAB_SIGNAL_KEY/);
});

test('cross-tab messages contain invalidation metadata, not note bodies', () => {
  const start = app.indexOf('function publishCrossTabMessage(');
  const end = app.indexOf('\n    function handleCrossTabMessage', start);
  const body = app.slice(start, end);
  assert.match(body, /source: CROSS_TAB_TAB_ID/);
  assert.match(body, /kind,/);
  assert.match(body, /noteId:/);
  assert.doesNotMatch(body, /content:|\.content\s*[,}]/);
});

test('remote tab reloads shared queue and protects an open editor', () => {
  const start = app.indexOf('function handleCrossTabMessage(');
  const end = app.indexOf('\n    function initCrossTabSync', start);
  const body = app.slice(start, end);
  assert.match(body, /readQueue\(\)/);
  assert.match(body, /repairNotesFromQueue\(\)/);
  assert.match(body, /crossTabRefreshPending = true/);
  assert.match(body, /loadInitialData\(\)/);
});

test('sync lease prevents a second tab from immediately sending the same queue head', () => {
  assert.match(app, /function claimSyncLease\(/);
  assert.match(app, /SYNC_LEASE_TTL_MS = 60000/);
  assert.match(app, /if \(!claimSyncLease\(\)\)/);
  assert.match(app, /function releaseSyncLease\(/);
  assert.match(app, /publishCrossTabMessage\('sync-unlocked'\)/);
});

test('remote refresh does not rebroadcast indefinitely', () => {
  assert.match(app, /function persistLocal\(announceCrossTab = true\)/);
  assert.match(app, /persistLocal\(!crossTabRefreshInProgress\)/);
  assert.match(app, /crossTabRefreshInProgress = false/);
});
