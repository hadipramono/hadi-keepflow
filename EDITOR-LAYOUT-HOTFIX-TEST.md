# Editor Layout Hotfix Test

## Tujuan
Memastikan konten editor panjang tidak menimpa penghitung kata/karakter/tugas maupun kolom tag, serta seluruh isi editor dapat diakses melalui scroll.

## Skenario
1. Buka catatan pendek dan pastikan area editor memiliki tinggi minimum yang nyaman.
2. Buka catatan panjang dengan beberapa heading, paragraf, daftar, dan checklist.
3. Scroll di area editor hingga bagian paling bawah.
4. Pastikan metrics tampil setelah konten, tidak menimpa baris terakhir.
5. Pastikan kolom tag tampil setelah metrics dan dapat diakses.
6. Tambahkan teks baru sampai konten melebihi tinggi viewport; pastikan scroll tetap berjalan.
7. Ulangi pada viewport desktop dan mobile.
8. Simpan, tutup, buka kembali catatan, dan pastikan isi tetap utuh.

## Expected result
- Modal body menjadi satu area scroll vertikal.
- Editable content bertambah tinggi mengikuti isi.
- Metrics dan tag row berada setelah konten, tidak overlap.
- Tidak ada konten yang terpotong atau hilang setelah save/reopen.

## Status
Source hotfix diterapkan. Browser/Apps Script live test masih harus dilakukan pada test deployment.
