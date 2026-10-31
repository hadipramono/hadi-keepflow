# Hadi KeepFlow v1.2.2 — Tahap 1.3: Backend Security & Data Integrity

## Fokus perubahan
Memastikan operasi tulis dan hapus hanya dapat menyentuh file yang benar-benar berada di dalam struktur penyimpanan KeepFlow.

## Perubahan backend (`Code.gs`)
- Menambahkan pemeriksaan kepemilikan file berdasarkan struktur parent Drive: `apps/KeepFlow/storage/<kategori>/<file>`.
- Operasi update menolak ID Drive yang tidak ditemukan, file di luar storage KeepFlow, file di Trash, dan file dengan lebih dari satu parent.
- Operasi delete menggunakan pemeriksaan kepemilikan yang sama sebelum memindahkan file ke Trash.
- Operasi save untuk ID lokal (`temp_`, `import_`) tetap membuat file baru; ID nonlokal tidak lagi diam-diam berubah menjadi operasi create ketika file tidak ditemukan.
- Pemeriksaan folder bernama sama dibuat fail-closed untuk mencegah pemilihan folder penyimpanan yang ambigu.
- Rename kategori hanya mengubah folder kategori yang berada langsung di bawah storage KeepFlow.
- Menambahkan validasi tipe dan batas ukuran payload untuk judul, kategori, isi, dan tag.
- Operasi Drive tetap menggunakan `LockService` untuk mencegah penulisan bersamaan.

## Kompatibilitas
- Format file Markdown dan metadata JSON tidak berubah.
- Struktur penyimpanan yang diharapkan tetap `My Drive/apps/KeepFlow/storage/<kategori>/<catatan>.md`.
- Frontend `Index.html` tidak berubah dari v1.2.1.

## Catatan migrasi
- File lama yang berada di luar struktur storage KeepFlow tidak akan otomatis dipindahkan atau dihapus. Jika frontend mengirim ID file seperti itu, backend akan menolak operasi.
- File dengan lebih dari satu parent Drive juga ditolak agar backend tidak memindahkan atau menghapus file yang lokasinya ambigu.
- Jika terdapat folder duplikat bernama `apps`, `KeepFlow`, `storage`, atau folder kategori pada parent yang sama, backend menolak operasi dengan pesan struktur ambigu. Periksa Drive secara manual sebelum melanjutkan.

## Batasan
- Belum ada version/ETag untuk mendeteksi edit bersamaan dari perangkat lain.
- Pemeriksaan ini membatasi operasi terhadap struktur storage KeepFlow, tetapi bukan pengganti pengaturan akses deployment Apps Script. Tetapkan akses Web App sesuai kebutuhan dan jangan menganggap ID file sebagai mekanisme autentikasi.
- Belum diuji pada deployment Apps Script dan Drive pengguna; lakukan checklist manual setelah deploy.
