# Performance & UX Test — v1.2.5

Lakukan setelah deploy New version. Gunakan salinan data uji bila memungkinkan.

## A. Pencarian
1. Ketik kata yang ada pada judul catatan. Hasil harus sesuai.
2. Cari kata yang hanya ada pada isi HTML/rich text. Hasil harus sesuai.
3. Ketik cepat beberapa karakter; UI harus tetap responsif dan hasil akhir mengikuti query terakhir.
4. Hapus query; semua catatan sesuai filter aktif harus kembali.

## B. Cache konten
1. Cari isi catatan, buka catatan, ubah isi, simpan.
2. Cari kata baru dari isi yang baru disimpan. Hasil harus langsung mencerminkan isi terbaru.
3. Pastikan tidak ada isi lama yang masih muncul sebagai hasil pencarian.

## C. Navigasi dan event delegation
1. Klik kartu pada grid dan list view; editor harus terbuka untuk catatan yang benar.
2. Klik kartu pinned; editor harus terbuka.
3. Pilih kategori, lalu pilih tag; filter harus bekerja.
4. Ubah nama kategori; catatan harus berpindah nama kategori dan tersinkron.
5. Setelah beberapa kali render, pastikan satu klik hanya menjalankan satu aksi (tidak ada handler ganda).

## D. Data dan sinkronisasi
1. Periksa jumlah catatan per kategori. Catatan arsip tidak ikut dihitung.
2. Buat, edit, pin, arsipkan, dan hapus catatan. Pastikan antrean sinkronisasi tetap bekerja.
3. Refresh browser; antrean pending tidak hilang.

## E. Uji volume
Jika tersedia, uji dengan 500–1.000 catatan. Bandingkan respons pencarian dan scroll sebelum/sesudah pembaruan. Tidak ada target waktu baku karena bergantung perangkat dan ukuran konten.

## Kriteria lulus
- Tidak ada error JavaScript di Console.
- Pencarian judul dan isi benar.
- Filter kategori/tag/pinned/archive benar.
- Klik kartu/kategori/tag tidak berlipat.
- Perubahan tetap tersimpan dan antrean tetap utuh.
