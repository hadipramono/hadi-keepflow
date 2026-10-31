# Hadi KeepFlow v1.1.2 — Category count fix

## Aturan jumlah kategori
- Catatan biasa dihitung.
- Catatan pinned/disematkan tetap dihitung.
- Catatan archived/arsip tidak dihitung.

## Perbaikan teknis
- Tambahkan normalisasi boolean ketat untuk metadata `isArchived` dan `isPinned` di backend.
- Tambahkan pemeriksaan status arsip yang aman di frontend.
- Nilai string `"false"` tidak lagi dianggap `true` hanya karena merupakan string non-kosong.
- Tidak mengubah perilaku pin terhadap jumlah kategori.

## Pengujian
1. Catatan biasa menambah hitungan kategori.
2. Sematkan catatan: hitungan kategori tidak berubah.
3. Arsipkan catatan: hitungan kategori berkurang satu.
4. Pulihkan catatan: hitungan kategori bertambah satu.
5. Reload aplikasi dan pastikan hasil tetap konsisten.
