# Instalasi Hadi KeepFlow v1.1

## 1. Backup

- Pada aplikasi lama, jalankan **Export JSON**.
- Di Google Drive, pastikan folder `apps/KeepFlow/storage` dan seluruh file Markdown masih tersedia.
- Di Apps Script, buat salinan project atau simpan salinan isi `Code.gs` dan `Index.html` lama.

## 2. Ganti file Apps Script

1. Buka project Google Apps Script yang digunakan Hadi KeepFlow.
2. Buka file HTML bernama `Index`.
3. Ganti seluruh isinya dengan file `Index.html` dari paket ini.
4. Buka file script `Code.gs`.
5. Ganti seluruh isinya dengan file `Code.gs` dari paket ini.
6. Simpan project.

## 3. Deploy ulang

1. Pilih **Deploy > Manage deployments**.
2. Edit deployment Web App yang digunakan.
3. Pada bagian Version, pilih **New version**.
4. Periksa kembali pengaturan Execute as dan Who has access; pertahankan pengaturan yang memang digunakan sebelumnya.
5. Klik Deploy.
6. Buka URL Web App dan lakukan pengujian.

Jika menggunakan URL deployment lama, pastikan deployment tersebut sudah diarahkan ke versi baru.

## 4. Catatan penting

- Jangan menghapus folder atau file di Google Drive.
- Jangan menjalankan fungsi penghapusan massal.
- Penghapusan melalui aplikasi akan memindahkan file ke Trash Google Drive.
- Simpan backup JSON sampai semua pengujian selesai.
- Jika ada masalah, pulihkan kode Apps Script lama dari salinan backup. Jangan menghapus data Drive untuk melakukan rollback.

## 5. Pengujian minimal

Lakukan pengujian pada satu catatan percobaan terlebih dahulu:
1. Buka catatan.
2. Ubah judul dan isi, lalu simpan.
3. Reload dan pastikan perubahan tetap ada.
4. Hapus catatan percobaan.
5. Periksa Google Drive Trash.
6. Reload aplikasi dan pastikan catatan tidak muncul kembali.

Lanjutkan pengujian lain berdasarkan `TEST-CHECKLIST.md`.
