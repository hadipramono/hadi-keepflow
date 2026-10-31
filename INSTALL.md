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
