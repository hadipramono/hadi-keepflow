# Changelog

## v1.3.7 — Stabilization candidate (R1 + R2)

### R1 — Editor & category stabilization
- Memperbaiki aturan `hidden` pada editor modal agar modal benar-benar tersembunyi saat ditutup.
- Kategori `Umum` dilindungi dari penghapusan.
- Penghapusan kategori ditolak jika masih ada file catatan atau subfolder.
- Tidak ada pemindahan atau penghapusan catatan saat kategori tidak kosong.

### R2 — Mobile UX & accessibility
- Editor modal memiliki semantics dialog: `role="dialog"`, `aria-modal`, label, dan deskripsi.
- Tombol tutup editor memiliki accessible name dan target sentuh minimum 44px.
- Focus awal editor disesuaikan: desktop ke area konten, mobile ke tombol tutup agar keyboard virtual tidak terbuka otomatis.
- Fokus dikembalikan ke elemen yang membuka editor setelah modal ditutup.
- Tab dan Shift+Tab dijaga tetap berada di dalam modal (focus trap).
- Escape menutup menu tindakan mobile terlebih dahulu; Escape berikutnya menjalankan alur tutup editor yang sudah meminta konfirmasi bila diperlukan.
- Seluruh jalur tutup editor menggunakan lifecycle penutupan terpusat.

### Riwayat fitur sebelumnya
Fitur utama yang telah dikembangkan pada versi sebelumnya meliputi Temporary Inbox, navigasi workspace, kategori, backup/restore, pencarian, organisasi catatan, template, checklist, dashboard, dan sinkronisasi offline. Detail historis per fase sebelumnya diringkas di sini agar changelog repository tetap ringkas.
