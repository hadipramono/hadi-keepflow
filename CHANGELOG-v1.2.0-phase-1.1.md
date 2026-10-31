# Hadi KeepFlow v1.2.0 — Tahap 1.1: Sync Queue

## Fokus perubahan
Perbaikan antrean sinkronisasi frontend tanpa mengubah format Markdown di Google Drive atau struktur backend.

## Perubahan
- Queue operation mendapat `opId` unik dan dapat memigrasikan format antrean v1 yang lama.
- Payload save menjadi snapshot per operasi dan tidak ditimpa respons operasi sebelumnya.
- Coalescing hanya menggabungkan operasi yang belum dikirim; operasi in-flight dilindungi.
- Pengakuan operasi menggunakan `opId`, bukan `shift()` tanpa identitas.
- Temporary ID diganti hanya pada field identitas; isi catatan lokal yang lebih baru tetap dipertahankan.
- Perubahan yang terjadi sebelum respons awal `getNotes()` selesai tetap dimasukkan ke antrean.
- Pengiriman antrean menunggu `serverReady` agar tidak berlomba dengan proses pemuatan awal.
- Queue disimpan ke LocalStorage sebelum dikirim ke backend.
- Kegagalan operasi mempertahankan antrean dan menambah counter `attempts`.
- Respons save tanpa `note.id` yang valid tidak dianggap berhasil dan tidak menghapus operasi dari antrean.
- Event `online` memuat baseline cloud jika belum siap, lalu memproses antrean.

## Batasan tahap ini
- Belum ada exponential backoff otomatis.
- Belum ada resolusi konflik multi-tab.
- Belum ada validasi kepemilikan file di backend; itu masuk Tahap 1.3.
- Jika pemuatan awal cloud gagal, antrean tetap tersimpan tetapi menunggu reload/reconnect untuk dicoba kembali.
- Belum diuji terhadap deployment dan Google Drive pengguna secara langsung.
