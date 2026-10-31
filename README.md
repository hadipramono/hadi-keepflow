# Hadi KeepFlow v1.1.1

Paket ini berisi revisi frontend dan backend Hadi KeepFlow.

## Isi paket

- `Index.html` — frontend aplikasi.
- `Code.gs` — backend Google Apps Script.
- `INSTALL.md` — petunjuk pemasangan dan deployment.
- `TEST-CHECKLIST.md` — daftar pengujian setelah pemasangan.

## Penting sebelum pemasangan

1. Export catatan melalui fitur **Export JSON** pada aplikasi versi lama.
2. Pastikan file Markdown di Google Drive tetap utuh.
3. Jangan menghapus folder `apps/KeepFlow/storage`.
4. Simpan salinan project Apps Script versi lama agar dapat dikembalikan jika diperlukan.

## Catatan kompatibilitas

Backend mempertahankan struktur penyimpanan Google Drive:
`My Drive/apps/KeepFlow/storage/<kategori>/<catatan>.md`

Metadata catatan tetap menggunakan pembungkus `---JSON---` yang sudah digunakan versi sebelumnya.

## Status validasi

File disiapkan sebagai revisi kode. Paket ini belum menjalani pengujian langsung terhadap akun Google Drive atau deployment Apps Script milik pengguna. Lakukan checklist pengujian sebelum menjadikan v1.1.1 sebagai versi utama.
