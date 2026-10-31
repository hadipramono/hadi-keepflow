# Changelog v1.2.5 — Tahap 2.1: Frontend Performance

## Perubahan frontend
- Menambahkan cache teks biasa per objek catatan (`WeakMap`) agar konten HTML tidak perlu diparse ulang setiap kali pencarian dan render berjalan. Cache memvalidasi sumber konten; jika konten berubah, teks dihitung ulang.
- Memindahkan normalisasi query pencarian ke luar loop filter.
- Menambahkan debounce pencarian 120 ms untuk mengurangi render berulang saat pengguna mengetik cepat.
- Mengganti perhitungan jumlah catatan per kategori dari filter bersarang menjadi satu kali iterasi dengan `Map`.
- Menggunakan event delegation untuk klik kartu, kategori, edit kategori, dan tag. Listener tidak lagi dibuat ulang pada setiap render.
- Meng-escape ID catatan saat dimasukkan ke atribut `data-id`.

## Tidak berubah
- Google Apps Script API dan struktur folder Drive.
- Format Markdown dan metadata catatan.
- Kunci LocalStorage, antrean, retry, conflict detection, dan idempotency.

## Validasi
- Syntax check JavaScript frontend dan backend.
- Pemeriksaan statis untuk memastikan listener per-card/per-tag/per-category sudah dihapus.
- Pengujian browser nyata tetap diperlukan, terutama pencarian, filter, kategori, tag, dan klik kartu.
