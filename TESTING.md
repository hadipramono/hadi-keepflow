# Testing & verification

## Pemeriksaan source lokal — R1 + R2
- [x] Sintaks empat file `.gs` dengan Node.js.
- [x] Sintaks JavaScript inline dari `AppScripts.html`.
- [x] Perubahan modal dialog dan focus management diperiksa secara statis.
- [x] Perubahan R1 kategori kosong dan perlindungan `Umum` memiliki mock regression test pada tahap R1.
- [ ] Browser runtime test.
- [ ] Google Apps Script deployment test.
- [ ] Google Drive integration test.
- [ ] Real-device mobile and virtual-keyboard test.
- [ ] Screen-reader test.

## Checklist manual

### Editor dan aksesibilitas
- [ ] Buka editor dari tombol tambah dan dari catatan yang sudah ada.
- [ ] Pastikan dialog diumumkan sebagai dialog modal oleh assistive technology.
- [ ] Desktop: fokus awal masuk ke konten editor.
- [ ] Mobile: editor terbuka tanpa memunculkan keyboard virtual secara otomatis.
- [ ] Tab dan Shift+Tab tidak memindahkan fokus keluar dari dialog.
- [ ] Escape menutup menu tindakan terlebih dahulu; Escape berikutnya menjalankan konfirmasi tutup editor.
- [ ] Setelah modal ditutup, fokus kembali ke tombol pemanggil.
- [ ] Uji Save, close, delete, archive/restore, dan pin.
- [ ] Uji draft belum tersimpan dan konfirmasi pembuangan draft.

### Mobile layout
- [ ] Uji viewport sempit, orientasi portrait/landscape, dan zoom.
- [ ] Uji keyboard virtual saat mengetik judul dan isi.
- [ ] Pastikan area konten tetap dapat discroll dan toolbar tidak menutupi teks.
- [ ] Pastikan tombol penting memiliki target sentuh yang memadai.

### Data dan sinkronisasi
- [ ] Kategori berisi catatan tidak dapat dihapus.
- [ ] Kategori dengan subfolder tidak dapat dihapus.
- [ ] Kategori kosong dapat dihapus.
- [ ] `Umum` tidak dapat dihapus.
- [ ] Uji catatan pinned, archived, dan Inbox.
- [ ] Uji backup/restore, offline/reconnect, konflik, dan retry pada Drive uji.

## Batas bukti

Pemeriksaan sintaks dan mock test bukan bukti bahwa aplikasi berjalan benar pada browser atau Google Apps Script live. Jangan menyatakan lulus untuk checklist yang belum benar-benar dijalankan.
