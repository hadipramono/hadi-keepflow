# Hadi KeepFlow v1.3.6-dev — Functional Regression Phase 4

## Cakupan audit dan perubahan

Paket melanjutkan frontend Phase 3. Pemeriksaan frontend mencakup CRUD, pin/arsip/hapus, draft, antrean sinkronisasi, konflik, pencarian, serta backup/restore. File `.gs` yang tersedia hanya dibaca untuk mencocokkan kontrak; tidak ada backend yang diubah.

Perbaikan:

- Normalisasi ID dipakai konsisten pada arsip/hapus dan antrean, termasuk ID numerik `0`.
- Status `isPinned`/`isArchived` dinormalisasi agar nilai teks seperti `"false"` tidak dianggap benar.
- Draft segera dicoba simpan saat tab disembunyikan, halaman ditutup, atau `pagehide`; timer debounce yang tertunda dibatalkan terlebih dahulu.
- Backup, ubah nama, dan hapus kategori sekarang mendeteksi perubahan editor yang belum disimpan meskipun draft sudah selesai ditulis ke localStorage.
- Hapus permanen membersihkan draft milik catatan dan state editor; arsip menyimpan draft tertunda sebelum menutup editor.
- Backup memakai nama kategori/path yang aman sambil menyimpan judul asli catatan di manifest, sehingga judul dengan karakter khusus bisa dipulihkan.
- Konflik tetap menggunakan alur konfirmasi dan versi dasar yang ada. Tidak ada perubahan pada kontrak `saveNote`, `deleteNote`, atau API Drive.

Pemeriksaan ulang menemukan perubahan editor Phase 1 belum ada di sumber yang menjadi basis: `openEditor()` masih memfokuskan area isi otomatis dan CSS editor masih memakai `45vh`. Fase ini tidak mengklaim atau memasukkan perbaikan editor tersebut.

## Checklist regresi manual

### CRUD, pin, arsip, hapus

- [ ] Buat catatan dengan judul saja, isi saja, lalu judul dan isi; simpan dan buka kembali.
- [ ] Ubah judul, isi, kategori, dan tag; pastikan hasil tetap setelah sinkronisasi.
- [ ] Pin/lepas pin dan periksa status pada kartu serta dashboard.
- [ ] Arsipkan dari editor, buka tampilan Arsip, lalu pulihkan; pastikan isi dan metadata tetap.
- [ ] Hapus permanen setelah konfirmasi; pastikan catatan hilang setelah muat ulang dan draft lama tidak ditawarkan lagi.
- [ ] Uji data lama dengan flag `true`, `false`, `"true"`, dan `"false"` bila tersedia.

### Pencarian, draft, offline, sinkronisasi, konflik

- [ ] Cari judul, isi, kategori, dan tag; uji Enter, riwayat, hapus pencarian, serta Escape.
- [ ] Ketik lalu segera pindah aplikasi/tab sebelum jeda autosave; kembali dan pulihkan draft terakhir.
- [ ] Uji `pagehide`/reload dengan perubahan yang belum melewati debounce.
- [ ] Offline: buat, ubah, arsipkan, dan hapus catatan; muat ulang; pastikan data lokal dan antrean tertunda bertahan.
- [ ] Sambungkan kembali; pastikan antrean dikirim satu per satu, jumlah tertunda turun, dan tidak ada catatan yang muncul kembali setelah penghapusan.
- [ ] Dua sesi: ubah catatan cloud dari sesi kedua sebelum sesi pertama menyinkronkan; uji pilihan mempertahankan lokal dan memakai cloud untuk konflik simpan/hapus.

### Backup / restore

- [ ] Backup saat tersinkron; buka ZIP dan pastikan manifest, folder kategori, flag, tag, isi, serta judul khusus terwakili.
- [ ] Coba backup saat editor berisi perubahan yang belum disimpan, termasuk setelah indikator draft lokal menyatakan tersimpan; backup harus meminta pengguna menyimpan/membatalkan dulu.
- [ ] Restore ZIP valid; pastikan preview, duplikat identik, konflik judul, dan penambahan kategori sesuai.
- [ ] Restore ZIP rusak/tidak didukung/path berbahaya; pastikan ditolak atau file tidak valid dilewati sesuai validasi.
- [ ] Simulasikan restore terputus setelah beberapa catatan tersimpan; jalankan lagi dan pastikan duplikat yang sudah berhasil dilewati.

## Batas validasi

Pemeriksaan sintaks JavaScript dan helper normalisasi dijalankan secara lokal. Kontrak frontend dicocokkan dengan file backend baca-saja yang tersedia. Checklist cloud, konflik multi-sesi, backup/restore GAS, serta pengujian browser/perangkat nyata belum dijalankan.
