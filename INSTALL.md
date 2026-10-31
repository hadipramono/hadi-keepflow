# Instalasi Hadi KeepFlow v1.2.8

1. Backup seluruh project Apps Script dan export data JSON.
2. Di editor Apps Script, buat/ganti file server `.gs`: `Code.gs`, `DriveStorage.gs`, `SyncOperations.gs`, `NotesApi.gs`.
3. Buat/ganti file HTML: `Index.html`, `AppStyles.html`, `AppScripts.html`.
4. Pastikan isi file lama yang sudah dipindahkan tidak tertinggal sebagai duplikasi fungsi.
5. Simpan project dan periksa error syntax.
6. Deploy sebagai **New version**.
7. Jalankan `MAINTAINABILITY-TEST.md` dan checklist regresi sebelumnya.

`Code.gs` sekarang menggunakan `createTemplateFromFile('Index').evaluate()` dan helper `include()` untuk memuat HTML partial.

Tidak perlu menghapus LocalStorage. Jangan mengganti nama key antrean atau draft.


## Hotfix v1.2.8.1

If upgrading from v1.2.8, replace only `DriveStorage.gs` with the file in this package, save, and deploy a new Apps Script version. Do not delete or reset LocalStorage.


## Hotfix v1.2.8.2 — Category persistence

If upgrading from v1.2.8.1, replace only these two files:
- `NotesApi.gs`
- `AppScripts.html`

Save and deploy as a **New version**. Do not clear LocalStorage. Existing note data and sync queue keys are preserved. Run `CATEGORY-PERSISTENCE-TEST.md`.


## v1.2.8.3 — Category Management
If upgrading from v1.2.8.2, replace only:
- `NotesApi.gs`
- `AppScripts.html`

Save the project and deploy as a **New version**. Do not clear LocalStorage. `Umum` is the only built-in category. Existing `Pekerjaan`, `Pribadi`, and other category folders are not deleted automatically; they remain available if present in Drive or used by notes. A non-default category can be deleted only when its Drive folder contains no files and no subfolders. The folder is moved to Google Drive Trash, not permanently deleted. Run `CATEGORY-MANAGEMENT-TEST.md` after deployment.


## v1.3.0 — Phase 3.1 Data Portability & Backup

From v1.2.8.3, replace:
- `Index.html`
- `AppScripts.html`
- `NotesApi.gs`

The page loads JSZip 3.10.1 from jsDelivr for ZIP creation and parsing, so the browser needs access to that CDN when using Backup/Restore.

Then save the Apps Script project and deploy a new version. Open the deployed app online and wait for the initial cloud sync to finish before using Backup ZIP or Restore / Import ZIP.

See `DATA-PORTABILITY-TEST.md` for the full test checklist.


## v1.3.0.1 — Backup & Restore Progress UI

If v1.3.0 is already installed, replace only:
- `Index.html`
- `AppStyles.html`
- `AppScripts.html`

No `.gs` file changes are required for this UI hotfix. Save the project and deploy a new version. Run section **F. Progress bar** in `DATA-PORTABILITY-TEST.md`.
