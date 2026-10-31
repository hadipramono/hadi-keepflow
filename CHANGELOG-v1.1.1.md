# Hadi KeepFlow v1.1.1 — Bug fixes

## Perbaikan
- Tombol pin sekarang memperbarui status visual secara langsung di editor.
- Pencarian catatan aktif dan tampilan daftar dirender ulang setelah status pin berubah.
- Jumlah catatan di sidebar kategori hanya menghitung catatan yang belum diarsipkan.
- Nama kategori tetap ditampilkan meskipun seluruh catatannya sedang diarsipkan.

## Pengujian yang disarankan
1. Buka catatan, klik Sematkan, pastikan tombol berubah aktif.
2. Tutup dan buka kembali catatan, pastikan status pin tetap aktif.
3. Muat ulang aplikasi, pastikan catatan tetap muncul di bagian Disematkan.
4. Catat jumlah pada sebuah kategori, arsipkan satu catatan di kategori tersebut, pastikan jumlah berkurang satu.
5. Buka menu Arsip, pulihkan catatan, pastikan jumlah kategori bertambah kembali.
