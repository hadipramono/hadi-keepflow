# Maintainability & Code Structure — Manual Test

## Instalasi
Buat/ganti file berikut di project Apps Script sesuai nama dan isi paket: `Code.gs`, `DriveStorage.gs`, `SyncOperations.gs`, `NotesApi.gs`, `Index.html`, `AppStyles.html`, `AppScripts.html`. Hapus duplikasi fungsi lama setelah memastikan backup tersedia.

## Checklist
- [ ] Project Apps Script tersimpan tanpa syntax error.
- [ ] Web App terbuka dan CSS Tailwind/custom styles tampil.
- [ ] JavaScript frontend berjalan; tidak ada error Console saat load.
- [ ] Daftar catatan dari Drive termuat.
- [ ] Buat, edit, dan hapus satu catatan uji.
- [ ] Offline: edit catatan, pastikan antrean tetap tersimpan, lalu reconnect.
- [ ] Konflik versi tetap meminta keputusan dan tidak menimpa diam-diam.
- [ ] Draft lokal tetap dapat dipulihkan.
- [ ] Navigasi kategori/tag, pencarian, filter tanggal, dan mobile drawer berjalan.
- [ ] Pastikan tidak ada file/operasi ganda akibat fungsi backend terduplikasi.

## Rollback
Kembalikan seluruh file dari backup versi v1.2.7. Jangan hanya mengembalikan `Index.html`, karena v1.2.8 memakai dua HTML partial tambahan dan tiga file backend modular.
