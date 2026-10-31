# Hadi KeepFlow v1.2.1 — Tahap 1.2: Offline & Reconciliation

## Fokus perubahan
Memperkuat pemuatan ulang baseline cloud dan rekonsiliasi catatan lokal dengan Google Drive, khususnya setelah koneksi kembali tersedia.

## Perubahan
- Setiap event `online` meminta ulang snapshot `getNotes()` sebelum antrean diproses.
- Pemuatan cloud dan pengiriman operasi dibuat saling eksklusif agar snapshot lama tidak berlomba dengan operasi tulis yang sedang berjalan.
- Permintaan refresh yang datang saat operasi tulis berjalan ditunda sampai operasi selesai.
- Permintaan refresh ganda saat pemuatan cloud berjalan ditandai untuk dijalankan kembali setelah respons saat ini selesai.
- Setiap respons pemuatan diberi nomor request agar respons lama tidak menimpa hasil request yang lebih baru.
- Catatan lokal dengan operasi `save` tertunda dipertahankan saat baseline cloud digabungkan.
- Operasi `delete` tertunda diperlakukan sebagai tombstone selama rekonsiliasi sehingga catatan tidak muncul kembali dari snapshot cloud.
- Kegagalan refresh mempertahankan data lokal; jika sebelumnya baseline cloud sudah siap, antrean tetap dapat dilanjutkan.
- Queue lama tetap dimigrasikan satu kali dan tidak dibaca ulang saat reconnect sehingga operasi yang sedang aktif tidak tertimpa state LocalStorage yang lebih lama.

## Batasan
- Belum ada resolusi konflik konten antarperangkat jika catatan yang sama diedit bersamaan tanpa operasi lokal yang tertunda.
- Belum ada version/ETag pada file Drive. Deteksi konflik lintas perangkat dan validasi kepemilikan file masuk tahap backend berikutnya.
- Belum diuji langsung pada browser, deployment Apps Script, atau Google Drive pengguna.
