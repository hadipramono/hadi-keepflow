# Editor & Content Handling Test — v1.2.7

Jalankan setelah mengganti HTML `Index` dan deploy sebagai New version.

## A. Draft autosave
1. Buka catatan yang sudah ada, ubah judul atau isi, lalu tunggu 1 detik.
2. Pastikan status berubah menjadi `Draft tersimpan di perangkat ini`.
3. Tutup tab atau reload halaman tanpa menekan Simpan.
4. Buka kembali catatan yang sama. Konfirmasi pemulihan draft harus muncul.
5. Pilih Pulihkan dan pastikan perubahan muncul kembali.
6. Ulangi dan pilih untuk membuang draft; pastikan versi catatan utama tidak berubah.

## B. Draft catatan baru
1. Buat catatan baru, isi judul dan isi, tunggu status draft tersimpan.
2. Reload halaman.
3. Klik Buat Catatan. Konfirmasi pemulihan draft baru harus muncul.
4. Simpan dan pastikan catatan masuk ke daftar serta antrean sinkronisasi.

## C. Batas draft dan sync
1. Ketik beberapa karakter tanpa menekan Simpan.
2. Pastikan tidak ada operasi baru di indikator antrean sinkronisasi.
3. Tekan Ctrl+S (Linux/Windows) atau Cmd+S (macOS).
4. Pastikan editor ditutup dan operasi save masuk antrean.

## D. Format dan keamanan HTML
1. Gunakan toolbar Bold, Italic, Underline, H1/H2, bullet dan numbered list.
2. Simpan, buka kembali, dan pastikan format tetap tampil.
3. Paste HTML berisi atribut `onclick`, elemen `<script>`, `<iframe>`, dan link `javascript:` ke editor.
4. Simpan lalu buka kembali. Script/iframe/atribut event tidak boleh tersimpan; link berbahaya tidak boleh aktif.
5. Pastikan link HTTPS tetap dapat digunakan.

## E. Tag dan batas input
1. Masukkan tag `PHP, php, Fedora, Linux`.
2. Simpan dan pastikan duplikat `PHP/php` menjadi satu tag.
3. Uji lebih dari 50 tag; hanya maksimal 50 yang disimpan.
4. Uji judul di atas 180 karakter dan isi di atas 500.000 karakter; aplikasi harus menolak penyimpanan.

## F. Regression sinkronisasi
1. Buat dan edit catatan saat online; pastikan sinkronisasi Drive berjalan.
2. Ulangi saat offline; pastikan operasi masuk antrean dan terkirim setelah online.
3. Pastikan draft yang belum disimpan tidak pernah ikut dikirim otomatis ke Drive.
4. Pastikan LocalStorage `hadi_keepflow_pending_v1` tidak dihapus.
