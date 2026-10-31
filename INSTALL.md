# Instalasi Hadi KeepFlow v1.2.4 — Tahap 1.5

## 1. Backup terlebih dahulu
- Jalankan **Export JSON** pada aplikasi.
- Pastikan folder `apps/KeepFlow/storage` dan seluruh file Markdown tersedia di Google Drive.
- Buat salinan project Apps Script serta file `Index.html` dan `Code.gs` versi sebelumnya.

## 2. Perbarui backend dan frontend
1. Buka project Google Apps Script.
2. Ganti seluruh isi `Code.gs` dengan versi dari paket ini.
3. Ganti seluruh isi HTML `Index` dengan versi dari paket ini.
4. Simpan project.

Kedua file perlu diperbarui karena frontend sekarang mengirim `opId` stabil untuk setiap operasi dan backend menyimpan receipt idempotensi.

## 3. Deploy versi baru
1. Pilih **Deploy > Manage deployments**.
2. Edit deployment Web App.
3. Pada bagian Version, pilih **New version**.
4. Pertahankan pengaturan Execute as dan Who has access sesuai kebutuhan keamanan aplikasi.
5. Klik Deploy, lalu buka URL Web App.

## 4. Jalankan pengujian
Jalankan seluruh checklist berikut menggunakan catatan uji:
- `SYNC-QUEUE-TEST.md`
- `OFFLINE-RECONCILIATION-TEST.md`
- `BACKEND-SECURITY-TEST.md`
- `CONFLICT-VERSION-TEST.md`
- `SYNC-RECOVERY-TEST.md`

## 5. Catatan penting
- Jangan menghapus LocalStorage atau antrean `hadi_keepflow_pending_v1` selama masih ada operasi tertunda.
- Retry otomatis menggunakan backoff, maksimal delapan kegagalan berturut-turut. Setelah itu tombol **Coba lagi** muncul.
- Operasi yang sama harus mempertahankan `opId` yang sama saat retry. Jangan mengubah antrean secara manual.
- Backend menyimpan receipt idempotensi selama tujuh hari menggunakan Script Properties. Receipt bukan audit log permanen.
- Jika Script Properties mencapai kuota atau Apps Script gagal, operasi tetap perlu diperiksa melalui **Apps Script > Executions**.
- Pengujian kehilangan respons harus dilakukan pada catatan uji, bukan data penting.

## 6. Rollback
Pulihkan kedua file dari backup, lalu deploy sebagai **New version**. Jangan menghapus atau memindahkan file Drive untuk melakukan rollback.
