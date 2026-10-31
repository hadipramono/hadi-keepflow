# Offline & Reconciliation — Manual Test

Lakukan pengujian pada deployment uji atau setelah membuat backup JSON dan salinan project Apps Script.

## A. Reconnect dan baseline cloud
1. Buka KeepFlow saat online dan tunggu status tersinkron.
2. Putuskan koneksi internet.
3. Buat catatan baru, ubah catatan yang ada, lalu hapus satu catatan.
4. Pastikan perubahan tetap terlihat setelah halaman di-refresh saat masih offline.
5. Sambungkan internet kembali.
6. Pastikan aplikasi memuat ulang baseline cloud, lalu mengirim antrean.
7. Pastikan catatan baru/perubahan tersimpan di Drive dan catatan yang dihapus tidak muncul kembali.

## B. Perubahan dari perangkat/tab lain
1. Buka KeepFlow pada dua tab/perangkat.
2. Buat atau ubah catatan dari tab/perangkat kedua.
3. Pada tab pertama, putuskan lalu sambungkan kembali koneksi (atau reload halaman).
4. Pastikan snapshot cloud terbaru tampil setelah rekonsiliasi.

## C. Edit saat pemuatan cloud berlangsung
1. Reload aplikasi dengan koneksi lambat (DevTools Network throttling).
2. Sebelum `getNotes()` selesai, buat atau ubah catatan jika UI sudah dapat digunakan.
3. Pastikan perubahan masuk antrean dan tidak hilang setelah respons cloud tiba.

## D. Delete saat pemuatan cloud berlangsung
1. Dengan koneksi lambat, mulai reload.
2. Hapus catatan sebelum respons `getNotes()` selesai.
3. Pastikan catatan tidak muncul kembali setelah rekonsiliasi dan antrean delete diproses.

## E. Gangguan server
1. Simulasikan kegagalan request `getNotes()` (misalnya sementara nonaktifkan akses jaringan ke Apps Script).
2. Pastikan data lokal tetap tampil dan tidak dikosongkan.
3. Pulihkan koneksi; pastikan refresh berikutnya berhasil dan antrean diproses.

## F. Pemeriksaan akhir
- Status sinkron menunjukkan berhasil setelah antrean kosong.
- Tidak ada catatan duplikat.
- Tidak ada catatan terhapus yang muncul kembali.
- Export JSON dapat dibuka dan jumlah catatan sesuai.
- Periksa Console browser dan Apps Script Executions jika hasil berbeda dari yang diharapkan.
