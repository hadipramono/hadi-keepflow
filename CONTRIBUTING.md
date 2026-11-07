# Contributing

## Prinsip
- Pertahankan Google Drive sebagai penyimpanan persisten.
- Pertahankan Apps Script + HTML Service kecuali ada keputusan arsitektur baru.
- LocalStorage hanya untuk cache, draft, preferensi, dan antrean offline.
- Jaga kompatibilitas format data dan backup.
- Pertahankan perilaku single-user sampai desain autentikasi/otorisasi lengkap tersedia.

## Pull request
Sertakan ringkasan masalah, cakupan perubahan, file yang diubah, catatan kompatibilitas/data, dan hasil pengujian aktual. Perbarui `CHANGELOG.md` jika perilaku aplikasi berubah.

## Pemeriksaan
Jalankan pemeriksaan sintaks `.gs` dan JavaScript inline. Lakukan checklist manual pada `TESTING.md` di deployment uji. Jangan mengklaim pengujian Apps Script, Drive, browser, atau perangkat nyata jika belum dijalankan.

Jangan sertakan catatan pribadi, backup, kredensial, atau identifier Drive ke issue maupun commit.
