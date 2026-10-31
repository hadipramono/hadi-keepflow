# Instalasi Hadi KeepFlow v1.2.5 — Tahap 2.1

Tahap ini mengoptimalkan frontend. Backend `Code.gs` tidak mengalami perubahan fungsional dari v1.2.4.

1. Backup JSON dari aplikasi.
2. Backup project Apps Script yang sedang aktif.
3. Ganti isi HTML file `Index` dengan `Index.html` dari paket ini.
4. `Code.gs` boleh tetap menggunakan versi v1.2.4; file di paket hanya disertakan untuk konsistensi distribusi.
5. Simpan dan deploy sebagai **New version**.
6. Jalankan `PERFORMANCE-UX-TEST.md`.

Tidak perlu menghapus LocalStorage atau antrean sinkronisasi. Jangan membersihkan `hadi_keepflow_pending_v1`.

## Rollback
Jika ada masalah, kembalikan HTML `Index` dari backup v1.2.4 dan deploy sebagai New version. Data Google Drive dan antrean LocalStorage tidak perlu dihapus.
