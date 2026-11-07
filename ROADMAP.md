# Roadmap

## Baseline saat ini

**v1.3.7 stabilization candidate — R1 + R2.**

| Area | Status source | Validasi yang masih diperlukan |
|---|---|---|
| Catatan, kategori, tag, pin, arsip | Implemented | Browser dan Drive test |
| Temporary Inbox | Implemented | Uji create/move/reload |
| Backup dan restore ZIP | Implemented | Uji backup dan restore di Drive uji |
| Offline queue dan conflict handling | Implemented | Uji offline/reconnect dan multi-sesi |
| Editor mobile | Implemented | Uji perangkat nyata dan virtual keyboard |
| Dialog accessibility | Implemented pada source R2 | Uji keyboard dan screen reader |
| Penghapusan kategori kosong | R1 implemented | Uji integrasi Drive |
| Keamanan single-user | Batasan diketahui | Review deployment permissions |

## Prioritas berikutnya

1. Jalankan seluruh checklist `TESTING.md` pada deployment Apps Script terpisah.
2. Uji editor pada Android/iOS dan desktop, termasuk keyboard virtual, rotasi, zoom, Tab, Shift+Tab, dan Escape.
3. Verifikasi operasi kategori dan catatan pada Google Drive uji.
4. Uji backup/restore, antrean offline, retry, serta konflik dua sesi.
5. Tutup temuan reliabilitas yang tersisa sebelum menetapkan rilis stabil.

## Prinsip produk

- Pertahankan Apps Script + Google Drive + browser storage.
- Google Drive tetap menjadi sumber data persisten.
- Inbox tetap berupa tampilan catatan tanpa kategori.
- `Umum` tetap dilindungi dan kategori biasa hanya dapat dihapus ketika kosong.
- Jangan menambahkan database, AI, vector search, atau multi-user tanpa keputusan desain baru.
