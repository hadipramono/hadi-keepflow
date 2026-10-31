// Fungsi pembantu penelusuran folder
function getOrCreateSubFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function getStorageFolder() {
  const root = DriveApp.getRootFolder();
  const appsFolder = getOrCreateSubFolder(root, 'apps');
  const keepFlowFolder = getOrCreateSubFolder(appsFolder, 'KeepFlow');
  const storageFolder = getOrCreateSubFolder(keepFlowFolder, 'storage');
  return storageFolder;
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Hadi KeepFlow')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// 1. MEMBACA SEMUA CATATAN DARI SEMUA SUB-FOLDER KATEGORI
function getNotes() {
  try {
    const storageFolder = getStorageFolder();
    const notes = [];
    
    // Default kategori utama (jika ada file di root storage)
    processFolderFiles(storageFolder, "Umum", notes);

    // Telusuri setiap sub-folder kategori di dalam folder storage
    const subFolders = storageFolder.getFolders();
    while (subFolders.hasNext()) {
      const categoryFolder = subFolders.next();
      const categoryName = categoryFolder.getName();
      processFolderFiles(categoryFolder, categoryName, notes);
    }

    return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch (err) {
    throw err;
  }
}

// Fungsi bantu untuk membaca file di dalam folder tertentu
function processFolderFiles(folder, categoryName, notesArray) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    
    if (fileName.endsWith('.md') || fileName.endsWith('.txt')) {
      let content = "";
      try {
        content = file.getContentText();
      } catch (errText) {
        try {
          content = file.getBlob().getDataAsString();
        } catch (errBlob) {
          continue;
        }
      }

      const fileId = file.getId();
      let title = fileName.replace(/\.(md|txt)$/, '');
      
      let isPinned = false;
      let isArchived = false;
      let tags = [];
      let createdAt = file.getDateCreated().toISOString();
      let updatedAt = file.getLastUpdated().toISOString();
      let bodyContent = content;

      if (content.startsWith('---JSON---')) {
        const parts = content.split('---JSON---');
        if (parts.length >= 3) {
          try {
            const meta = JSON.parse(parts[1].trim());
            isPinned = meta.isPinned || false;
            isArchived = meta.isArchived || false;
            tags = meta.tags || [];
            if (meta.createdAt) createdAt = meta.createdAt;
            bodyContent = parts.slice(2).join('---JSON---').trim();
          } catch (e) {}
        }
      }

      notesArray.push({
        id: fileId,
        title: title,
        content: bodyContent,
        category: categoryName,
        isPinned: isPinned,
        isArchived: isArchived,
        tags: tags,
        createdAt: createdAt,
        updatedAt: updatedAt
      });
    }
  }
}

// 2. MENYIMPAN CATATAN KE FOLDER KATEGORI MASING-MASING
function saveNotes(notes) {
  const rootStorage = getStorageFolder();

  notes.forEach(note => {
    // Tentukan folder kategori (gunakan "Umum" jika kosong)
    const categoryName = (note.category || 'Umum').replace(/[/\\?%*:|"<>]/g, '-').trim();
    const targetFolder = getOrCreateSubFolder(rootStorage, categoryName);

    // Kumpulkan nama file yang sudah ada di folder tersebut untuk validasi unik
    const existingFiles = targetFolder.getFiles();
    const existingFileNames = {};
    while (existingFiles.hasNext()) {
      const f = existingFiles.next();
      existingFileNames[f.getName()] = f.getId();
    }

    let cleanTitle = (note.title || 'Catatan Tanpa Judul').replace(/[/\\?%*:|"<>]/g, '-').trim();
    if (!cleanTitle) cleanTitle = 'Catatan Tanpa Judul';

    let fileName = `${cleanTitle}.md`;
    let counter = 1;

    while (existingFileNames[fileName] && existingFileNames[fileName] !== note.id) {
      fileName = `${cleanTitle} (${counter}).md`;
      counter++;
    }

    const now = new Date().toISOString();
    const createdAt = note.createdAt || now;
    const updatedAt = now;

    const metadata = {
      isPinned: note.isPinned || false,
      isArchived: note.isArchived || false,
      tags: note.tags || [],
      createdAt: createdAt
    };

    const fileContent = `---JSON---\n${JSON.stringify(metadata, null, 2)}\n---JSON---\n\n${note.content || ''}`;

    if (note.id && note.id.length > 20) {
      try {
        const file = DriveApp.getFileById(note.id);
        
        // Jika kategori berubah, pindahkan file ke folder kategori baru
        const currentFileParent = file.getParents().next();
        if (currentFileParent.getId() !== targetFolder.getId()) {
          targetFolder.addFile(file);
          currentFileParent.removeFile(file);
        }

        file.setName(fileName);
        file.setContent(fileContent);
      } catch (e) {
        const newFile = targetFolder.createFile(fileName, fileContent, MimeType.PLAIN_TEXT);
        note.id = newFile.getId();
      }
    } else {
      const newFile = targetFolder.createFile(fileName, fileContent, MimeType.PLAIN_TEXT);
      note.id = newFile.getId();
    }
    
    note.createdAt = createdAt;
    note.updatedAt = updatedAt;
    note.title = fileName.replace(/\.md$/, '');
    note.category = categoryName;
  });

  return { status: 'success', notes: notes };
}

// 3. MENGHAPUS FILE
function deleteNoteFromFile(fileId) {
  if (fileId && fileId.length > 20) {
    try {
      const file = DriveApp.getFileById(fileId);
      file.setTrashed(true);
      return { status: 'success' };
    } catch (e) {
      return { status: 'error', message: e.toString() };
    }
  }
  return { status: 'ignored' };
}

// (Fungsi getOrCreateSubFolder, getStorageFolder, getNotes, saveNotes, deleteNoteFromFile tetap sama seperti sebelumnya)

// FUNGSI BARU: MENGUBAH NAMA FOLDER KATEGORI DI GOOGLE DRIVE
function renameCategoryFolder(oldName, newName) {
  try {
    const rootStorage = getStorageFolder();
    
    // Jangan izinkan ubah kategori default 'Umum'
    if (oldName === 'Umum') {
      return { status: 'error', message: 'Kategori Umum tidak dapat diubah namanya.' };
    }

    const safeOldName = oldName.replace(/[/\\?%*:|"<>]/g, '-').trim();
    const safeNewName = newName.replace(/[/\\?%*:|"<>]/g, '-').trim();

    if (!safeNewName) {
      return { status: 'error', message: 'Nama kategori baru tidak valid.' };
    }

    const folders = rootStorage.getFoldersByName(safeOldName);
    if (folders.hasNext()) {
      const folder = folders.next();
      folder.setName(safeNewName);
      return { status: 'success' };
    } else {
      return { status: 'error', message: 'Folder kategori lama tidak ditemukan.' };
    }
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}
