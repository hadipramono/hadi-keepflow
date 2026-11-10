# Changelog

## Optimasi frontend — Tahap 1 sampai 3A (belum menjadi rilis versi baru)

### Tahap 1 — Preview, cache, dan editor metrics
- Preview Grid/List dibatasi masing-masing 400/200 karakter dengan konteks pencarian.
- Cache preview berbasis `Map`, divalidasi dengan identitas catatan, versi/panjang konten, dan metadata lowercase.
- Editor metrics memakai debounce 250 ms dan menampilkan teks melalui `textContent`.
- Verifikasi: sintaks, 5 assertion preview, dan 11/11 pemeriksaan statis lulus. Profiling browser dan uji visual mobile belum dilakukan.

### Tahap 2.4 — Bounded rendering
- Daftar catatan dirender dalam batch 60 kartu dengan tombol **Muat lebih banyak** untuk batch berikutnya.
- Pagination direset saat kriteria/urutan hasil filter berubah.
- Total hasil dan bulk selection tetap mencakup seluruh hasil filter, termasuk kartu yang belum dirender.

### Tahap 2.5 — Sidebar separation
- Memisahkan pembaruan sidebar dari render daftar utama.
- Sidebar hanya dibangun ulang saat data notes/categories atau pilihan kategori/tag berubah.
- Search keystrokes dan pagination tidak lagi membangun ulang sidebar.

### Tahap 2.6 — Sync comparison
- `syncToBackend()` memakai reference-first comparison; JSON comparison hanya dilakukan bila referensi array notes berubah.
- Snapshot `lastObservedNotes` dibuat secara shallow.
- Jalur mutasi note diperiksa untuk memastikan pendekatan berbasis referensi tidak melewatkan perubahan.

### Tahap 3A — JSZip lazy load
- JSZip 3.10.1 tidak lagi dimuat saat halaman pertama kali dibuka.
- Library dimuat hanya ketika Backup ZIP atau Restore/Import ZIP digunakan.
- Loader memakai Promise bersama untuk mencegah pemuatan ganda dan memungkinkan retry setelah gagal.
- Format ZIP, validasi, dan alur backup/restore dipertahankan.

### Verifikasi dan batasan
- Tahap 2: pemeriksaan statis 10/10 lulus; browser runtime, timing render, dan sinkronisasi dua tab belum diuji.
- Tahap 3A: pemeriksaan sintaks JavaScript inline lulus; browser/network testing dan pengukuran waktu muat belum dilakukan.
- Tahap 3B Tailwind CLI **ditunda**. Tailwind CDN tetap digunakan karena dependency npm tidak berhasil diakses dan CSS hasil build/visual regression belum diverifikasi.
- Perubahan ini tidak menaikkan versi aplikasi; baseline versi tetap v1.3.8 sampai keputusan rilis terpisah.


## Perbaikan berikutnya — List View text overlap (belum dirilis)

### UI/UX
- Memisahkan elemen judul dan preview catatan dengan kelas layout khusus.
- Membatasi lebar judul dan menerapkan ellipsis agar judul panjang tidak menimpa preview.
- Preview menggunakan sisa ruang yang tersedia dan dipotong dengan ellipsis.
- Pada layar sempit, preview berpindah ke baris berikutnya agar metadata dan judul tetap terbaca.
- Tidak mengubah isi, format, maupun mekanisme penyimpanan catatan.

### Verifikasi
- Menambahkan empat pemeriksaan kontrak layout List View.
- Pengujian visual browser pada berbagai ukuran viewport masih perlu dilakukan.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/). Semua rilis di bawah ini masih berstatus **kandidat** sampai checklist [`TESTING.md`](TESTING.md) selesai dijalankan pada perangkat nyata.

## Perubahan berikutnya — Sinkronisasi antar-tab (belum dirilis)

### Sinkronisasi dan reliabilitas
- Menambahkan BroadcastChannel dengan fallback `storage` event untuk memberi tahu tab lain tentang perubahan catatan, antrean, dan kategori.
- Pesan hanya membawa metadata invalidation; isi catatan tidak dikirim melalui channel.
- Tab penerima membaca ulang antrean bersama dan merekonsiliasi data melalui alur cloud/Delta Loading yang sudah ada.
- Refresh ditunda selama editor terbuka agar input aktif tidak ditimpa; refresh dijalankan setelah editor ditutup.
- Menambahkan sync lease berbasis LocalStorage dengan heartbeat dan kedaluwarsa untuk mengurangi pengiriman operasi antrean ganda.
- Menambahkan lima pemeriksaan kontrak statis untuk transport, privasi pesan, perlindungan editor, lease, dan pencegahan rebroadcast.

### Batasan verifikasi
- Test kontrak tidak menggantikan pengujian dua tab browser nyata.
- LocalStorage lease adalah koordinasi best-effort, bukan mutex lintas-tab yang dijamin atomik pada semua kondisi.
- Pengujian konflik dua tab, tab crash, fallback browser, dan integrasi Google Drive harus dilakukan melalui checklist `TESTING.md`.

## Perubahan berikutnya — Dialog internal (belum dirilis)

### UI/UX dan aksesibilitas
- Mengganti seluruh 10 `confirm()` dan 5 `prompt()` native dengan dialog internal KeepFlow.
- Dialog mendukung konfirmasi dan input teks, label tombol kontekstual, tema terang/gelap, layout mobile, tombol Escape, pembatalan backdrop, focus trap, serta pengembalian fokus.
- Permintaan dialog diserialisasi agar dialog yang muncul bersamaan tidak saling menimpa.
- Alur konflik sinkronisasi menunggu pilihan pengguna sebelum antrean operasi dilanjutkan.
- Menambahkan empat pemeriksaan kontrak statis untuk memastikan tidak ada pemanggilan native dan struktur dialog tetap tersedia.

### Verifikasi
- Pemeriksaan sintaks JavaScript frontend: lulus.
- 4 tes dialog baru: lulus.
- Seluruh tes selain `notes-cache.test.js`: 76/76 lulus.
- `npm test` penuh belum lulus di lingkungan ini karena `fake-indexeddb` tidak tersedia dan `npm ci` tidak selesai sebelum batas waktu. Jalankan kembali di CI dengan `npm ci`.
- Pengujian interaksi visual, keyboard, screen reader, dan perangkat mobile nyata belum dilakukan.

## v1.3.8 — 2026-11-08 (kandidat)

### Keamanan
- **XSS pada pratinjau/pencarian ditutup.** `getPlainText` kini memakai `DOMParser` (dokumen inert) alih-alih `innerHTML`; sebelumnya `<img onerror>` di konten catatan tetap dijalankan walau elemennya tidak terpasang.
- Konten dari restore ZIP kini disanitasi sebelum disimpan ke Drive; teks polos/Markdown dibungkus paragraf dan di-escape.
- `include()` hanya mengizinkan partial `AppStyles` dan `AppScripts`.
- Fungsi legacy `saveNotes` dan `deleteNoteFromFile` dihapus (tidak dipakai frontend).

### Format dan penyimpanan
- **Format file catatan v2:** front matter YAML standar (`keepflow`, `title`, `created`, `pinned`, `archived`, `tags`, `content_type`) menggantikan blok `---JSON---`. File lama tetap terbaca dan ditingkatkan saat disimpan berikutnya; tidak ada migrasi massal. Detail di [`AUDIT.md`](AUDIT.md) dan `NoteFormat.gs`.
- Judul asli disimpan di front matter: karakter seperti `:` atau `?` dan suffix ` (1)` pada nama file tidak lagi mengubah judul tampilan.
- Backup ZIP memakai skema 2 (membaca skema 1 dan 2). `createdAt` divalidasi; karakter kontrol pada judul dibuang.
- Receipt idempotensi bersifat best-effort dan tahan kuota `PropertiesService` (sebelumnya restore ZIP besar dapat menyebabkan catatan ganda); pruning dibatasi maksimal sekali per jam.
- `getNotes` dan `getBackupSnapshot` memakai satu pembaca (`collectAllNotes_`).

### Performa
- **Indeks catatan** (`NotesIndex.gs`): `getNotes` tidak lagi mengunduh isi setiap file pada setiap pemuatan. Satu file `storage/.keepflow-index.json` menyimpan hasil parse; catatan yang ID, waktu ubah, dan namanya masih sama diambil dari sana. Indeks hanya cache: bila hilang, rusak, terlalu besar, atau gagal ditulis, aplikasi membaca langsung dari file. Backup tidak memakai indeks. Pembacaan dingin yang sangat besar menulis checkpoint agar tahan batas eksekusi 6 menit.
- **Protokol delta** (`getNotesDelta`): pemuatan ulang tidak lagi mengirim ulang isi semua catatan. Klien melaporkan catatan bersih yang dimilikinya (`[versi, kategori, judul, panjang isi]`); server membalas stub untuk yang tidak berubah dan catatan penuh hanya untuk yang berubah/baru. Hasil rakitan klien identik dengan `getNotes()`; respons tak valid atau kegagalan memicu satu fallback ke `getNotes()` penuh. Edit lokal yang antre tidak pernah tertimpa.
- Alat pemilik `benchmarkNotesRead` (jalankan dari editor Apps Script) membandingkan pembacaan langsung dan lewat indeks pada data Anda; `getNotes` juga mencatat statistik hit/baca ke log eksekusi.
- Pemuatan pertama setelah memperbarui akan lebih lambat satu kali karena indeks dibangun.

### Penyimpanan lokal
- **Cache catatan pindah dari `localStorage` ke IndexedDB** (`NotesCache`): satu record per catatan, hanya yang berubah yang ditulis, urutan terjaga, tanpa batas ±5 MB. Sebelumnya, pada ±8 MB data penyimpanan gagal dan setelah muat ulang tidak ada catatan tersisa.
- Migrasi otomatis dalam satu transaksi dengan verifikasi jumlah; salinan lama dihapus hanya setelah terverifikasi. Bila IndexedDB tidak tersedia, gagal, atau tidak merespons, aplikasi kembali ke `localStorage`.
- Antrean operasi dan draf editor **tetap** di `localStorage` dan ditulis sinkron (jaminan durabilitas tidak berubah). Catatan yang hanya ada di antrean dipulihkan saat startup.
- Perbaikan: promise transaksi yang ditolak setelah pengecualian sinkron tidak lagi memicu `unhandledRejection`.
- Pemuatan ulang memakai catatan di memori (selalu tersimpan) alih-alih membaca ulang penyimpanan.

### UI/UX dan aksesibilitas
- Pratinjau dan pencarian memisahkan paragraf/item checklist dengan benar (☐/☑); sebelumnya kata antar-blok menyatu.
- Notifikasi non-blokir (toast) menggantikan 27 `alert()`.
- Hasil axe-core: 0 pelanggaran pada daftar catatan dan editor (desktop/mobile, terang/gelap); sebelumnya 3-5 jenis. Perbaikan: kontras teks abu-abu di tema terang, ARIA kolom cari, nama tombol Inbox, label checkbox checklist, role loader.

### Rekayasa
- Tes otomatis tanpa dependensi (`npm test`, 93 tes; dependensi dev: `fake-indexeddb`): sintaks, kontrak klien-server, format v2 (uji silang klien/server termasuk uji acak), logika backend, dan indeks catatan dengan tiruan Drive.
- `appsscript.json` (V8, scope `drive` saja, web app "Only myself") dan workflow GitHub Actions.

### Diperbaiki
- **Dock editor mobile tertutup keyboard virtual di Android.** Penyebab yang paling mungkin (disimpulkan dari perilaku platform; belum dikonfirmasi di perangkat nyata): Apps Script merender `Index.html` di dalam iframe sandbox, dan browser hanya membaca meta viewport dari halaman luar (yang dipasang lewat `addMetaTag` di `Code.gs`). Tanpa `interactive-widget`, Chrome Android (108+) membiarkan keyboard menimpa halaman tanpa memberi tahu iframe. Meta viewport kini `width=device-width, initial-scale=1, interactive-widget=resizes-content`, sehingga iframe ikut mengecil saat keyboard muncul.
- Dock editor mobile kini berupa elemen *in-flow* di dasar modal (bukan `absolute`/`fixed`). Area tulis berakhir tepat di atas dock tanpa tumpang tindih dan tanpa kompensasi padding.
- Sinkronisasi ukuran editor memakai nilai terkecil antara `window.innerHeight` dan `visualViewport.height`, mengikuti `visualViewport.offsetTop`, dan digabung per frame (`requestAnimationFrame`) agar aman untuk mode keyboard *resize* maupun *overlay*.
- Kursor otomatis digulir ke area yang terlihat saat keyboard terbuka sehingga tidak tertutup dock.
- Tinggi maksimum panel dock (Format/Template/Kategori) dibatasi 60% layar.
- Aturan CSS duplikat pada `#editor-metrics, #modal-tags-input` dibersihkan.

### Dihapus
- Diagnostik sementara `?kfdiag=1` (panel diagnostik, flag `window.KEEPFLOW_DIAGNOSTICS`, dan variabel template `keepFlowDiagnostics`).
- `VERSION.txt` (usang dan duplikat; versi kini hanya ditulis di `CHANGELOG.md`, `README.md`, dan source).

### Diubah
- Dock editor mobile disederhanakan menjadi tiga aksi: **Format**, **Template**, dan **Kategori**. Tombol cepat Checklist dan Tautan dihapus dari dock; keduanya tetap tersedia di panel Format (tautan juga lewat Ctrl+K). Ketiga tombol kini berbagi lebar baris secara rata sehingga tidak ada lagi scroll horizontal pada dock.
- Label versi pada UI, metadata backup (`applicationVersion`), dan header source diselaraskan ke **1.3.8**.
- Dokumentasi dirapikan: `TESTING.md` ditambahkan (sebelumnya dirujuk tetapi tidak ada), `.gitignore` ditambahkan, dan `INSTALL.md` kini menjelaskan cara memperbarui deployment.

### Riwayat tahap R2.1 (digabung ke rilis ini)
- **R2.1** — Format, Template, dan Kategori digabung dalam satu *contextual editor dock* di mobile; kontrol desktop tetap di baris metadata editor; navigasi kembali dari panel Template/Kategori ke toolbar utama; pemilih template, Kelola Template, dan pemilih kategori dipertahankan tanpa menggandakan ID atau handler.
- **R2.1.1** — Percobaan dock `fixed` dengan perhitungan *keyboard inset*. Digantikan oleh R2.1.2 dan perbaikan di atas.
- **R2.1.2** — Dock di-*anchor* ke modal dan ukuran editor mengikuti `visualViewport`. Posisi sudah benar bila browser melaporkan keyboard, tetapi masalah di Apps Script tetap dilaporkan; dilengkapi oleh perbaikan viewport di atas.

## v1.3.7 — Kandidat stabilisasi (R1 + R2)

### R1 — Stabilisasi editor dan kategori
- Aturan `hidden` pada editor modal diperbaiki sehingga modal benar-benar tersembunyi saat ditutup.
- Kategori `Umum` dilindungi dari penghapusan.
- Penghapusan kategori ditolak jika masih ada file catatan atau subfolder; tidak ada catatan yang dipindahkan atau dihapus pada kasus tersebut.

### R2 — UX mobile dan aksesibilitas
- Editor modal memiliki semantik dialog: `role="dialog"`, `aria-modal`, label, dan deskripsi.
- Tombol tutup editor memiliki accessible name dan target sentuh minimal 44px.
- Fokus awal: desktop ke area konten, mobile ke tombol tutup agar keyboard virtual tidak terbuka otomatis.
- Fokus dikembalikan ke elemen pembuka setelah modal ditutup.
- Tab dan Shift+Tab dijaga tetap di dalam modal (focus trap).
- Escape menutup menu tindakan mobile lebih dulu; Escape berikutnya menjalankan alur tutup editor (dengan konfirmasi bila perlu).
- Semua jalur penutupan editor memakai lifecycle terpusat.

### Riwayat sebelumnya
Temporary Inbox, navigasi workspace, kategori, backup/restore, pencarian, organisasi catatan, template, checklist, dashboard, dan sinkronisasi offline dikembangkan pada fase sebelum v1.3.7. Detail per fase diringkas agar changelog tetap ringkas.
