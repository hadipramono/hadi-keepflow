# Contributing

## Prinsip
- Pertahankan Google Drive sebagai penyimpanan persisten.
- Pertahankan Apps Script + HTML Service kecuali ada keputusan arsitektur baru.
- LocalStorage hanya untuk cache, draft, preferensi, dan antrean offline.
- Jaga kompatibilitas format data dan backup.
- Pertahankan perilaku single-user sampai desain autentikasi/otorisasi lengkap tersedia.

## Pull request
Sertakan ringkasan masalah, cakupan perubahan, file yang diubah, catatan kompatibilitas/data, dan hasil pengujian aktual. Perbarui [`CHANGELOG.md`](CHANGELOG.md) jika perilaku aplikasi berubah.

## Pesan commit
Gunakan format [Conventional Commits](https://www.conventionalcommits.org/id/v1.0.0/): `fix:`, `feat:`, `docs:`, `refactor:`, `chore:`. Judul singkat dalam bentuk perintah, isi menjelaskan penyebab dan dampak.

## Pemeriksaan
Jalankan `npm install` sekali lalu `npm test` (Node 18+; satu-satunya dependensi dev adalah `fake-indexeddb`). Format catatan diimplementasikan dua kali (`NoteFormat.gs` dan `AppScripts.html`); tes silang di `tests/format-compat.test.js` harus tetap lulus. Fungsi publik `.gs` dapat dipanggil dari browser; tambahkan ke daftar API di `tests/contract.test.js` hanya bila memang dibutuhkan UI. Jangan menetapkan HTML catatan ke `innerHTML` tanpa `sanitizeEditorHTML`. Lakukan checklist manual pada [`TESTING.md`](TESTING.md) di deployment uji. Jangan mengklaim pengujian Apps Script, Drive, browser, atau perangkat nyata jika belum dijalankan.

Jangan sertakan catatan pribadi, backup, kredensial, atau identifier Drive ke issue maupun commit.
