# Hadi KeepFlow v1.2.1 — Tahap 1.2: Offline & Reconciliation

Paket ini melanjutkan stabilisasi antrean dengan rekonsiliasi cloud setelah reconnect dan perlindungan data lokal selama pemuatan ulang.

## Isi paket

- `Index.html` — frontend dengan Sync Queue dan Offline Reconciliation.
- `Code.gs` — salinan backend v1.1.3 untuk referensi; tidak perlu diganti pada tahap ini.
- `INSTALL.md` — petunjuk pemasangan dan rollback.
- `SYNC-QUEUE-TEST.md` — regression test antrean Tahap 1.1.
- `OFFLINE-RECONCILIATION-TEST.md` — skenario pengujian reconnect dan rekonsiliasi Tahap 1.2.
- `TEST-CHECKLIST.md` — checklist pengujian umum.
- `CHANGELOG-v1.2.0-phase-1.1.md` — riwayat Tahap 1.1.
- `CHANGELOG-v1.2.0-phase-1.2.md` — ringkasan perubahan Tahap 1.2.

## Arsitektur yang dipertahankan

- Frontend: HTML, Tailwind CSS, Vanilla JavaScript.
- Backend: Google Apps Script.
- Penyimpanan: file Markdown di Google Drive.
- Cache lokal dan antrean: LocalStorage.

Struktur folder dan format metadata Markdown di Google Drive tidak diubah.

## Validasi yang dilakukan

- Pemeriksaan sintaks JavaScript inline dengan Node.js: lulus.
- `Code.gs` tidak berubah dari paket Tahap 1.1.
- Belum diuji langsung pada browser, deployment Apps Script, atau Google Drive pengguna; ikuti checklist manual sebelum pemakaian rutin.
