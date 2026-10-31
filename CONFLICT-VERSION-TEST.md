# Conflict Detection & Version Control — Test Guide

Lakukan pengujian dengan dua browser/perangkat (A dan B) yang membuka Web App KeepFlow yang sama.

## Persiapan
1. Backup JSON dari aplikasi.
2. Deploy `Code.gs` dan `Index.html` dari v1.2.3 sebagai New version.
3. Buka aplikasi di dua browser dan tunggu status tersinkron.
4. Pilih satu catatan uji yang sama pada kedua browser.

## Skenario

### 1. Edit normal
1. Di browser A, ubah isi catatan dan simpan.
2. Pastikan status kembali tersinkron.
3. Refresh browser B.
4. Pastikan perubahan A tampil.

**Hasil:** save normal berhasil dan baseline versi baru diterima klien.

### 2. Dua perangkat mengedit versi yang sama
1. Buka catatan yang sama di A dan B sebelum salah satunya menyimpan.
2. Di A, ubah isi lalu simpan.
3. Di B, ubah isi dari salinan lama lalu simpan.
4. B seharusnya menampilkan dialog konflik.
5. Pilih Cancel untuk menggunakan versi cloud.

**Hasil:** isi dari A tetap ada; perubahan B yang tertunda dibuang.

### 3. Pilih pertahankan versi lokal
1. Ulangi skenario 2.
2. Saat dialog konflik muncul di B, pilih OK.
3. Tunggu sinkronisasi selesai, lalu refresh A.

**Hasil:** versi lokal B dikirim setelah baseline diperbarui secara eksplisit. Cloud berisi versi B.

### 4. Delete vs edit
1. Buka catatan yang sama di A dan B.
2. Edit dan simpan di A.
3. Hapus catatan dari tampilan lama di B.
4. Jika delete memakai versi lama, backend harus mengembalikan konflik.
5. Pilih Cancel untuk menggunakan versi cloud.

**Hasil:** catatan yang sudah diperbarui A tidak terhapus.

### 5. Catatan cloud dihapus di luar aplikasi
1. Buka catatan di aplikasi.
2. Hapus file Markdown terkait secara manual dari Drive (hanya pada catatan uji).
3. Ubah catatan lokal dan simpan.
4. Saat konflik terdeteksi, pilih OK untuk membuat salinan baru.

**Hasil:** KeepFlow membuat file baru dengan ID baru, bukan mencoba menulis ke ID yang hilang.

### 6. Antrean lama tanpa versi dasar
Jika LocalStorage masih memiliki operasi save/delete lama tanpa `baseUpdatedAt`/`expectedUpdatedAt`, backend harus meminta keputusan konflik. Pilih versi cloud atau pertahankan lokal sesuai kebutuhan.

## Pemeriksaan tambahan
- Periksa Console browser untuk error JavaScript.
- Periksa Apps Script > Executions untuk error backend.
- Pastikan tidak ada duplikasi catatan setelah operasi save dari catatan `temp_`.
- Pastikan operasi antrean tetap tersimpan jika koneksi terputus.

## Rollback
Pulihkan `Index.html` dan `Code.gs` dari backup versi sebelumnya, lalu deploy sebagai New version. Jangan menghapus folder atau file Drive untuk rollback.
