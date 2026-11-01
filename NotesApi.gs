/**
 * Hadi KeepFlow v1.3.6-dev backend module.
 * Apps Script .gs files share one global namespace.
 */

function getNotes() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const result = [];
    collectFolderNotes(storage, '', result);

    const folders = storage.getFolders();
    while (folders.hasNext()) {
      const folder = folders.next();
      if (folder.isTrashed()) continue;
      // A legacy Umum folder remains an Inbox source until migration finishes.
      const category = folder.getName().toLocaleLowerCase() === 'umum' ? '' : folder.getName();
      collectFolderNotes(folder, category, result);
    }

    // A partially completed Drive move can briefly expose the same file through
    // both parents. De-duplicate by immutable Drive file ID.
    const unique = new Map();
    // Root files are collected first. Prefer that representation when a Drive
    // move is interrupted and the same file temporarily has two parents.
    result.forEach(note => {
      const id = String(note.id);
      if (!unique.has(id)) unique.set(id, note);
    });
    return Array.from(unique.values()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
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
    collectFolderNotes(storage, '', result);

    const categories = new Set();
    const folders = storage.getFolders();
    while (folders.hasNext()) {
      const folder = folders.next();
      if (folder.isTrashed()) continue;
      const folderName = folder.getName();
      const category = folderName.toLocaleLowerCase() === 'umum' ? '' : folderName;
      if (category) categories.add(category);
      collectFolderNotes(folder, category, result);
    }

    const unique = new Map();
    // Prefer storage-root (Inbox) when a partially completed move exposes
    // one Drive file through both storage/ and its former category folder.
    result.forEach(note => {
      const id = String(note.id);
      if (!unique.has(id)) unique.set(id, note);
    });
    const notes = Array.from(unique.values()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const categoryList = Array.from(categories).sort((a, b) => a.localeCompare(b, 'id'));
    return {
      generatedAt: new Date().toISOString(),
      notes: notes,
      categories: categoryList,
      noteCount: notes.length
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Return real category folders only. Inbox is represented by notes stored
 * directly in storage, not by a synthetic "Umum" category.
 */
function getCategories() {
  const storage = getStorageFolder();
  const names = new Set();
  const folders = storage.getFolders();
  while (folders.hasNext()) {
    const folder = folders.next();
    const name = folder.getName();
    if (!folder.isTrashed() && name.toLocaleLowerCase() !== 'umum') names.add(name);
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'id'));
}

/**
 * Read-only status for the one-time legacy Inbox migration.
 * Only Markdown/text notes are moved; unrelated files and nested folders are
 * reported and left untouched.
 */
function getLegacyInboxMigrationStatus() {
  const storage = getStorageFolder();
  const folders = storage.getFolders();
  let folderCount = 0;
  let noteCount = 0;
  let otherFileCount = 0;
  let nestedFolderCount = 0;
  while (folders.hasNext()) {
    const folder = folders.next();
    if (folder.isTrashed() || folder.getName().toLocaleLowerCase() !== 'umum') continue;
    folderCount++;
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      if (file.isTrashed()) continue;
      if (/\.(md|txt)$/i.test(file.getName())) noteCount++;
      else otherFileCount++;
    }
    const children = folder.getFolders();
    while (children.hasNext()) {
      if (!children.next().isTrashed()) nestedFolderCount++;
    }
  }
  return {
    status: 'success',
    folderCount: folderCount,
    noteCount: noteCount,
    otherFileCount: otherFileCount,
    nestedFolderCount: nestedFolderCount,
    migrationRequired: noteCount > 0
  };
}

/**
 * Move legacy Umum note files into the storage root without changing file IDs,
 * names, contents, or metadata. Safe to retry after partial completion.
 */
function migrateLegacyInbox() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const folders = storage.getFolders();
    const legacyFolders = [];
    while (folders.hasNext()) {
      const folder = folders.next();
      if (!folder.isTrashed() && folder.getName().toLocaleLowerCase() === 'umum') {
        legacyFolders.push(folder);
      }
    }

    let migrated = 0;
    let skipped = 0;
    let alreadyInStorage = 0;
    const errors = [];
    let foldersTrashed = 0;
    let foldersRemaining = 0;

    legacyFolders.forEach(folder => {
      const fileIterator = folder.getFiles();
      const legacyFiles = [];
      while (fileIterator.hasNext()) legacyFiles.push(fileIterator.next());
      legacyFiles.forEach(file => {
        if (file.isTrashed()) return;
        if (!/\.(md|txt)$/i.test(file.getName())) {
          skipped++;
          return;
        }
        try {
          const parents = file.getParents();
          const parentIds = [];
          while (parents.hasNext()) parentIds.push(parents.next().getId());
          const hasStorage = parentIds.includes(storage.getId());
          const hasLegacyParent = parentIds.includes(folder.getId());
          const unexpectedParents = parentIds.filter(id => id !== storage.getId() && id !== folder.getId());
          if (unexpectedParents.length || !hasLegacyParent) {
            if (hasStorage && !hasLegacyParent && !unexpectedParents.length) {
              alreadyInStorage++;
              return;
            }
            throw new Error('Parent Drive file tidak sesuai struktur KeepFlow.');
          }

          // Add the destination first. If execution stops before removing the
          // legacy parent, a retry recognizes both parents and completes it.
          if (!hasStorage) storage.addFile(file);
          folder.removeFile(file);
          migrated++;
        } catch (error) {
          errors.push({ file: file.getName(), message: String(error && error.message || error) });
        }
      });

      // Remove only empty legacy folders. Never trash unrelated content.
      if (!folder.getFiles().hasNext() && !folder.getFolders().hasNext()) {
        try {
          folder.setTrashed(true);
          foldersTrashed++;
        } catch (error) {
          foldersRemaining++;
          errors.push({ file: folder.getName(), message: 'Gagal memindahkan folder kosong ke Sampah: ' + String(error && error.message || error) });
        }
      } else {
        foldersRemaining++;
      }
    });

    const remaining = getLegacyInboxMigrationStatus();
    return {
      status: errors.length || remaining.noteCount > 0 ? 'partial' : 'success',
      migrated: migrated,
      alreadyInStorage: alreadyInStorage,
      skipped: skipped,
      foldersTrashed: foldersTrashed,
      foldersRemaining: foldersRemaining,
      remainingNoteCount: remaining.noteCount,
      otherFileCount: remaining.otherFileCount,
      nestedFolderCount: remaining.nestedFolderCount,
      errors: errors
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Find one category folder by case-insensitive name.
 * This prevents categories such as "Studi Alkitab" and "studi alkitab"
 * from being created as separate entries.
 */
function findCategoryFolderCaseInsensitive(storage, categoryName) {
  const target = String(categoryName || '').trim().toLocaleLowerCase();
  const folders = storage.getFolders();
  let found = null;
  while (folders.hasNext()) {
    const folder = folders.next();
    if (folder.isTrashed() || folder.getName().toLocaleLowerCase() !== target) continue;
    if (found) {
      throw new Error('Struktur kategori ambigu: ditemukan lebih dari satu folder dengan nama "' + categoryName + '" (abaikan huruf besar/kecil).');
    }
    found = folder;
  }
  return found;
}

/** Create a category folder. Repeated calls are case-insensitive and idempotent. */
function createCategoryFolder(categoryName) {
  const rawCategory = String(categoryName == null ? '' : categoryName).trim();
  if (!rawCategory) {
    return { status: 'error', message: 'Nama kategori tidak boleh kosong.' };
  }
  const category = safeName(rawCategory, '');
  if (!category || category.length > 120) {
    return { status: 'error', message: 'Nama kategori tidak valid (maksimal 120 karakter).' };
  }
  if (category.toLocaleLowerCase() === 'umum') {
    return { status: 'error', message: 'Nama Umum dicadangkan untuk kompatibilitas Inbox dan tidak dapat dibuat sebagai kategori.' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const existing = findCategoryFolderCaseInsensitive(storage, category);
    const folder = existing || storage.createFolder(category);
    return {
      status: 'success',
      category: folder.getName(),
      created: !existing,
      categories: getCategories()
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Delete a category by moving its direct files to the Inbox root.
 * No file is trashed or recreated. Nested folders are deliberately rejected
 * so the operation never silently changes an unknown folder hierarchy.
 * Safe to retry after a partial Drive parent update.
 */
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
    return { status: 'error', message: 'Folder Umum adalah sumber migrasi Inbox dan tidak dapat dihapus melalui pengelolaan kategori.' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const folder = findCategoryFolderCaseInsensitive(storage, category);
    if (!folder || folder.isTrashed()) {
      return { status: 'error', message: 'Kategori tidak ditemukan.' };
    }

    const childFolders = folder.getFolders();
    if (childFolders.hasNext()) {
      return {
        status: 'error',
        message: 'Kategori memiliki subfolder. Pindahkan atau rapikan subfolder tersebut terlebih dahulu; tidak ada data yang diubah.'
      };
    }

    const iterator = folder.getFiles();
    const files = [];
    while (iterator.hasNext()) {
      const file = iterator.next();
      if (!file.isTrashed()) files.push(file);
    }

    let filesMoved = 0;
    let filesAlreadyInInbox = 0;
    const errors = [];
    const skippedFiles = [];

    files.forEach(file => {
      if (!/\.(md|txt)$/i.test(file.getName())) {
        skippedFiles.push(file.getName());
        return;
      }
      try {
        const parentsIterator = file.getParents();
        const parentIds = [];
        const parentFolders = [];
        while (parentsIterator.hasNext()) {
          const parent = parentsIterator.next();
          parentIds.push(parent.getId());
          parentFolders.push(parent);
        }

        const hasStorage = parentIds.includes(storage.getId());
        const hasCategory = parentIds.includes(folder.getId());
        const unexpected = parentFolders.filter(parent =>
          parent.getId() !== storage.getId() &&
          parent.getId() !== folder.getId()
        );

        if (unexpected.length || (!hasStorage && !hasCategory)) {
          throw new Error('Parent file tidak sesuai struktur kategori KeepFlow.');
        }

        if (hasStorage && hasCategory) {
          folder.removeFile(file);
          filesAlreadyInInbox++;
          return;
        }

        if (hasStorage && !hasCategory) {
          filesAlreadyInInbox++;
          return;
        }

        // Add destination before removing source. If execution stops between
        // these calls, the next run recognizes both parents and completes it.
        storage.addFile(file);
        folder.removeFile(file);
        filesMoved++;
      } catch (error) {
        errors.push({
          file: file.getName(),
          message: String(error && error.message || error)
        });
      }
    });

    const remainingFilesIterator = folder.getFiles();
    const remainingFileNames = [];
    while (remainingFilesIterator.hasNext()) remainingFileNames.push(remainingFilesIterator.next().getName());
    const hasRemainingFiles = remainingFileNames.length > 0;
    const remainingFolders = folder.getFolders();
    const hasRemainingFolders = remainingFolders.hasNext();

    let folderTrashed = false;
    if (!hasRemainingFiles && !hasRemainingFolders && !errors.length) {
      try {
        folder.setTrashed(true);
        folderTrashed = true;
      } catch (error) {
        errors.push({
          file: folder.getName(),
          message: 'Catatan sudah dipindahkan, tetapi folder gagal dipindahkan ke Sampah: ' +
            String(error && error.message || error)
        });
      }
    }

    const categories = getCategories();
    return {
      status: errors.length || hasRemainingFiles || hasRemainingFolders ? 'partial' : 'success',
      category: category,
      filesMoved: filesMoved,
      filesAlreadyInInbox: filesAlreadyInInbox,
      notesMoved: filesMoved,
      folderTrashed: folderTrashed,
      remainingFiles: remainingFileNames.length,
      remainingFolders: hasRemainingFolders ? 1 : 0,
      skippedFiles: skippedFiles, remainingFileNames: remainingFileNames,
      categories: categories,
      errors: errors
    };
  } finally {
    lock.releaseLock();
  }
}

/** Rename a category folder without rewriting any note file. */
function renameCategoryFolder(oldName, newName) {
  const oldRaw = String(oldName == null ? '' : oldName).trim();
  const newRaw = String(newName == null ? '' : newName).trim();
  const oldCategory = safeName(oldRaw, '');
  const newCategory = safeName(newRaw, '');

  if (!oldCategory || !newCategory || oldCategory.length > 120 || newCategory.length > 120) {
    return { status: 'error', message: 'Nama kategori tidak valid (maksimal 120 karakter).' };
  }
  if (oldCategory.toLocaleLowerCase() === 'umum') {
    return { status: 'error', message: 'Nama Umum dicadangkan untuk kompatibilitas Inbox dan tidak dapat diubah namanya.' };
  }
  if (newCategory.toLocaleLowerCase() === 'umum') {
    return { status: 'error', message: 'Nama Umum dicadangkan untuk kompatibilitas Inbox.' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const sourceFolder = findCategoryFolderCaseInsensitive(storage, oldCategory);
    if (!sourceFolder) {
      return { status: 'error', message: 'Folder kategori lama tidak ditemukan.' };
    }

    const targetFolder = findCategoryFolderCaseInsensitive(storage, newCategory);
    if (targetFolder && targetFolder.getId() !== sourceFolder.getId()) {
      return { status: 'error', message: 'Nama kategori tujuan sudah digunakan.' };
    }

    if (sourceFolder.getName() !== newCategory) sourceFolder.setName(newCategory);
    return {
      status: 'success',
      oldCategory: oldCategory,
      category: sourceFolder.getName(),
      categories: getCategories()
    };
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
  const rawCategory = note.category == null ? '' : String(note.category).trim();
  // Legacy v1.3.5 payloads used "Umum" for uncategorized notes.
  const category = !rawCategory || rawCategory.toLocaleLowerCase() === 'umum'
    ? ''
    : safeName(rawCategory, '');
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
          currentNote: parseNoteFile(file, currentParent.getId() === storage.getId() || currentParent.getName().toLocaleLowerCase() === 'umum' ? '' : currentParent.getName())
        };
      }
    }

    // Resolve categories case-insensitively, matching category management.
    // This is especially important for ZIP restore and stale/imported payloads:
    // never create a second folder that differs only by letter casing.
    const categoryFolder = validated.category
      ? (findCategoryFolderCaseInsensitive(storage, validated.category) || storage.createFolder(validated.category))
      : null;
    const folder = categoryFolder || storage;
    const effectiveCategory = categoryFolder ? categoryFolder.getName() : '';
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
        category: effectiveCategory,
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
        currentNote: parseNoteFile(file, parent.getId() === storage.getId() || parent.getName().toLocaleLowerCase() === 'umum' ? '' : parent.getName())
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

