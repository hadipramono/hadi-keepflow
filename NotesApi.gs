/**
 * Hadi KeepFlow v1.2.8.3 backend module.
 * Apps Script .gs files share one global namespace.
 */

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

/**
 * Return notes and category names from one locked Drive snapshot for backup.
 * This prevents category and note lists from being read at different moments.
 */
function getBackupSnapshot() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const result = [];
    collectFolderNotes(storage, 'Umum', result);

    const categories = new Set(['Umum']);
    const folders = storage.getFolders();
    while (folders.hasNext()) {
      const folder = folders.next();
      if (folder.isTrashed()) continue;
      categories.add(folder.getName());
      collectFolderNotes(folder, folder.getName(), result);
    }

    result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const categoryList = Array.from(categories).sort((a, b) => {
      if (a === 'Umum') return -1;
      if (b === 'Umum') return 1;
      return a.localeCompare(b, 'id');
    });
    return {
      generatedAt: new Date().toISOString(),
      notes: result,
      categories: categoryList,
      noteCount: result.length
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Return category folders stored directly under KeepFlow storage.
 * Empty categories are included even when they do not contain notes yet.
 */
function getCategories() {
  const storage = getStorageFolder();
  const names = new Set(['Umum']);
  const folders = storage.getFolders();
  while (folders.hasNext()) {
    const folder = folders.next();
    if (!folder.isTrashed()) names.add(folder.getName());
  }
  return Array.from(names).sort((a, b) => {
    if (a === 'Umum') return -1;
    if (b === 'Umum') return 1;
    return a.localeCompare(b, 'id');
  });
}

/** Create an empty category folder. Safe to call repeatedly. */
function createCategoryFolder(categoryName) {
  const rawCategory = String(categoryName == null ? '' : categoryName).trim();
  if (!rawCategory) {
    return { status: 'error', message: 'Nama kategori tidak boleh kosong.' };
  }
  const category = safeName(rawCategory, '');
  if (category.toLocaleLowerCase() === 'umum') {
    return { status: 'error', message: 'Umum adalah kategori default dan tidak perlu dibuat.' };
  }
  if (!category || category.length > 120) {
    return { status: 'error', message: 'Nama kategori tidak valid (maksimal 120 karakter).' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const folder = getOrCreateSubFolder(storage, category);
    return { status: 'success', category: folder.getName(), categories: getCategories() };
  } finally {
    lock.releaseLock();
  }
}


/** Delete a category folder only when it is truly empty. */
function deleteCategoryFolder(categoryName) {
  const rawCategory = String(categoryName == null ? '' : categoryName).trim();
  if (!rawCategory) {
    return { status: 'error', message: 'Nama kategori tidak boleh kosong.' };
  }
  const category = safeName(rawCategory, '');
  if (!category || category.length > 120) {
    return { status: 'error', message: 'Nama kategori tidak valid.' };
  }
  if (category.toLocaleLowerCase() === 'umum') {
    return { status: 'error', message: 'Kategori Umum tidak dapat dihapus.' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const folder = getUniqueFolderByName(storage, category);
    if (!folder || folder.isTrashed()) {
      return { status: 'error', message: 'Kategori tidak ditemukan.' };
    }

    // Check actual Drive contents, including archived notes and nested folders.
    if (folder.getFiles().hasNext() || folder.getFolders().hasNext()) {
      return { status: 'error', message: 'Kategori masih memiliki isi dan tidak dapat dihapus.' };
    }

    folder.setTrashed(true);
    return { status: 'success', category: category, categories: getCategories() };
  } finally {
    lock.releaseLock();
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
  if (oldCategory.toLocaleLowerCase() === 'umum') {
    return { status: 'error', message: 'Kategori Umum tidak dapat diubah namanya.' };
  }
  if (newCategory.toLocaleLowerCase() === 'umum') {
    return { status: 'error', message: 'Nama Umum dicadangkan sebagai kategori default.' };
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
