# Hadi KeepFlow v1.2.6 — UX & Navigation Test

Lakukan pengujian setelah mengganti HTML `Index` dan deploy New version.

## A. Desktop navigation
1. Buka aplikasi pada lebar layar desktop.
2. Pastikan sidebar terlihat secara default.
3. Klik tombol menu; sidebar harus tersembunyi dan area catatan melebar.
4. Klik tombol menu kembali; sidebar harus muncul.
5. Pastikan pilihan Semua Catatan, Disematkan, Arsip, kategori, dan label tetap bekerja.

## B. Mobile navigation
1. Buka aplikasi pada lebar layar ponsel atau responsive mode browser (di bawah 1024 px).
2. Pastikan sidebar tertutup pada awalnya.
3. Klik tombol menu; sidebar muncul sebagai drawer dan backdrop terlihat.
4. Klik backdrop atau tekan Escape; drawer harus tertutup.
5. Buka drawer lalu pilih kategori atau label; drawer harus tertutup dan tampilan catatan berubah.
6. Pilih Semua Catatan, Disematkan, dan Arsip; pastikan navigasi bekerja.
7. Ubah orientasi/ukuran layar antara mobile dan desktop; pastikan sidebar tidak tertinggal dalam keadaan overlay.

## C. Active view and filters
1. Pilih kategori; judul tampilan harus berubah menjadi nama kategori dan jumlah catatan tampil.
2. Pilih label; judul menampilkan nama label.
3. Klik Hapus filter; navigasi kembali ke Semua Catatan.
4. Pastikan kata pencarian dan filter tanggal tetap dipertahankan saat Hapus filter digunakan.
5. Aktifkan filter tanggal; label tombol harus berubah dan indikator aktif terlihat.
6. Reset filter tanggal; label kembali ke Semua Tanggal dan indikator hilang.

## D. Empty state
1. Cari kata yang tidak ada dalam catatan.
2. Pastikan pesan "Tidak ada hasil pencarian" tampil.
3. Hapus kata pencarian; daftar catatan kembali.
4. Pilih kategori tanpa catatan (jika tersedia); pastikan empty state tampak.
5. Klik Buat catatan; editor terbuka.

## E. Persistent sync status
1. Tutup editor dan kembali ke daftar catatan.
2. Pastikan status sinkronisasi tetap terlihat di bawah header.
3. Buat perubahan saat offline.
4. Pastikan jumlah operasi tertunda terlihat.
5. Sambungkan kembali jaringan; status dan jumlah antrean harus diperbarui mengikuti proses sinkronisasi.
6. Jika retry manual diperlukan, tombol Coba lagi harus tetap berfungsi.

## F. Regression and data safety
1. Buat, edit, pin, arsipkan, dan hapus satu catatan uji.
2. Pastikan perubahan tetap tersimpan di LocalStorage dan antrean.
3. Pastikan tidak ada perubahan pada struktur folder Drive.
4. Pastikan tidak ada operasi yang hilang dari antrean ketika berpindah tampilan.

## Expected result
Semua bagian navigasi, filter, empty state, dan status dapat digunakan di desktop serta mobile. Data, queue key `hadi_keepflow_pending_v1`, dan mekanisme sinkronisasi tetap berfungsi seperti versi sebelumnya.
