/**
 * Hadi KeepFlow v1.2.8 backend module.
 * Apps Script .gs files share one global namespace.
 */

/**
 * Return a unique direct child folder by name, or null when absent.
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
