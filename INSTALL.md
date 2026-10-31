# Instalasi Hadi KeepFlow v1.2.6 — Tahap 2.2

Tahap ini memperbarui UX dan navigasi frontend. Backend `Code.gs` tidak berubah secara fungsional dari v1.2.5.

1. Backup JSON dari aplikasi.
2. Backup project Apps Script yang sedang aktif.
3. Ganti isi HTML file `Index` dengan `Index.html` dari paket ini.
4. `Code.gs` tetap gunakan versi v1.2.5; file dalam ZIP disertakan untuk konsistensi distribusi.
5. Simpan dan deploy sebagai **New version**.
6. Jalankan `UX-NAVIGATION-TEST.md` dan regression checklist yang sudah ada.

Tidak perlu menghapus LocalStorage atau antrean sinkronisasi. Jangan membersihkan `hadi_keepflow_pending_v1`.

## Rollback
Jika ada masalah, kembalikan HTML `Index` dari backup v1.2.5 dan deploy sebagai New version. Data Google Drive dan antrean LocalStorage tidak perlu dihapus.
