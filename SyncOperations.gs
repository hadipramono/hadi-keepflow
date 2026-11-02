/**
 * Hadi KeepFlow v1.3.6 backend module.
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
    if (!receipt || Date.now() - Number(receipt.completedAt || 0) > 7 * 24 * 60 * 60 * 1000) {
      PropertiesService.getScriptProperties().deleteProperty(key);
      return null;
    }
    return receipt;
  } catch (e) {
    PropertiesService.getScriptProperties().deleteProperty(key);
    return null;
  }
}

function storeOperationReceipt(operationId, receipt) {
  const key = operationReceiptKey(operationId);
  if (!key) return;
  const properties = PropertiesService.getScriptProperties();
  const all = properties.getProperties();
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  // Keep the script property store bounded by pruning expired KeepFlow receipts.
  Object.keys(all).forEach(propertyKey => {
    if (propertyKey.indexOf('keepflow_op_') !== 0 || propertyKey === key) return;
    try {
      const existing = JSON.parse(all[propertyKey]);
      if (!existing || Number(existing.completedAt || 0) < cutoff) {
        properties.deleteProperty(propertyKey);
      }
    } catch (e) {
      properties.deleteProperty(propertyKey);
    }
  });
  properties.setProperty(key, JSON.stringify({
    ...receipt,
    completedAt: Date.now()
  }));
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
