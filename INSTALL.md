# Instalasi dan Deployment Hadi KeepFlow

Panduan ini ditujukan untuk pengguna yang ingin membuat **instance pribadi** Hadi KeepFlow dari source code repository. Setiap pengguna sebaiknya membuat Apps Script project sendiri dan menyimpan catatan di Google Drive miliknya sendiri.

> Source package ini adalah **v1.3.6 (GitHub pre-release)** dan mencakup Phase 3.7.1–3.7.4. Karena pengujian live Apps Script/Google Drive belum dikonfirmasi, deploy dan validasi terlebih dahulu pada project serta folder Drive khusus testing.

## 1. Prasyarat

- Google account.
- Browser modern dengan JavaScript aktif.
- Akses ke [Google Apps Script](https://script.google.com/).
- Akses ke Google Drive.
- Internet untuk memuat CDN Tailwind CSS, Font Awesome, dan JSZip.

## 2. Buat project Apps Script

1. Buka [Google Apps Script](https://script.google.com/).
2. Buat **New project**.
3. Beri nama project, misalnya `Hadi KeepFlow`.
4. Hapus file contoh yang tidak digunakan.
5. Tambahkan empat file script berikut:
   - `Code.gs`
   - `DriveStorage.gs`
   - `NotesApi.gs`
   - `SyncOperations.gs`
6. Tambahkan tiga file HTML berikut:
   - `Index.html`
   - `AppStyles.html`
   - `AppScripts.html`
7. Salin isi file dari repository ke file Apps Script yang sesuai.
8. Pastikan tidak ada fungsi lama yang tertinggal sebagai duplikasi.

Semua file `.gs` berada dalam satu global namespace. Jangan membungkus setiap file dalam module atau namespace sendiri.

## 3. Periksa project

1. Simpan project.
2. Periksa apakah editor Apps Script menampilkan syntax error.
3. Jalankan deployment web app untuk pertama kali.
4. Ikuti proses otorisasi Google. Aplikasi memerlukan akses Google Drive untuk menyimpan dan membaca file catatan.
5. Setelah aplikasi terbuka, buat satu catatan uji.
6. Periksa Google Drive. Folder berikut akan dibuat saat diperlukan:

   `My Drive/apps/KeepFlow/storage/`

Folder kategori dan file Markdown akan berada di bawah folder `storage`.

## 4. Deploy sebagai Web App

1. Pilih **Deploy → New deployment**.
2. Pilih jenis deployment **Web app**.
3. Untuk penggunaan pribadi, atur:
   - **Execute as:** Me
   - **Who has access:** Only myself
4. Klik **Deploy**.
5. Simpan URL deployment untuk akses pribadi.

**Peringatan:** Jangan mengubah akses menjadi Anyone atau Anyone with Google account pada deployment yang berjalan sebagai akun pemilik. Aplikasi belum memiliki autentikasi aplikasi dan otorisasi per pengguna. Server function dapat dipanggil melalui `google.script.run`; akses publik dapat membuka operasi Drive dengan hak akun yang menjalankan deployment.

Jika ingin orang lain menggunakan Hadi KeepFlow, bagikan source repository dan minta setiap orang membuat deployment pribadi mereka sendiri.

## 5. Upgrade instance yang sudah ada

Untuk upgrade dari v1.3.5 ke v1.3.6, lakukan backup terlebih dahulu, lalu ganti **seluruh tujuh file aplikasi** berikut dari paket rilis:

Backend `.gs`:
- `Code.gs`
- `DriveStorage.gs`
- `NotesApi.gs`
- `SyncOperations.gs`

Frontend `.html`:
- `Index.html`
- `AppStyles.html`
- `AppScripts.html`

Jangan mengganti atau menghapus folder `apps/KeepFlow/storage/` di Google Drive. Jangan menghapus LocalStorage, karena dapat berisi draft dan operasi sinkronisasi yang belum selesai.

Untuk versi yang lebih lama dari v1.3.5, baca changelog versi perantara dan lakukan upgrade bertahap setelah backup. Jangan mengasumsikan upgrade langsung aman.

Setelah mengganti file:

1. Simpan project.
2. Pilih **Deploy → Manage deployments**.
3. Edit deployment yang digunakan.
4. Pilih **New version**.
5. Deploy dan buka kembali URL aplikasi.
6. Jalankan checklist regresi.

**Jangan menghapus LocalStorage** sebagai langkah troubleshooting rutin. LocalStorage dapat berisi draft dan operasi sinkronisasi yang belum selesai.

## 6. Backup dan restore

- Gunakan fitur Backup ZIP di aplikasi secara berkala.
- Simpan file backup di lokasi pribadi yang aman.
- Jangan commit backup ZIP ke GitHub.
- Uji proses restore menggunakan salinan data uji sebelum mengandalkannya untuk pemulihan.
- Restore/import bersifat merge-oriented sesuai implementasi versi ini; baca `DATA-PORTABILITY-TEST.md`.

## 7. Troubleshooting awal

| Gejala | Pemeriksaan awal |
|---|---|
| Aplikasi tidak terbuka | Periksa deployment URL dan versi deployment |
| Otorisasi gagal | Pastikan akun memiliki akses Apps Script dan Google Drive |
| Catatan tidak tersimpan | Periksa status sinkronisasi dan izin Drive |
| Backup ZIP gagal | Pastikan browser dapat memuat JSZip dari CDN |
| Ikon atau styling tidak tampil | Periksa koneksi ke CDN Font Awesome/Tailwind |
| Konflik versi | Muat ulang data cloud dan ikuti alur resolusi konflik; jangan menimpa versi cloud secara paksa |

## 8. Pengujian setelah deployment

Untuk v1.3.6, mulai dari `RELEASE-VALIDATION-v1.3.6.md`, lalu lanjutkan dengan:

1. `TEST-CHECKLIST.md`
2. `SYNC-QUEUE-TEST.md`
3. `OFFLINE-RECONCILIATION-TEST.md`
4. `BACKEND-SECURITY-TEST.md`
5. `CONFLICT-VERSION-TEST.md`
6. `DATA-PORTABILITY-TEST.md`
7. `PRODUCTIVITY-FEATURES-TEST.md`

Lanjutkan dengan test guide lain sesuai fitur yang digunakan.

Pengujian manual terhadap Apps Script dan Google Drive tetap harus dilakukan oleh pemilik deployment. Pemeriksaan source code saja tidak dapat membuktikan perilaku live.
