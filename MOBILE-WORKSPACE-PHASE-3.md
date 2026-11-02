# Hadi KeepFlow v1.3.6-dev — Mobile Workspace Phase 3

## Cakupan

Paket melanjutkan file frontend Phase 2. `Index.html` berasal dari entry `Index(1).html` dan tetap memakai include Google Apps Script yang sama.

Perubahan UI/aksesibilitas:

- Sortir dan aksi pilih punya susunan yang lebih mudah dipakai pada layar sempit; kontrol aksi massal punya target sentuh lebih besar dan membungkus rapi.
- Kartu catatan dalam tampilan daftar membungkus metadata/tag pada layar kecil agar tidak memaksa scroll horizontal.
- Kartu catatan bisa dibuka melalui keyboard saat mode pilih tidak aktif; tombol kategori sekarang berupa tombol semantik.
- Pemicu catatan baru di workspace menjadi tombol yang dapat dijangkau keyboard.
- Pengelola template menyesuaikan tinggi viewport/safe area, menjaga bagian isi tetap bisa digulir, membatasi Tab di dalam dialog, menutup dengan Escape, dan mengembalikan fokus ke pemanggil.
- Hasil Phase 2 tetap disertakan: drawer mobile, scroll lock, dan kontrol desktop.

Tidak ada perubahan pada data catatan, sinkronisasi, CRUD, backend/API GAS, atau penyimpanan Drive.

## Checklist uji manual

### Mobile — 320×568, 360×800, 390×844

- [ ] Dashboard: empat kartu statistik tampil dua kolom dan label tidak terpotong.
- [ ] Catatan terbaru dan kategori pada dashboard dapat dibuka dengan sentuhan.
- [ ] Grid catatan satu kolom tetap terbaca dan tag panjang membungkus.
- [ ] Tampilan daftar tidak melebar ke samping; kategori, judul, tag, tanggal, dan pin tetap terlihat.
- [ ] Tombol sortir, pilih, filter bersih, dan semua aksi massal mudah disentuh.
- [ ] Mode pilih: centang satu/beberapa kartu, pilih yang terlihat, batal pilih, lalu pindah kategori/tambah-hapus tag/pin/arsip.
- [ ] Tombol kategori dan tag dapat dipilih; tombol ubah/hapus kategori tetap terpisah dari pemilihan kategori.
- [ ] Pengelola template: isi dapat digulir, tombol footer dapat dicapai saat keyboard virtual muncul, Tab/Shift+Tab tetap di dialog, Escape menutup, dan fokus kembali ke tombol Kelola.
- [ ] Uji safe area serta orientasi landscape pada pengelola template.

### Desktop

- [ ] Grid tetap memakai beberapa kolom dan tampilan daftar tetap satu baris seperti sebelumnya.
- [ ] Kartu dapat dibuka dengan klik dan dengan Enter/Space ketika mendapat fokus.
- [ ] Sortir, pilih massal, kategori/tag, dashboard, dan pengelola template tetap berfungsi.
- [ ] Navigasi desktop dari Phase 2 masih bisa disembunyikan dan ditampilkan.

## Validasi dan batas

Pemeriksaan sintaks JavaScript, struktur referensi ID/ARIA, keseimbangan blok CSS, dan integritas ZIP dilakukan secara lokal. Tidak ada klaim uji live GAS/Drive atau uji perangkat/browser nyata; checklist di atas masih perlu dijalankan pada perangkat sasaran.
