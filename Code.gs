/**
 * Hadi KeepFlow v1.1
 * Google Apps Script backend.
 * Existing storage: My Drive/apps/KeepFlow/storage/<category>/<note>.md
 */

function getOrCreateSubFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(folderName);
}

function getStorageFolder() {
  const root = DriveApp.getRootFolder();
  const apps = getOrCreateSubFolder(root, 'apps');
  const keepFlow = getOrCreateSubFolder(apps, 'KeepFlow');
  return getOrCreateSubFolder(keepFlow, 'storage');
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

  return {
    id: file.getId(),
    title: fileName.replace(/\.(md|txt)$/i, ''),
    content: body,
    category: categoryName || 'Umum',
    isPinned: Boolean(meta.isPinned),
    isArchived: Boolean(meta.isArchived),
    tags: Array.isArray(meta.tags) ? meta.tags.filter(t => typeof t === 'string') : [],
    createdAt: meta.createdAt || file.getDateCreated().toISOString(),
    updatedAt: file.getLastUpdated().toISOString()
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

function saveNote(note) {
  if (!note || typeof note !== 'object') {
    throw new Error('Data catatan tidak valid.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const category = safeName(note.category, 'Umum');
    const title = safeName(note.title, 'Catatan Tanpa Judul');
    const folder = getOrCreateSubFolder(storage, category);
    const id = String(note.id || '');
    let file = null;

    // Only treat a Drive-looking ID as an existing file ID.
    if (id && !id.startsWith('temp_') && !id.startsWith('import_')) {
      try {
        file = DriveApp.getFileById(id);
        if (file.isTrashed()) file = null;
      } catch (e) {
        file = null;
      }
    }

    const fileName = buildUniqueFileName(folder, title, file ? file.getId() : null);
    const now = new Date().toISOString();
    const metadata = {
      isPinned: Boolean(note.isPinned),
      isArchived: Boolean(note.isArchived),
      tags: Array.isArray(note.tags) ? note.tags.filter(t => typeof t === 'string') : [],
      createdAt: note.createdAt || now
    };
    const body = typeof note.content === 'string' ? note.content : '';
    const fileContent = '---JSON---\n' + JSON.stringify(metadata, null, 2) +
      '\n---JSON---\n\n' + body;

    if (file) {
      const parents = file.getParents();
      if (parents.hasNext()) {
        const oldParent = parents.next();
        if (oldParent.getId() !== folder.getId()) {
          folder.addFile(file);
          oldParent.removeFile(file);
        }
      } else {
        folder.addFile(file);
      }
      file.setName(fileName);
      file.setContent(fileContent);
    } else {
      file = folder.createFile(fileName, fileContent, MimeType.PLAIN_TEXT);
    }

    return {
      status: 'success',
      note: {
        id: file.getId(),
        title: fileName.replace(/\.md$/i, ''),
        content: body,
        category: category,
        isPinned: metadata.isPinned,
        isArchived: metadata.isArchived,
        tags: metadata.tags,
        createdAt: metadata.createdAt,
        updatedAt: now
      }
    };
  } finally {
    lock.releaseLock();
  }
}

function deleteNote(fileId) {
  const id = String(fileId || '');
  if (!id || id.startsWith('temp_') || id.startsWith('import_')) {
    return { status: 'success', deleted: false, message: 'Catatan lokal tidak memiliki file Drive.' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const file = DriveApp.getFileById(id);
    file.setTrashed(true);
    return { status: 'success', deleted: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

// Backward compatibility for older deployed frontend versions.
// This function intentionally does not delete files omitted from the payload.
function saveNotes(notes) {
  if (!Array.isArray(notes)) throw new Error('Daftar catatan tidak valid.');
  const saved = notes.map(note => saveNote(note).note);
  return { status: 'success', notes: saved };
}

function deleteNoteFromFile(fileId) {
  return deleteNote(fileId);
}

function renameCategoryFolder(oldName, newName) {
  const oldCategory = safeName(oldName, '');
  const newCategory = safeName(newName, '');
  if (!oldCategory || !newCategory) {
    return { status: 'error', message: 'Nama kategori tidak valid.' };
  }
  if (oldCategory === 'Umum') {
    return { status: 'error', message: 'Kategori Umum tidak dapat diubah namanya.' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const storage = getStorageFolder();
    const folders = storage.getFoldersByName(oldCategory);
    if (!folders.hasNext()) return { status: 'error', message: 'Folder kategori lama tidak ditemukan.' };
    const targetFolders = storage.getFoldersByName(newCategory);
    if (targetFolders.hasNext()) return { status: 'error', message: 'Nama kategori tujuan sudah digunakan.' };
    folders.next().setName(newCategory);
    return { status: 'success' };
  } finally {
    lock.releaseLock();
  }
}
