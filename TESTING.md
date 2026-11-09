# Checklist verifikasi manual

Jalankan pada deployment Apps Script **terpisah** dengan folder Drive uji dan data sintetis. Centang hanya setelah benar-benar dijalankan. Setiap item belum diverifikasi pada perangkat nyata sampai dicentang di sini atau di catatan rilis.

## 0. Tes otomatis
- [ ] `node --test tests/*.test.js` lulus (sintaks, kontrak klien-server, format v2, logika backend dengan tiruan Drive). Tes ini memakai tiruan Drive, **bukan** Drive nyata.
- [ ] Script inline pada `AppScripts.html` dimuat tanpa error di konsol browser.

## 1. Deploy
- [ ] Deployment dibuat dengan **New version** setelah source terbaru disalin.
- [ ] URL `/exec` terbuka tanpa error dan menampilkan label versi yang benar (v1.3.8).
- [ ] Folder `My Drive/apps/KeepFlow/storage/` terbentuk setelah catatan pertama disimpan.

## 2. Editor mobile dan keyboard virtual
Uji pada URL `/exec`, orientasi portrait dan landscape.

**Android Chrome + Gboard**
- [ ] Ketuk area isi catatan: dock (tiga tombol: Format, Template, Kategori) muncul **tepat di atas keyboard**, tidak tertutup, tanpa scroll horizontal.
- [ ] Menutup keyboard: dock turun ke dasar layar dan tidak melayang.
- [ ] Buka panel Format, lalu Template, lalu Kategori: dock tetap di atas keyboard dan tidak melebihi 60% layar.
- [ ] Catatan panjang: kursor di baris terakhir tetap terlihat di atas dock saat mengetik.
- [ ] Rotasi layar saat keyboard terbuka: posisi dock tetap benar.
- [ ] Fokus ke Judul atau Tag menyembunyikan dock; kembali ke isi menampilkannya lagi.
- [ ] Panel Format memuat tombol checklist dan tautan; keduanya berfungsi (checklist menyisipkan item, tautan membuka dialog URL).

**iOS Safari**
- [ ] Ulangi seluruh butir Android di atas. Catat hasilnya; `interactive-widget` tidak didukung Safari sehingga posisi bergantung pada `visualViewport`.

**Desktop**
- [ ] Toolbar pemformatan tetap berada di atas area tulis dan tidak berubah.

## 2b. Format penyimpanan v2 (Drive nyata)
- [ ] Catatan baru menghasilkan file `.md` berawalan `---` + `keepflow: 2` (buka file di Drive untuk memeriksa).
- [ ] Judul dengan `:` atau `?` tampil utuh di aplikasi walau nama file memakai `-`.
- [ ] Dua catatan berjudul sama: nama file memakai ` (1)` tetapi judul tampilan tidak berubah.
- [ ] File lama berformat `---JSON---` terbuka dengan isi, tag, pin, dan tanggal yang benar, dan berubah ke v2 setelah disimpan.
- [ ] Restore ZIP berisi konten berbahaya (`<img onerror>`, `<script>`) tidak menjalankan skrip dan konten dibersihkan.

## 2c. Indeks catatan dan kecepatan (Apps Script nyata)
- [ ] Jalankan `benchmarkNotesRead` dari editor Apps Script; catat `fullReadMs` versus `indexedReadMs` dan `indexedReadFileReads` (harus 0).
- [ ] Setelah memuat aplikasi sekali, file `.keepflow-index.json` ada di `My Drive/apps/KeepFlow/storage/` dan **tidak** muncul sebagai catatan.
- [ ] Muat ulang aplikasi: log eksekusi (`KeepFlow getNotes: ...`) menunjukkan `reads` mendekati 0.
- [ ] Ubah satu catatan di aplikasi, lalu muat ulang: hanya `reads: 1`.
- [ ] Edit isi satu file `.md` langsung di Drive lalu muat ulang: perubahan itu tampil (tidak basi).
- [ ] Hapus `.keepflow-index.json` di Drive lalu muat ulang: catatan tetap lengkap dan indeks dibuat lagi.
- [ ] Backup ZIP berisi semua catatan dan tidak mengubah file indeks.
- [ ] (Vault besar, ratusan catatan) Muat pertama setelah indeks dihapus selesai tanpa error batas waktu; bila terputus, muat ulang melanjutkan lebih cepat.

## 2d. Protokol delta (Apps Script nyata)
- [ ] Muat aplikasi dua kali berturut-turut: log eksekusi `KeepFlow getNotesDelta: ...` pada muat kedua menunjukkan `unchanged` mendekati jumlah catatan dan `sent` mendekati 0.
- [ ] Ubah satu catatan di tab/perangkat lain, muat ulang di tab pertama: hanya catatan itu yang `sent` dan isinya terbaru.
- [ ] Hapus satu catatan di perangkat lain lalu muat ulang: catatan itu hilang dari daftar.
- [ ] Pindahkan catatan ke kategori lain (juga lewat Drive langsung): kategori di daftar ikut berubah.
- [ ] Edit catatan saat offline, lalu online: perubahan lokal tidak tertimpa dan tersinkron.
- [ ] Mengetik/menyimpan catatan sementara pemuatan ulang berjalan: edit tidak hilang.
- [ ] Deploy hanya frontend baru dengan backend lama (tanpa `getNotesDelta`): aplikasi tetap memuat data lewat fallback penuh tanpa error yang terlihat.

## 2e. Cache lokal IndexedDB (perangkat nyata, di dalam Apps Script)
Buka DevTools > Application > IndexedDB > `hadi_keepflow` (desktop), atau uji perilaku di perangkat.

- [ ] Dari versi lama yang sudah punya cache: setelah update catatan tetap tampil (offline pun) dan database `hadi_keepflow` berisi satu record per catatan; kunci `hadi_keepflow_offline_notes_v1` di localStorage sudah hilang.
- [ ] Matikan jaringan, ubah catatan, tutup tab, buka lagi (masih offline): perubahan tidak hilang (antrean + cache).
- [ ] Dengan banyak catatan besar (total >5 MB, mis. impor ZIP besar): tidak muncul "Data terlalu besar untuk disimpan lokal" dan data kembali setelah muat ulang.
- [ ] iOS Safari dan Android Chrome di dalam halaman `/exec` (iframe): cache tersimpan (periksa bahwa status tidak menampilkan "Gagal memperbarui cache lokal").
- [ ] Mode privat/penyimpanan dibatasi: aplikasi tetap berfungsi (fallback localStorage atau tanpa cache).
- [ ] Hapus data situs lalu buka lagi: semua catatan kembali dari Drive.
- [ ] Dua tab terbuka: ubah di tab A, muat ulang tab B; pastikan tidak ada data hilang setelah sinkronisasi (sinkronisasi antar-tab belum ada, lihat ROADMAP).

## 3. Catatan dan kategori
- [ ] Buat, ubah, pin, arsip, dan hapus catatan; file di Drive ikut berubah.
- [ ] Buat, ubah nama, dan hapus kategori kosong.
- [ ] Menghapus kategori yang berisi catatan ditolak dan tidak ada catatan yang berpindah.
- [ ] Kategori `Umum` tidak dapat dihapus.
- [ ] Catatan tanpa kategori muncul di Inbox setelah reload.

## 4. Backup dan restore
- [ ] Backup ZIP berhasil dibuat dan berisi seluruh catatan.
- [ ] Restore/import menampilkan pratinjau dan mendeteksi duplikat.

## 5. Offline dan sinkronisasi
- [ ] Edit saat offline masuk antrean dan terkirim setelah online.
- [ ] Dua sesi mengedit catatan yang sama memunculkan penanganan konflik, bukan menimpa diam-diam.
- [ ] Draft lokal yang belum disimpan dapat dipulihkan setelah tab ditutup.

## 5b. Dialog internal (menggantikan confirm/prompt)
- [ ] Hapus kategori kosong: dialog internal tampil; Batal tidak menghapus kategori; konfirmasi menghapus kategori.
- [ ] Ubah nama dan buat kategori: input dialog menerima teks, membatasi panjang, dan membatalkan tanpa perubahan.
- [ ] Tambah tautan: dialog URL menerima `https://`, `http://`, dan `mailto:`; URL tidak valid ditolak.
- [ ] Tambah/hapus tag massal: input koma bekerja; Batal tidak mengubah catatan.
- [ ] Terapkan template pada catatan berisi: Batal mempertahankan isi; konfirmasi mengganti isi.
- [ ] Hapus/reset template: dialog menampilkan tindakan yang tepat; Batal tidak mengubah template.
- [ ] Restore ZIP: ringkasan preview terbaca; Batal menghentikan restore sebelum penulisan.
- [ ] Pulihkan draft: pilihan Pulihkan mengisi editor; Buang menghapus draft.
- [ ] Konflik sinkronisasi: pilihan lokal/cloud diproses sebelum antrean sinkronisasi berjalan kembali.
- [ ] Tutup editor dengan perubahan belum disimpan: Batal tetap di editor; Buang perubahan menutup editor.
- [ ] Hapus catatan: Batal mempertahankan catatan; konfirmasi menjalankan penghapusan.
- [ ] Keyboard: Tab/Shift+Tab tetap di dialog, Enter mengonfirmasi, Escape membatalkan, dan fokus kembali ke pemicu.
- [ ] Uji tema terang/gelap, viewport desktop/mobile, serta screen reader.

## 6. Aksesibilitas
- [ ] Tab dan Shift+Tab tetap berada di dalam editor modal.
- [ ] Escape menutup menu tindakan lebih dulu, lalu alur tutup editor.
- [ ] Fokus kembali ke elemen pembuka setelah editor ditutup.
- [ ] Screen reader membacakan dialog editor dan tombol-tombol dock dengan nama yang benar.

## 7. Keamanan deployment
- [ ] Deployment diatur **Execute as: Me** dan **Only myself**.
- [ ] Tidak ada catatan pribadi, backup, atau identifier Drive yang ikut ter-commit.
