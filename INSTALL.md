# Instalasi dan deployment

## Prasyarat
- Google account dan akses Google Apps Script.
- Google Drive.
- Browser modern dengan JavaScript aktif.
- Internet untuk dependency CDN yang digunakan UI.

## Membuat project
1. Buka https://script.google.com/ lalu buat project baru.
2. Tambahkan file script: `Code.gs`, `DriveStorage.gs`, `NotesApi.gs`, `SyncOperations.gs`.
3. Tambahkan file HTML: `Index.html`, `AppStyles.html`, `AppScripts.html`.
4. Salin source dari repository ke file dengan nama yang sama. Semua file `.gs` berbagi global namespace.
5. Simpan dan periksa error sintaks pada editor Apps Script.

## Deploy
1. Pilih **Deploy → New deployment → Web app**.
2. Untuk instance pribadi, pilih **Execute as: Me** dan **Who has access: Only myself**.
3. Deploy, berikan otorisasi Google Drive, lalu buka URL aplikasi.
4. Buat catatan uji dan pastikan file muncul di folder KeepFlow pada Google Drive.

## Penting
Jangan membuka akses publik untuk deployment yang berjalan sebagai akun pemilik. Aplikasi ini belum memiliki autentikasi dan otorisasi multi-user sendiri. Lakukan pengujian pada project dan data Drive terpisah sebelum menggunakan data utama.
