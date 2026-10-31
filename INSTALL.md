# Instalasi Hadi KeepFlow v1.2.2 — Tahap 1.3

## 1. Backup terlebih dahulu

- Jalankan **Export JSON** pada aplikasi.
- Pastikan folder `apps/KeepFlow/storage` dan seluruh file Markdown masih tersedia di Google Drive.
- Buat salinan project Apps Script atau simpan salinan file `Index.html` dan `Code.gs` lama.

## 2. Perbarui backend

1. Buka project Google Apps Script yang digunakan KeepFlow.
2. Buka file script `Code.gs`.
3. Ganti seluruh isinya dengan `Code.gs` dari paket ini.
4. Simpan project.

## 3. Frontend

`Index.html` dalam paket ini sama dengan v1.2.1. Tidak perlu mengganti file HTML jika frontend v1.2.1 sudah terpasang.

## 4. Deploy versi baru

1. Pilih **Deploy > Manage deployments**.
2. Edit deployment Web App yang digunakan.
3. Pada bagian Version, pilih **New version**.
4. Pertahankan pengaturan Execute as dan Who has access sesuai kebutuhan aplikasi.
5. Klik Deploy.
6. Buka URL Web App dan jalankan `BACKEND-SECURITY-TEST.md`, `SYNC-QUEUE-TEST.md`, serta `OFFLINE-RECONCILIATION-TEST.md`.

## 5. Catatan penting

- Backend sekarang menolak update/delete jika file tidak berada langsung di `storage` atau satu folder kategori langsung di bawah `storage`.
- File dengan lebih dari satu parent Drive ditolak. Jangan memindahkan atau menghapus file tersebut sebelum memeriksa struktur Drive.
- Folder duplikat `apps`, `KeepFlow`, `storage`, atau kategori akan menyebabkan operasi terkait ditolak agar backend tidak memilih folder secara acak.
- ID file yang tidak ditemukan tidak lagi diperlakukan sebagai catatan baru.
- Jangan menghapus LocalStorage atau queue yang masih berisi operasi tertunda.

## 6. Rollback

Jika ditemukan masalah, pulihkan `Code.gs` dari backup dan deploy sebagai New version. Jangan menghapus atau memindahkan file Drive untuk melakukan rollback.
