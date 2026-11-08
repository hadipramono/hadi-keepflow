# Roadmap

## Baseline saat ini

**v1.3.8 — kandidat stabilisasi (R1 + R2 + R2.1 + audit).** Ringkasan temuan: [`AUDIT.md`](AUDIT.md).

| Area | Status | Validasi yang masih diperlukan |
|---|---|---|
| Catatan, kategori, tag, pin, arsip | Implemented | Uji browser dan Drive |
| Temporary Inbox | Implemented | Uji create/move/reload |
| Backup dan restore ZIP | Implemented | Uji backup dan restore di Drive uji |
| Offline queue dan conflict handling | Implemented | Uji offline/reconnect dan multi-sesi |
| Editor mobile workspace + dock di atas keyboard | Implemented; lulus simulasi browser | Uji perangkat nyata (Android Chrome + Gboard, iOS Safari) pada deployment Apps Script |
| Dialog accessibility | Implemented | Uji keyboard dan screen reader |
| Penghapusan kategori kosong | Implemented | Uji integrasi Drive |
| Format penyimpanan v2 (YAML front matter) | Implemented; lulus tes dengan tiruan Drive | Uji di Drive nyata, termasuk membuka file lama v1 |
| Keamanan single-user | Batasan diketahui | Review izin deployment |

## Prioritas berikutnya

1. Verifikasi posisi dock pada Android Chrome + Gboard dan iOS Safari menggunakan deployment `/exec` terbaru (lihat [`TESTING.md`](TESTING.md)).
2. Jalankan seluruh checklist `TESTING.md` pada deployment Apps Script terpisah.
3. Verifikasi operasi kategori dan catatan pada Google Drive uji.
4. Uji backup/restore, antrean offline, retry, serta konflik dua sesi.
5. Tutup temuan reliabilitas yang tersisa sebelum menetapkan rilis stabil.

## Temuan audit yang belum dikerjakan
Lihat tabel lengkap di [`AUDIT.md`](AUDIT.md). Prioritas teratas:

1. Ukur waktu `getNotes` di Apps Script pada data besar, lalu putuskan cache `CacheService` atau indeks metadata.
2. Pindahkan cache lokal dari `localStorage` ke IndexedDB.
3. Konversi isi catatan ke Markdown murni (field `content_type` sudah disiapkan).
4. Backup otomatis terjadwal ke folder Drive terpisah.
5. Tes browser (Playwright) di CI.

## Utang teknis

- Ganti `document.execCommand` (sudah deprecated) pada editor rich-text dengan implementasi berbasis Selection/Range API atau pustaka editor.
- Ganti `confirm()` (10 tempat) dan `prompt()` (5 tempat) bawaan browser dengan dialog di dalam aplikasi. `alert()` sudah diganti toast non-blokir.
- Pertimbangkan membundel Tailwind/Font Awesome/JSZip secara lokal atau menambahkan Subresource Integrity (SRI) untuk dependency CDN.

## Prinsip produk

- Pertahankan Apps Script + Google Drive + browser storage.
- Google Drive tetap menjadi sumber data persisten.
- Inbox tetap berupa tampilan catatan tanpa kategori.
- `Umum` tetap dilindungi dan kategori biasa hanya dapat dihapus ketika kosong.
- Jangan menambahkan database, AI, vector search, atau multi-user tanpa keputusan desain baru.
