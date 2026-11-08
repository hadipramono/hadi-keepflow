# Roadmap

## Baseline saat ini

**v1.3.8 — kandidat stabilisasi (R1 + R2 + R2.1).**

| Area | Status | Validasi yang masih diperlukan |
|---|---|---|
| Catatan, kategori, tag, pin, arsip | Implemented | Uji browser dan Drive |
| Temporary Inbox | Implemented | Uji create/move/reload |
| Backup dan restore ZIP | Implemented | Uji backup dan restore di Drive uji |
| Offline queue dan conflict handling | Implemented | Uji offline/reconnect dan multi-sesi |
| Editor mobile workspace + dock di atas keyboard | Implemented; lulus simulasi browser | Uji perangkat nyata (Android Chrome + Gboard, iOS Safari) pada deployment Apps Script |
| Dialog accessibility | Implemented | Uji keyboard dan screen reader |
| Penghapusan kategori kosong | Implemented | Uji integrasi Drive |
| Keamanan single-user | Batasan diketahui | Review izin deployment |

## Prioritas berikutnya

1. Verifikasi posisi dock pada Android Chrome + Gboard dan iOS Safari menggunakan deployment `/exec` terbaru (lihat [`TESTING.md`](TESTING.md)).
2. Jalankan seluruh checklist `TESTING.md` pada deployment Apps Script terpisah.
3. Verifikasi operasi kategori dan catatan pada Google Drive uji.
4. Uji backup/restore, antrean offline, retry, serta konflik dua sesi.
5. Tutup temuan reliabilitas yang tersisa sebelum menetapkan rilis stabil.

## Utang teknis

- Ganti `document.execCommand` (sudah deprecated) pada editor rich-text dengan implementasi berbasis Selection/Range API atau pustaka editor.
- Ganti `confirm()` / `prompt()` / `alert()` bawaan browser dengan dialog di dalam aplikasi. Dialog native memblokir thread dan kurang andal di dalam iframe Apps Script.
- Hapus fungsi kompatibilitas `saveNotes` dan `deleteNoteFromFile` di `NotesApi.gs` setelah dipastikan tidak ada klien lama yang memakainya (frontend saat ini tidak memanggil keduanya).
- Pertimbangkan membundel Tailwind/Font Awesome/JSZip secara lokal atau menambahkan Subresource Integrity (SRI) untuk dependency CDN.

## Prinsip produk

- Pertahankan Apps Script + Google Drive + browser storage.
- Google Drive tetap menjadi sumber data persisten.
- Inbox tetap berupa tampilan catatan tanpa kategori.
- `Umum` tetap dilindungi dan kategori biasa hanya dapat dihapus ketika kosong.
- Jangan menambahkan database, AI, vector search, atau multi-user tanpa keputusan desain baru.
