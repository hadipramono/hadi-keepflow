# Instalasi Hadi KeepFlow v1.2.1 — Tahap 1.2

## 1. Backup terlebih dahulu

- Jalankan **Export JSON** pada aplikasi lama.
- Pastikan folder `apps/KeepFlow/storage` dan seluruh file Markdown di Google Drive masih tersedia.
- Buat salinan project Apps Script atau simpan salinan file `Index.html` dan `Code.gs` lama.

## 2. Ganti frontend

Tahap 1.2 hanya mengubah frontend (`Index.html`); backend `Code.gs` tidak berubah.

1. Buka project Google Apps Script.
2. Buka file HTML bernama `Index`.
3. Ganti seluruh isinya dengan `Index.html` dari paket ini.
4. **Jangan mengganti `Code.gs`**; backend tidak berubah pada tahap ini.
5. Simpan project.

## 3. Deploy versi baru

1. Pilih **Deploy > Manage deployments**.
2. Edit deployment Web App yang digunakan.
3. Pada bagian Version, pilih **New version**.
4. Pertahankan pengaturan Execute as dan Who has access yang digunakan sebelumnya.
5. Klik Deploy.
6. Buka URL Web App dan lakukan pengujian berdasarkan `SYNC-QUEUE-TEST.md` dan `OFFLINE-RECONCILIATION-TEST.md`.

## 4. Rollback

Jika ditemukan masalah:
1. Buka project Apps Script.
2. Pulihkan isi file HTML `Index` dari backup.
3. Deploy sebagai New version.
4. Jangan menghapus atau memindahkan file Google Drive untuk melakukan rollback.

## 5. Catatan penting

- Format Markdown dan metadata Drive tidak berubah.
- Queue lama `hadi_keepflow_pending_v1` tetap digunakan. Format antrean lama dimigrasikan satu kali saat aplikasi pertama kali membaca queue.
- Jangan membersihkan LocalStorage atau menghapus key antrean selama masih ada operasi tertunda.
- Simpan backup JSON sampai seluruh pengujian selesai.
