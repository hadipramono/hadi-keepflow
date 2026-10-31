# Changelog — Hadi KeepFlow v1.2.6

## Tahap 2.2 — UX & Navigation

### Navigasi responsif
- Sidebar menjadi drawer pada layar kecil, dengan backdrop untuk menutupnya.
- Tombol navigasi mendukung Escape untuk menutup drawer.
- Pada desktop, sidebar dapat disembunyikan dan ditampilkan kembali tanpa mengubah tata letak konten.
- Sidebar otomatis menutup setelah pengguna memilih kategori, label, atau tampilan navigasi pada perangkat mobile.
- Status `aria-expanded` diperbarui mengikuti kondisi navigasi.

### Konteks tampilan dan filter
- Menampilkan judul tampilan aktif dan jumlah catatan hasil filter.
- Menampilkan keterangan saat pencarian atau filter tanggal aktif.
- Tombol "Hapus filter" mengembalikan navigasi ke Semua Catatan tanpa menghapus kata pencarian atau filter tanggal.
- Tombol filter tanggal menampilkan label preset aktif dan indikator visual ketika filter tanggal digunakan.

### Status sinkronisasi
- Status sinkronisasi dipindahkan dari footer editor ke status bar aplikasi agar selalu terlihat.
- Jumlah operasi sinkronisasi tertunda ditampilkan selama antrean tidak kosong.
- Tombol retry tetap terhubung ke mekanisme retry yang sudah ada.

### Empty state
- Tampilan kosong dibedakan antara belum ada catatan dan pencarian tanpa hasil.
- Disediakan tombol untuk membuat catatan dari empty state.

### Tidak berubah
- Tidak ada perubahan pada `Code.gs`, format data catatan, LocalStorage key, atau protokol antrean sinkronisasi.
- Tidak ada migrasi data.
