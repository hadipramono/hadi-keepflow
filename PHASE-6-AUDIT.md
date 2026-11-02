# Hadi KeepFlow — Phase 6 Data Integrity & Sync Reliability

Tanggal: 2026-11-03  
Source frontend: `Index.html`, `AppStyles.html`, `AppScripts.html` yang tersedia di proyek dan `/data/projects/google-apps-script/Hadi-KeepFlow`; checksum ketiganya identik.  
Source backend: `Code.gs`, `DriveStorage.gs`, `NotesApi.gs`, `SyncOperations.gs` dari `/data/projects/google-apps-script/Hadi-KeepFlow`. Salinan yang diaudit disertakan dalam paket.  

## Cakupan dan batas

Audit statis mencakup LocalStorage queue/cache, rekonsiliasi snapshot cloud, coalescing operasi, retry/acknowledgement, konflik versi, ID sementara, ScriptLock, validasi payload, kepemilikan file Drive, operasi move kategori, dan receipts idempotensi. Source `.gs` tersedia sehingga kontrak aktual dapat dicocokkan dengan client.

Pemeriksaan statis bukan pengujian langsung Google Apps Script/Drive. Kegagalan kuota PropertiesService, perilaku file ter-trash di Drive, serta interleaving nyata antar eksekusi belum diuji di deployment.

## Temuan terurut

### Critical

Tidak ada temuan Critical yang terkonfirmasi dari source yang diaudit.

### High

Tidak ada temuan High yang terkonfirmasi dari source yang diaudit.

### Medium

1. **Jendela idempotensi lebih pendek daripada masa antrean client (confirmed).** `SyncOperations.gs` mengabaikan dan menghapus receipt setelah 7 hari. Queue frontend tersimpan di LocalStorage dan tidak memiliki batas umur; setelah 10 retry otomatis, operasi tetap menunggu retry manual. Jika `saveNote` untuk ID sementara sudah membuat file tetapi callback hilang, lalu operasi yang sama baru dicoba lagi setelah receipt kedaluwarsa, server memperlakukannya sebagai create baru dan berpotensi membuat catatan duplikat. Dampak memerlukan skenario callback hilang dan retry tertunda lebih dari 7 hari, tetapi ketidakcocokan batas waktunya terlihat langsung pada source.
2. **Commit Drive dan pencatatan receipt tidak atomik (confirmed; failure impact needs runtime verification).** `saveNote` mengubah/membuat file sebelum `storeOperationReceipt`; `deleteNote` memindahkan file ke Sampah sebelum menulis receipt. Jika penulisan receipt gagal setelah perubahan Drive berhasil (misalnya exception service/kuota), client menerima kegagalan dan antrean tetap mencoba ulang. Untuk create lokal, receipt yang tidak ada dapat menyebabkan duplikasi. Untuk delete, retry dapat bertemu file yang sudah ter-trash dan gagal pada `assertFileBelongsToStorage`. Google Drive dan Script Properties tidak menyediakan transaksi atomik lintas keduanya; belum diuji apakah/kapan failure tersebut terjadi pada deployment ini.
3. **Kegagalan penyimpanan queue lokal ditangkap tetapi tidak selalu menghentikan alur (confirmed handling gap; runtime impact needs verification).** `persistLocal()` mengembalikan `queueSaved`, tetapi beberapa alur lain mengabaikan hasilnya; pada acknowledgement, operasi dihapus dari memori sebelum queue baru tersimpan. Perilaku saat LocalStorage ditolak/penuh perlu diuji untuk memastikan indikator tidak menyatakan sinkron sementara snapshot lokal gagal diperbarui.

### Low

1. **Queue dengan format invalid dibuang saat load (confirmed).** `readQueue()` hanya mempertahankan `save`/`delete` yang lolos validasi minimum. Entri rusak/versi mendatang tidak dipertahankan untuk recovery. Risiko terutama menyangkut korupsi atau perubahan format.
2. **Backoff timer tidak bertahan melewati penutupan halaman (confirmed).** Waktu retry ada pada queue, tetapi timer berada di memori. Operasi tetap tersimpan dan menunggu pembukaan halaman/koneksi berikutnya; akibat yang tampak adalah penundaan sinkronisasi.

## Kontrol yang terverifikasi pada source

- `getNotes`, `saveNote`, `deleteNote`, dan perubahan kategori menggunakan `LockService.getScriptLock()` untuk melindungi operasi yang mengubah/membaca snapshot utama.
- Save/delete untuk file Drive mewajibkan kecocokan tepat versi `baseUpdatedAt`/`expectedUpdatedAt`; konflik mengembalikan versi cloud saat ini.
- ID non-lokal pada save harus menunjuk file dalam folder storage atau kategori langsung yang diizinkan; delete menerapkan validasi kepemilikan yang sama.
- Payload memvalidasi jenis dan batas panjang judul, kategori, konten, serta tag.
- Move kategori menambah parent tujuan sebelum menghapus parent lama dan menangani status dua-parent terbatas untuk pemulihan.
- Frontend menyimpan operasi sebelum mengirimnya, menyimpan queue lebih dulu daripada cache catatan, dan menerapkan delete tertunda sebagai tombstone saat merge.
- Receipt disimpan per `opId`, operasi berjenis berbeda yang memakai key sama ditolak, dan replay save memeriksa file masih berada di storage serta versinya belum berubah.

## Pemeriksaan statis

- `node --check` untuk JavaScript inline frontend dan keempat file `.gs`: lulus.
- Pemeriksaan ID HTML: 129 ID, tanpa duplikat.
- Keseimbangan kurung kurawal CSS: seimbang.
- Pemeriksaan kesesuaian argumen client/server: frontend mengirim `saveNote(note, opId)` dan `deleteNote(id, expectedUpdatedAt, opId)` sesuai deklarasi backend.
- Inspeksi manual alur lock, version check, receipt, queue merge, retry, dan kepemilikan Drive: dilakukan.

Tidak ada pengujian live GAS/Drive atau perangkat nyata.

## Checklist runtime sebelum rilis

- [ ] Uji retry dengan `opId` sama sesudah server commit tetapi callback hilang; pastikan satu efek.
- [ ] Uji operasi queue yang tertunda lebih dari 7 hari, khususnya create ID sementara, lalu lakukan retry dan periksa duplikasi.
- [ ] Simulasikan kegagalan PropertiesService setelah `createFile`/`setContent`/`setTrashed`; periksa keadaan Drive dan kemampuan queue pulih.
- [ ] Uji dua sesi yang mengubah/menghapus versi berbeda; pastikan optimistic concurrency mengembalikan konflik dan tidak menimpa perubahan baru.
- [ ] Uji create → edit → delete saat create sedang in-flight, termasuk penggantian ID sementara.
- [ ] Uji reload/offline/reconnect di tengah load cloud dan operasi; periksa antrean, tombstone, urutan, serta hasil Drive.
- [ ] Simulasikan LocalStorage penuh/ditolak pada enqueue dan acknowledgement; verifikasi status UI serta pemulihan lokal.
- [ ] Uji file di luar storage, file multi-parent, file ter-trash, dan folder kategori ambigu pada salinan Drive uji.
- [ ] Jalankan checklist integrasi di deployment GAS uji sebelum rilis.
