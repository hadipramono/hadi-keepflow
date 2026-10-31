# Instalasi Hadi KeepFlow v1.2.7 — Tahap 2.3

Tahap ini memperbarui editor frontend. Backend `Code.gs` tidak berubah.

1. Backup JSON dari aplikasi.
2. Backup project Apps Script yang sedang aktif.
3. Ganti isi HTML file `Index` dengan `Index.html` dari paket ini.
4. `Code.gs` tetap gunakan versi sebelumnya; file dalam ZIP disertakan untuk konsistensi distribusi.
5. Simpan dan deploy sebagai **New version**.
6. Jalankan `EDITOR-CONTENT-TEST.md` dan seluruh regression checklist sebelumnya.

## Catatan penyimpanan draft
- Draft editor memakai LocalStorage key `hadi_keepflow_editor_draft_v1`.
- Jangan menghapus LocalStorage saat masih ada draft atau antrean sinkronisasi yang belum selesai.
- Draft hanya disimpan di browser/perangkat tempat pengguna mengetik. Draft tidak disinkronkan antarperangkat sebelum tombol Simpan ditekan.
- Saat draft dipulihkan dari baseline yang lebih lama, periksa isi dengan cermat sebelum menyimpan agar tidak menimpa perubahan cloud yang lebih baru.

## Rollback
Kembalikan HTML `Index` dari backup v1.2.6 dan deploy sebagai New version. `Code.gs`, data Drive, dan antrean sinkronisasi tidak perlu diubah.
