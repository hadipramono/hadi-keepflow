/**
 * Hadi KeepFlow v1.3.8 backend module.
 * Apps Script .gs files share one global namespace.
 */

/**
 * Idempotency receipts make a retry safe when Apps Script completed a write
 * but the browser never received its success callback.
 */
function operationReceiptKey(operationId) {
  const id = String(operationId || '').trim();
  if (!id) return '';
  if (id.length > 200) throw new Error('ID operasi tidak valid.');
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, id);
  return 'keepflow_op_' + Utilities.base64EncodeWebSafe(digest).replace(/=+$/g, '');
}

function getOperationReceipt(operationId) {
  const key = operationReceiptKey(operationId);
  if (!key) return null;
  const raw = PropertiesService.getScriptProperties().getProperty(key);
  if (!raw) return null;
  try {
    const receipt = JSON.parse(raw);
    // Receipts are intentionally short-lived; old keys are ignored.
    if (!receipt || Date.now() - Number(receipt.completedAt || 0) > RECEIPT_TTL_MS) {
      PropertiesService.getScriptProperties().deleteProperty(key);
      return null;
    }
    return receipt;
  } catch (e) {
    PropertiesService.getScriptProperties().deleteProperty(key);
    return null;
  }
}

var RECEIPT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
var RECEIPT_PRUNE_INTERVAL_MS = 60 * 60 * 1000;
var RECEIPT_PRUNE_MARKER = 'keepflow_receipt_pruned_at';

/**
 * Delete expired receipts. Scanning every script property is O(n), so it runs
 * at most once per RECEIPT_PRUNE_INTERVAL_MS unless forced (quota pressure).
 */
function pruneOperationReceipts_(properties, keepKey, force) {
  const now = Date.now();
  if (!force && now - Number(properties.getProperty(RECEIPT_PRUNE_MARKER) || 0) < RECEIPT_PRUNE_INTERVAL_MS) return;
  const all = properties.getProperties();
  const cutoff = now - RECEIPT_TTL_MS;
  Object.keys(all).forEach(propertyKey => {
    if (propertyKey.indexOf('keepflow_op_') !== 0 || propertyKey === keepKey) return;
    try {
      const existing = JSON.parse(all[propertyKey]);
      if (!existing || Number(existing.completedAt || 0) < cutoff) {
        properties.deleteProperty(propertyKey);
      }
    } catch (e) {
      properties.deleteProperty(propertyKey);
    }
  });
  properties.setProperty(RECEIPT_PRUNE_MARKER, String(now));
}

/**
 * Best effort. The Drive write has already succeeded when this runs, so a
 * failure here (for example the 500 KB script-property quota during a large
 * ZIP restore) must never turn a successful save into an error: the client
 * would retry and create a duplicate note.
 */
function storeOperationReceipt(operationId, receipt) {
  const key = operationReceiptKey(operationId);
  if (!key) return;
  const properties = PropertiesService.getScriptProperties();
  const value = JSON.stringify({ ...receipt, completedAt: Date.now() });
  try {
    pruneOperationReceipts_(properties, key, false);
    properties.setProperty(key, value);
  } catch (firstError) {
    try {
      pruneOperationReceipts_(properties, key, true);
      properties.setProperty(key, value);
    } catch (secondError) {
      console.warn('KeepFlow: receipt operasi tidak tersimpan: ' + String(secondError && secondError.message || secondError));
    }
  }
}

function replayOperationReceipt(receipt, expectedType, storage) {
  if (!receipt) return null;
  if (receipt.type !== expectedType) throw new Error('ID operasi pernah digunakan untuk jenis operasi berbeda.');
  if (expectedType === 'delete') {
    return { status: 'success', deleted: true, alreadyProcessed: true, id: receipt.fileId || '' };
  }
  let file;
  try {
    file = DriveApp.getFileById(receipt.fileId);
  } catch (e) {
    return { status: 'conflict', reason: 'missing', message: 'Operasi simpan sebelumnya berhasil, tetapi file tidak lagi tersedia.', currentNote: null };
  }
  const parent = assertFileBelongsToStorage(file, storage);
  const currentVersion = file.getLastUpdated().toISOString();
  const currentNote = parseNoteFile(file, parent.getId() === storage.getId() || parent.getName().toLocaleLowerCase() === 'umum' ? '' : parent.getName());
  // If the file changed after the original operation, do not let a replay
  // acknowledge newer cloud content as though it were the original write.
  if (receipt.updatedAt && receipt.updatedAt !== currentVersion) {
    return {
      status: 'conflict',
      reason: 'version_mismatch',
      message: 'Catatan berubah lagi setelah operasi sebelumnya berhasil.',
      currentNote: currentNote
    };
  }
  return { status: 'success', alreadyProcessed: true, note: currentNote };
}
