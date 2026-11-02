# Hadi KeepFlow v1.3.6-dev — Mobile Navigation Phase 2

## Cakupan

Paket ini memperbarui navigasi frontend dari sumber `Index(1).html` (2 November 2026), `AppStyles.html`, dan `AppScripts.html`. `Index(1).html` dikemas sebagai `Index.html`, sesuai nama file entry yang dipakai `include('AppStyles')` dan `include('AppScripts')` pada Google Apps Script.

Perubahan:

- Drawer mobile memiliki tombol tutup, backdrop yang bisa diketuk, Escape, dan toggle yang tetap mempertahankan mode collapse desktop.
- `aria-controls`, `aria-expanded`, label tombol yang berubah, status `aria-hidden`, fokus awal, pengembalian fokus, dan pembatas Tab saat drawer terbuka.
- Scroll halaman dikunci selama drawer terbuka, posisi gulir serta nilai inline style sebelumnya dipulihkan saat drawer ditutup atau viewport kembali ke desktop.
- Navigasi/filter, dashboard, kategori, dan tag menutup drawer lewat alur handler yang ada.
- Tinggi dan posisi drawer/backdrop mengikuti header serta status sinkronisasi, dengan dukungan safe area, `100dvh`, area sentuh header, fokus terlihat, dan reduced motion.

Tidak ada perubahan pada API/server Google Apps Script, Drive, sinkronisasi, model data, maupun fungsi CRUD.

## Hasil pemeriksaan sumber dan batasan

Sumber terbaru sudah memiliki drawer dasar dan penutupan pada pilihan filter, kategori, tag, dan dashboard. Perubahan Phase 1 tidak diasumsikan: pemeriksaan menemukan `openEditor()` masih memfokuskan area isi secara otomatis dan CSS editor masih memakai `45vh`. Karena paket ini khusus Phase 2, perilaku editor tersebut tidak diubah dan hasil Phase 1 tidak diklaim ikut terintegrasi. Gunakan paket Phase 1 yang sudah diuji/dipilih secara terpisah bila perubahan editor itu diperlukan.

## Checklist uji manual

### Mobile — 320×568, 360×800, dan 390×844

- [ ] Tombol menu membuka drawer; tombol X menutupnya.
- [ ] Mengetuk backdrop menutup drawer; mengetuk isi drawer tidak menutupnya.
- [ ] Escape menutup drawer dan fokus kembali ke tombol menu.
- [ ] Tab dan Shift+Tab tetap berada di dalam drawer saat terbuka.
- [ ] Memilih Dashboard, Inbox, Semua Catatan, Disematkan, Arsip, kategori, atau tag menutup drawer dan memperbarui tampilan.
- [ ] Halaman di belakang drawer tidak ikut bergulir; setelah ditutup gulir sebelumnya kembali dan halaman bisa digulir.
- [ ] Uji area atas/bawah pada perangkat dengan notch/home indicator dan orientasi landscape.
- [ ] Pada lebar 320 px, tombol header tetap dapat dijangkau dan kolom pencarian tidak menutupi kontrol.
- [ ] Preferensi reduced motion mengurangi animasi drawer.

### Tablet dan desktop

- [ ] Pada lebar 1024 px ke atas, toggle tetap menyembunyikan/menampilkan sidebar seperti sebelumnya.
- [ ] Resize dari mobile ke desktop saat drawer terbuka memulihkan scroll lock dan menyelaraskan status ARIA.
- [ ] Navigasi, pencarian, filter tanggal, dashboard, dan editor tetap dapat digunakan.

## Status validasi

Pemeriksaan sintaks JavaScript dan pemeriksaan statis paket dilakukan sebelum distribusi. Uji live pada Google Apps Script/Drive serta pengujian browser perangkat Android/iOS nyata belum dilakukan.
