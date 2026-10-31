# Hadi KeepFlow v1.2.0 — Tahap 1.1: Sync Queue

Paket ini berfokus pada stabilisasi antrean sinkronisasi frontend.

## Isi paket

- `Index.html` — frontend dengan perbaikan Sync Queue.
- `Code.gs` — salinan backend v1.1.3 untuk referensi; tidak perlu diganti pada tahap ini.
- `INSTALL.md` — petunjuk pemasangan dan rollback.
- `SYNC-QUEUE-TEST.md` — skenario regression test khusus antrean.
- `TEST-CHECKLIST.md` — checklist pengujian umum.
- `CHANGELOG-v1.2.0-phase-1.1.md` — ringkasan perubahan.

## Arsitektur yang dipertahankan

- Frontend: HTML, Tailwind CSS, Vanilla JavaScript.
- Backend: Google Apps Script.
- Penyimpanan: file Markdown di Google Drive.
- Cache lokal dan antrean: LocalStorage.

Struktur folder dan format metadata Markdown di Google Drive tidak diubah.

## Validasi yang dilakukan

- Pemeriksaan sintaks JavaScript inline dengan Node.js: lulus.
- Pemeriksaan sintaks backend tidak berubah karena `Code.gs` tidak dimodifikasi.
- Belum diuji langsung pada browser, deployment Apps Script, atau Google Drive pengguna.
