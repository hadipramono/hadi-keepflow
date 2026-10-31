# Hadi KeepFlow v1.2.3 — Tahap 1.4: Conflict Detection & Version Control

## Tujuan
Mencegah update atau penghapusan catatan yang memakai versi cloud lama sehingga perubahan dari perangkat lain tidak tertimpa diam-diam.

## Perubahan
- Backend mengirim `baseUpdatedAt` sebagai token versi berdasarkan `DriveFile.getLastUpdated()`.
- `saveNote()` membandingkan `baseUpdatedAt` dari klien dengan versi file terkini sebelum menulis.
- `deleteNote()` menerima `expectedUpdatedAt` dan memeriksa versi sebelum menghapus.
- Konflik dikembalikan sebagai `status: conflict` beserta snapshot catatan cloud terkini.
- Frontend meminta keputusan eksplisit ketika konflik terdeteksi: pertahankan versi lokal (overwrite terkonfirmasi) atau gunakan versi cloud.
- Jika file cloud sudah tidak ada, pengguna dapat membuat ulang salinan lokal sebagai catatan baru atau membuang perubahan lokal.
- Baseline versi diperbarui pada operasi antrean berikutnya setelah save berhasil, tanpa mengganti snapshot isi lokal yang lebih baru.
- Operasi antrean lama tanpa token versi akan masuk jalur konflik, bukan otomatis menimpa cloud.

## Kompatibilitas
- Struktur penyimpanan Drive dan format Markdown tetap sama.
- Tidak ada migrasi file Drive.
- LocalStorage queue key tetap `hadi_keepflow_pending_v1`.
- Antrean lama tetap dibaca; operasi update/delete untuk catatan cloud yang tidak memiliki token versi akan meminta keputusan konflik satu kali.

## Batasan
- Versi memakai waktu modifikasi Drive, bukan hash konten/ETag.
- `LockService` mencegah dua operasi melalui project Apps Script ini saling berlomba, tetapi tidak menyediakan conditional write atomik terhadap edit manual langsung di Google Drive. Hindari mengedit file Markdown KeepFlow langsung di Drive saat aplikasi aktif.
- Browser, deployment Apps Script, dan Google Drive live harus diuji manual.
