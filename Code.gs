/**
 * Hadi KeepFlow v1.2.4
 * Google Apps Script backend.
 * Storage: My Drive/apps/KeepFlow/storage/<category>/<note>.md
 *
 * Security rule: existing Drive files may only be changed when their sole
 * parent is the KeepFlow storage folder or one of its direct category folders.
 */

function getUniqueFolderByName(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (!folders.hasNext()) return null;

  const folder = folders.next();
  if (folders.hasNext()) {
    throw new Error('Struktur penyimpanan ambigu: ditemukan lebih dari satu folder "' + folderName + '".');
  }
  return folder;
}

function getOrCreateSubFolder(parentFolder, folderName) {
  const existing = getUniqueFolderByName(parentFolder, folderName);
  return existing || parentFolder.createFolder(folderName);
}

function getStorageFolder() {
  const root = DriveApp.getRootFolder();
  const apps = getOrCreateSubFolder(root, 'apps');
  const keepFlow = getOrCreateSubFolder(apps, 'KeepFlow');
  return getOrCreateSubFolder(keepFlow, 'storage');
}

/**
 * Return the file's single parent only if it is inside KeepFlow storage.
 * The accepted layout is storage/<category>/<file> or storage/<file> (Umum).
 */
function assertFileBelongsToStorage(file, storage) {
  if (!file || file.isTrashed()) {
    throw new Error('Catatan tidak ditemukan atau sudah berada di sampah.');
  }

  const parents = file.getParents();
  if (!parents.hasNext()) {
    throw new Error('Akses ditolak: file tidak berada di folder penyimpanan KeepFlow.');
  }

  const parent = parents.next();
  if (parents.hasNext()) {
    throw new Error('Akses ditolak: file memiliki lebih dari satu parent Drive.');
  }

  if (parent.getId() === storage.getId()) return parent;

  if (parent.isTrashed()) {
    throw new Error('Akses ditolak: folder kategori sudah berada di sampah.');
  }

  const grandParents = parent.getParents();
  if (!grandParents.hasNext()) {
    throw new Error('Akses ditolak: file bukan bagian dari penyimpanan KeepFlow.');
  }
  const grandParent = grandParents.next();
  if (grandParents.hasNext() || grandParent.getId() !== storage.getId()) {
    throw new Error('Akses ditolak: file bukan bagian dari penyimpanan KeepFlow.');
  }

  return parent;
}


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
  const currentNote = parseNoteFile(file, parent.getId() === storage.getId() ? 'Umum' : parent.getName());
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

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Hadi KeepFlow')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function safeName(value, fallback) {
  const result = String(value || fallback || '')
    .replace(/[\/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return result || fallback || 'Tanpa Judul';
}

function toBoolean(value) {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    return ['true', '1'].indexOf(value.trim().toLowerCase()) !== -1;
  }
  return false;
}

function parseNoteFile(file, categoryName) {
  const fileName = file.getName();
  const content = file.getBlob().getDataAsString('UTF-8');
  let body = content;
  let meta = {};

  if (content.startsWith('---JSON---')) {
    const parts = content.split('---JSON---');
    if (parts.length >= 3) {
      try {
        meta = JSON.parse(parts[1].trim()) || {};
        body = parts.slice(2).join('---JSON---').replace(/^\s+/, '');
      } catch (e) {
        // Keep the original content visible if metadata is malformed.
        body = content;
        meta = {};
      }
    }
  }

  const cloudVersion = file.getLastUpdated().toISOString();
  return {
    id: file.getId(),
    title: fileName.replace(/\.(md|txt)$/i, ''),
    content: body,
    category: categoryName || 'Umum',
    isPinned: toBoolean(meta.isPinned),
    isArchived: toBoolean(meta.isArchived),
    tags: Array.isArray(meta.tags) ? meta.tags.filter(t => typeof t === 'string') : [],
    createdAt: meta.createdAt || file.getDateCreated().toISOString(),
    updatedAt: cloudVersion,
    // Immutable cloud baseline used for optimistic concurrency checks.
    baseUpdatedAt: cloudVersion
  };
}

function getNotes() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const result = [];
    collectFolderNotes(storage, 'Umum', result);

    const folders = storage.getFolders();
    while (folders.hasNext()) {
      const folder = folders.next();
      collectFolderNotes(folder, folder.getName(), result);
    }

    return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } finally {
    lock.releaseLock();
  }
}

function collectFolderNotes(folder, category, result) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (!/\.(md|txt)$/i.test(file.getName()) || file.isTrashed()) continue;
    result.push(parseNoteFile(file, category));
  }
}

function buildUniqueFileName(folder, title, excludeId) {
  const base = safeName(title, 'Catatan Tanpa Judul');
  let candidate = base + '.md';
  let counter = 1;
  while (true) {
    const matches = folder.getFilesByName(candidate);
    let conflict = false;
    while (matches.hasNext()) {
      const file = matches.next();
      if (file.getId() !== excludeId) {
        conflict = true;
        break;
      }
    }
    if (!conflict) return candidate;
    candidate = base + ' (' + counter + ').md';
    counter++;
  }
}

function validateNotePayload(note) {
  if (!note || typeof note !== 'object' || Array.isArray(note)) {
    throw new Error('Data catatan tidak valid.');
  }

  if (note.title != null && typeof note.title !== 'string') {
    throw new Error('Judul catatan harus berupa teks.');
  }
  if (note.category != null && typeof note.category !== 'string') {
    throw new Error('Kategori catatan harus berupa teks.');
  }
  if (note.content != null && typeof note.content !== 'string') {
    throw new Error('Isi catatan harus berupa teks.');
  }
  if (note.tags != null && !Array.isArray(note.tags)) {
    throw new Error('Tag catatan tidak valid.');
  }

  const title = safeName(note.title, 'Catatan Tanpa Judul');
  const category = safeName(note.category, 'Umum');
  if (title.length > 180) throw new Error('Judul catatan terlalu panjang (maksimal 180 karakter).');
  if (category.length > 120) throw new Error('Nama kategori terlalu panjang (maksimal 120 karakter).');

  const content = typeof note.content === 'string' ? note.content : '';
  if (content.length > 500000) throw new Error('Isi catatan terlalu besar (maksimal 500.000 karakter).');

  const tags = Array.isArray(note.tags) ? note.tags : [];
  if (tags.length > 50 || tags.some(tag => typeof tag !== 'string' || tag.length > 60)) {
    throw new Error('Daftar tag tidak valid (maksimal 50 tag, masing-masing 60 karakter).');
  }

  return { title: title, category: category, content: content, tags: tags };
}

function saveNote(note, operationId) {
  const validated = validateNotePayload(note);
  const id = note.id == null ? '' : String(note.id).trim();
  if (id.length > 200) throw new Error('ID catatan tidak valid.');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const receipt = getOperationReceipt(operationId);
    const replay = replayOperationReceipt(receipt, 'save', storage);
    if (replay) return replay;
    let file = null;

    // Temporary/import IDs represent local-only notes. Any other supplied ID
    // must resolve to an existing file owned by this KeepFlow storage tree.
    const isLocalId = !id || id.startsWith('temp_') || id.startsWith('import_');
    if (!isLocalId) {
      try {
        file = DriveApp.getFileById(id);
      } catch (e) {
        return {
          status: 'conflict',
          reason: 'missing',
          message: 'Catatan Drive tidak ditemukan atau tidak dapat diakses.',
          currentNote: null
        };
      }
      const currentParent = assertFileBelongsToStorage(file, storage);
      const currentVersion = file.getLastUpdated().toISOString();
      const expectedVersion = note.baseUpdatedAt == null ? '' : String(note.baseUpdatedAt);

      // Fail closed: an existing cloud note must carry the exact version it
      // was loaded from. This also catches legacy queued updates without a base.
      if (!expectedVersion || expectedVersion !== currentVersion) {
        return {
          status: 'conflict',
          reason: expectedVersion ? 'version_mismatch' : 'version_missing',
          message: 'Catatan telah berubah di cloud atau versi dasar tidak tersedia.',
          currentNote: parseNoteFile(file, currentParent.getId() === storage.getId() ? 'Umum' : currentParent.getName())
        };
      }
    }

    const folder = getOrCreateSubFolder(storage, validated.category);
    const fileName = buildUniqueFileName(folder, validated.title, file ? file.getId() : null);
    const now = new Date().toISOString();
    const metadata = {
      isPinned: toBoolean(note.isPinned),
      isArchived: toBoolean(note.isArchived),
      tags: validated.tags,
      createdAt: note.createdAt || now
    };
    const fileContent = '---JSON---\n' + JSON.stringify(metadata, null, 2) +
      '\n---JSON---\n\n' + validated.content;

    if (file) {
      const oldParent = assertFileBelongsToStorage(file, storage);
      if (oldParent.getId() !== folder.getId()) {
        folder.addFile(file);
        oldParent.removeFile(file);
      }
      file.setName(fileName);
      file.setContent(fileContent);
    } else {
      file = folder.createFile(fileName, fileContent, MimeType.PLAIN_TEXT);
    }

    const savedVersion = file.getLastUpdated().toISOString();
    const result = {
      status: 'success',
      note: {
        id: file.getId(),
        title: fileName.replace(/\.md$/i, ''),
        content: validated.content,
        category: validated.category,
        isPinned: metadata.isPinned,
        isArchived: metadata.isArchived,
        tags: metadata.tags,
        createdAt: metadata.createdAt,
        updatedAt: savedVersion,
        baseUpdatedAt: savedVersion
      }
    };
    storeOperationReceipt(operationId, { type: 'save', fileId: file.getId(), updatedAt: savedVersion });
    return result;
  } finally {
    lock.releaseLock();
  }
}

function deleteNote(fileId, expectedUpdatedAt, operationId) {
  const id = String(fileId || '').trim();
  if (!id || id.startsWith('temp_') || id.startsWith('import_')) {
    return { status: 'success', deleted: false, message: 'Catatan lokal tidak memiliki file Drive.' };
  }
  if (id.length > 200) throw new Error('ID catatan tidak valid.');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const receipt = getOperationReceipt(operationId);
    const replay = replayOperationReceipt(receipt, 'delete', storage);
    if (replay) return replay;
    let file;
    try {
      file = DriveApp.getFileById(id);
    } catch (e) {
      // The requested final state (file absent) is already satisfied.
      return { status: 'success', deleted: false, alreadyMissing: true, id: id };
    }

    const parent = assertFileBelongsToStorage(file, storage);
    const currentVersion = file.getLastUpdated().toISOString();
    const expectedVersion = expectedUpdatedAt == null ? '' : String(expectedUpdatedAt);
    if (!expectedVersion || expectedVersion !== currentVersion) {
      return {
        status: 'conflict',
        reason: expectedVersion ? 'version_mismatch' : 'version_missing',
        message: 'Catatan telah berubah di cloud atau versi dasar tidak tersedia.',
        currentNote: parseNoteFile(file, parent.getId() === storage.getId() ? 'Umum' : parent.getName())
      };
    }
    file.setTrashed(true);
    storeOperationReceipt(operationId, { type: 'delete', fileId: id });
    return { status: 'success', deleted: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

// Backward compatibility for older deployed frontend versions.
// This function intentionally does not delete files omitted from the payload.
function saveNotes(notes) {
  if (!Array.isArray(notes)) throw new Error('Daftar catatan tidak valid.');
  const saved = notes.map(note => {
    const result = saveNote(note);
    if (!result || result.status !== 'success') {
      throw new Error('Penyimpanan batch dihentikan karena konflik versi. Gunakan saveNote untuk menyelesaikan konflik satu per satu.');
    }
    return result.note;
  });
  return { status: 'success', notes: saved };
}

function deleteNoteFromFile(fileId) {
  return deleteNote(fileId);
}

function renameCategoryFolder(oldName, newName) {
  const oldCategory = safeName(oldName, '');
  const newCategory = safeName(newName, '');
  if (!oldCategory || !newCategory || oldCategory.length > 120 || newCategory.length > 120) {
    return { status: 'error', message: 'Nama kategori tidak valid.' };
  }
  if (oldCategory === 'Umum') {
    return { status: 'error', message: 'Kategori Umum tidak dapat diubah namanya.' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const sourceFolder = getUniqueFolderByName(storage, oldCategory);
    if (!sourceFolder) return { status: 'error', message: 'Folder kategori lama tidak ditemukan.' };
    if (getUniqueFolderByName(storage, newCategory)) {
      return { status: 'error', message: 'Nama kategori tujuan sudah digunakan.' };
    }
    sourceFolder.setName(newCategory);
    return { status: 'success' };
  } finally {
    lock.releaseLock();
  }
}
