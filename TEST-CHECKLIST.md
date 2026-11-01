# Hadi KeepFlow v1.1 — Test Checklist

Gunakan catatan percobaan, bukan catatan penting. Pastikan backup tersedia.

| No. | Pengujian | Hasil yang diharapkan | Status |
|---:|---|---|---|
| 1 | Buka aplikasi dan muat catatan lama | Catatan tampil tanpa duplikasi | [ ] |
| 2 | Buka catatan lama | Judul, isi, kategori, tag, pin, dan arsip benar | [ ] |
| 3 | Buat catatan baru online | Catatan tersimpan di folder kategori Google Drive | [ ] |
| 4 | Edit judul dan isi | File diperbarui, bukan dibuat ganda | [ ] |
| 5 | Pindahkan kategori | File berpindah ke folder kategori tujuan | [ ] |
| 6 | Pin / lepas pin | Status tetap benar setelah reload | [ ] |
| 7 | Archive / pulihkan | Status tetap benar setelah reload | [ ] |
| 8 | Hapus catatan percobaan | File masuk Trash Google Drive | [ ] |
| 9 | Reload setelah Delete | Catatan yang dihapus tidak muncul kembali | [ ] |
| 10 | Buat catatan ketika offline | Catatan tersimpan lokal dan masuk antrean | [ ] |
| 11 | Kembali online | Antrean diproses dan catatan tersimpan di Drive | [ ] |
| 12 | Export JSON | File backup dapat diunduh dan dibaca | [ ] |
| 13 | Import JSON | Catatan di-merge berdasarkan ID | [ ] |
| 14 | Pencarian judul dan isi | Hasil sesuai kata kunci | [ ] |
| 15 | Filter tanggal | Hasil sesuai rentang yang dipilih | [ ] |
| 16 | Tampilan grid/list | Kedua mode dapat digunakan | [ ] |
| 17 | Tema gelap/terang | Tema dapat diubah | [ ] |
| 18 | Tutup editor dengan perubahan | Aplikasi meminta konfirmasi | [ ] |

## Pemeriksaan tambahan

- Periksa Console browser untuk error JavaScript.
- Periksa Executions di Google Apps Script jika operasi server gagal.
- Pastikan status sinkronisasi berubah menjadi tersinkron setelah antrean selesai.
- Uji di satu browser/perangkat terlebih dahulu sebelum digunakan lintas perangkat.

## Catatan

Checklist ini adalah rencana pengujian manual, bukan bukti bahwa seluruh skenario telah lulus. Sinkronisasi lintas tab/perangkat dan konflik edit bersamaan perlu diuji terpisah.

## Tahap 1.2 — Offline & Reconciliation
- [ ] Reconnect memicu pemuatan ulang baseline cloud.
- [ ] Catatan dengan save tertunda tetap dipertahankan selama rekonsiliasi.
- [ ] Catatan dengan delete tertunda tidak muncul kembali dari snapshot cloud.
- [ ] Edit saat `getNotes()` berlangsung tidak hilang.
- [ ] Refresh yang terjadi saat operasi tulis berlangsung ditunda hingga operasi selesai.
- [ ] Kegagalan refresh tidak menghapus data lokal.
- [ ] Lihat `OFFLINE-RECONCILIATION-TEST.md` untuk skenario lengkap.

## Tahap 2.3 — Editor & Content Handling
- [ ] Draft editor tersimpan lokal setelah jeda input.
- [ ] Draft dapat dipulihkan setelah reload dengan konfirmasi.
- [ ] Draft tidak dikirim ke Drive sebelum Simpan.
- [ ] Ctrl+S / Cmd+S menjalankan Simpan.
- [ ] HTML berbahaya dibersihkan dan format toolbar tetap berfungsi.
- [ ] Tag dinormalisasi dan batas input diterapkan.
- [ ] Regression offline, antrean, konflik, dan sinkronisasi tetap lulus.


## v1.2.8 — Maintainability
- [ ] Jalankan `MAINTAINABILITY-TEST.md`.
- [ ] Pastikan seluruh file `.gs` dan HTML partial tersedia dengan nama tepat.
- [ ] Pastikan tidak ada fungsi duplikat yang tertinggal di project Apps Script.


## Phase 3.7.4 — Integration & Reliability

- [ ] Run `node tests/phase-3.7.4-regression.test.js`.
- [ ] Complete `PHASE-3.7.4-INTEGRATION-RELIABILITY-TEST.md` in a separate Apps Script test deployment.
