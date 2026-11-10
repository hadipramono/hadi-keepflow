# Laporan audit — Hadi KeepFlow v1.3.8

Tanggal: 2026-11-08. Cakupan: keamanan, kode, cara dan format penyimpanan, keandalan sinkronisasi, UI/UX, aksesibilitas, dan rekayasa repo.

**Batasan:** semua verifikasi dijalankan pada Chromium headless dan tiruan Google Drive di memori. Belum ada uji di Apps Script, Google Drive, atau perangkat nyata; checklist untuk itu ada di [`TESTING.md`](TESTING.md).

## Metode

- Membaca seluruh source (backend ±900 baris, frontend ±3.700 baris).
- ESLint pada seluruh JavaScript: tidak ada variabel tak terdefinisi, duplikat, atau kode tak terjangkau; hanya 10 parameter `catch` yang tidak dipakai.
- axe-core (WCAG 2.0/2.1 A/AA + best practice) pada daftar catatan dan editor, desktop dan mobile, tema terang dan gelap.
- Proof-of-concept untuk temuan keamanan.
- Tes otomatis baru (`tests/`, 93 tes) dan uji mutasi untuk memastikan tes benar-benar menangkap kerusakan.

## Temuan dan status

| # | Area | Temuan | Tingkat | Status |
|---|---|---|---|---|
| S1 | Keamanan | `getPlainText` memasukkan konten catatan mentah ke `innerHTML`. Elemen yang tidak terpasang pun tetap menjalankan `<img onerror>`; PoC terbukti mengeksekusi skrip saat kartu dirender. Skrip di sini memegang `google.script.run`, jadi bisa membaca/menghapus catatan. Sumber konten: restore ZIP, file Drive yang diedit dari luar, cache lokal. | Tinggi | **Diperbaiki** (parser `DOMParser` yang inert; PoC kini 0 eksekusi) |
| S2 | Keamanan | Konten dari ZIP disimpan ke Drive tanpa sanitasi. | Tinggi | **Diperbaiki** (disanitasi saat impor; teks polos dibungkus paragraf dan di-escape) |
| S3 | Keamanan | `include(filename)` dapat dipanggil dari browser dengan nama file apa pun. | Sedang | **Diperbaiki** (allowlist `AppStyles`, `AppScripts`) |
| S4 | Keamanan | `saveNotes` dan `deleteNoteFromFile` terekspos tetapi tidak dipakai frontend. | Rendah | **Dihapus** |
| D1 | Penyimpanan | Receipt idempotensi memakai `PropertiesService` (kuota 500 KB) dan memindai semua properti pada setiap simpan. Saat restore ZIP besar, `setProperty` bisa gagal setelah file ditulis, klien mencoba lagi, dan catatan menjadi ganda. | Sedang | **Diperbaiki** (best-effort, pruning maksimal sekali per jam, ada uji kuota penuh) |
| D2 | Format | Judul = nama file. Karakter terlarang diubah (`Roma 8: Ayat` → `Roma 8- Ayat`) dan suffix `(1)` masuk ke judul secara diam-diam. | Sedang | **Diperbaiki** (judul asli di front matter) |
| D3 | Format | Metadata memakai pemisah non-standar `---JSON---`; README menyebut "Markdown-compatible" padahal isi catatan adalah HTML. | Sedang | **Diperbaiki sebagian**: front matter YAML standar (format v2) dan dokumentasi dikoreksi. Isi tetap HTML (lihat O5). |
| D4 | Data | `createdAt` tidak divalidasi; judul boleh memuat karakter kontrol. | Rendah | **Diperbaiki** |
| D5 | Kode | `getNotes` dan `getBackupSnapshot` menduplikasi logika pembacaan. | Rendah | **Dirapikan** (`collectAllNotes_`) |
| U1 | UX | Pratinjau menyatukan blok teks ("...v1.3.8.[ ] Kirim notulen[x] Booking ruang"), dan pencarian ikut menggabung kata antar-paragraf. | Sedang | **Diperbaiki** (pemisah baris, ☐/☑) |
| U2 | Aksesibilitas | axe: 5 jenis pelanggaran (kontras teks abu-abu 2,5:1, `aria-expanded` tak valid pada kolom cari, label tombol Inbox tak cocok teksnya, checkbox checklist tanpa nama, loader tanpa role). | Sedang | **Diperbaiki** (0 pelanggaran, terang dan gelap) |
| U3 | UX | 27 `alert()` yang memblokir halaman (bermasalah di iframe Apps Script). | Rendah | **Diganti** toast non-blokir (`role` sesuai tingkat) |
| U4 | UX | Dock mobile tertutup keyboard; lima tombol tidak muat. | Tinggi | **Diperbaiki** (lihat CHANGELOG) |
| P1 | Performa | `getNotes` mengunduh isi **setiap** file Drive pada setiap pemuatan (satu panggilan per file), sambil memegang `ScriptLock` sehingga penyimpanan ikut tertahan. | Tinggi (pada banyak catatan) | **Diperbaiki** dengan indeks catatan (lihat bagian Performa). Belum diukur di Drive nyata. |
| P2 | Performa | Respons `getNotes` mengirim seluruh isi semua catatan pada setiap pemuatan (biaya transfer dan parse di browser), walau hampir semuanya tidak berubah. | Sedang | **Diperbaiki** dengan protokol delta `getNotesDelta` (lihat bagian Performa). |
| P3 | Penyimpanan lokal | Seluruh cache catatan ditulis sebagai **satu JSON besar ke `localStorage`** (batas ±5 MB, sinkron, menulis ulang semuanya pada setiap perubahan). Pada ±8 MB data, penyimpanan gagal dan **setelah muat ulang tidak ada catatan tersisa** (terbukti pada uji pembanding). | Tinggi (offline) | **Diperbaiki** dengan cache IndexedDB (lihat bagian Cache lokal). |
| E1 | Rekayasa | Tidak ada tes, manifest, atau CI. | Sedang | **Ditambah** (`tests/`, `appsscript.json`, GitHub Actions) |

## Temuan terbuka (belum dikerjakan)

| # | Temuan | Usulan |
|---|---|---|
| O1 | Waktu nyata P1/P2 di Apps Script belum diukur. | Jalankan `benchmarkNotesRead` dan catat angkanya; periksa baris `KeepFlow getNotesDelta` di Execution log (`unchanged` vs `sent`). |
| O2 | Antrean operasi dan draf editor masih di `localStorage` (±5 MB bersama preferensi). Satu catatan antre sangat besar bisa tetap membentur batas itu. | Pindahkan antrean ke IndexedDB dengan jaminan durabilitas yang setara (butuh desain tersendiri; lihat catatan di bawah). |
| O11 | Sinkronisasi antar-tab. | **Implementasi awal ditambahkan**: BroadcastChannel + storage-event fallback, invalidation signal tanpa isi catatan, refresh antrean/cache, perlindungan editor aktif, dan sync lease. Perlu uji dua tab nyata; lease localStorage bersifat best-effort. |
| O3 | `document.execCommand` sudah deprecated. | Ganti dengan Selection/Range API atau pustaka editor. |
| O4 | 10 `confirm()` dan 5 `prompt()` masih native. | **Diperbaiki**: seluruh 15 titik diganti dialog internal asinkron; konfirmasi dan input memakai komponen modal yang sama, focus trap, Escape, backdrop cancel, dan antrean dialog. |
| O5 | Isi catatan adalah HTML di file `.md`. | Konversi ke Markdown murni. Butuh pembuat/pembaca Markdown dan uji bolak-balik; field `content_type: html` sudah disiapkan untuk migrasi. |
| O6 | Tailwind Play CDN, Font Awesome, dan JSZip dimuat dari CDN tanpa SRI; Tailwind Play CDN tidak ditujukan untuk produksi. | Bundel lokal atau tambahkan SRI. |
| O7 | Scope OAuth `drive` penuh (tidak bisa dipersempit selama memakai `DriveApp`). | Batasan platform; didokumentasikan di `SECURITY.md`. |
| O8 | Tidak ada backup otomatis (hanya ZIP manual). | Time-driven trigger yang menulis ZIP ke folder Drive terpisah. |
| O9 | Tes browser (Playwright) belum masuk repo/CI; hanya tes Node. | Tambahkan setelah ada keputusan soal dependensi dev. |
| O10 | Restore melewati catatan berjudul sama tetapi isi berbeda. | Impor sebagai salinan ("(impor)") bila pengguna setuju. |

### Dialog internal (O4)

Seluruh 15 pemanggilan native `confirm()`/`prompt()` pada frontend diganti dengan `appConfirm()` dan `appPrompt()`. Komponen dialog memakai satu modal internal, menampilkan teks melalui `textContent`, mendukung input teks, tombol kontekstual, pembatalan melalui Escape/backdrop, pengembalian fokus, focus trap, serta antrean agar beberapa permintaan async tidak saling menimpa. Alur konflik sinkronisasi menunggu keputusan dialog sebelum melanjutkan antrean operasi.

Verifikasi statis memastikan tidak ada lagi pemanggilan native `confirm()`/`prompt()` di `AppScripts.html`. Pengujian interaksi visual dan screen reader tetap perlu dilakukan di browser nyata.

## Performa: indeks catatan (P1)

Biaya mahal pada pembacaan adalah *mengunduh isi file*, bukan mendaftar file dan membaca metadatanya. Solusinya satu file `storage/.keepflow-index.json` yang menyimpan hasil parse tiap catatan beserta ID, waktu ubah, dan nama file. Saat memuat, catatan yang ID, versi, dan namanya masih sama diambil dari indeks; yang lain dibaca dari Drive seperti biasa.

Jaminan yang diuji otomatis (12 mutasi sengaja dirusak, semuanya tertangkap):

- **Indeks hanya cache.** Indeks hilang, rusak, berformat asing, entrinya cacat, terlalu besar, atau gagal ditulis: pembacaan tetap benar, hanya lebih lambat.
- **Tidak pernah menyajikan data basi.** Setiap entri divalidasi terhadap file-nya pada tiap pembacaan (versi dan nama). Kategori tidak disimpan; selalu diambil dari folder.
- **Penulisan tidak memakai indeks.** Deteksi konflik versi selalu dari file Drive.
- **Backup membaca langsung dari file** dan tidak memakai atau mengubah indeks.
- **Tahan batas 6 menit.** Pembacaan dingin yang sangat besar menulis checkpoint tiap 100 unduhan, sehingga percobaan berikutnya melanjutkan.
- **Tidak ditulis ulang bila tidak ada perubahan**, dan file indeks tidak pernah tampil sebagai catatan.

Hasil pada tiruan Drive (jumlah unduhan isi file, bukan waktu nyata): 300 catatan, muat pertama 300 unduhan; muat kedua **0 unduhan**; mengedit satu catatan lalu memuat: **1 unduhan**.

Yang **belum** diketahui: penghematan waktu nyata di Apps Script. Jalankan `benchmarkNotesRead` dari editor Apps Script untuk mengukurnya pada data Anda.

### Protokol delta (P2)

Klien melaporkan catatan yang sudah dimilikinya, server membalas dengan stub `{id, unchanged: true}` untuk yang tidak berubah dan catatan penuh hanya untuk yang berubah atau baru. Klien merakit ulang **persis** array yang akan dikembalikan `getNotes()`, lalu memakai logika penggabungan yang sudah ada tanpa diubah.

Prinsip keamanannya: klaim "tidak berubah" harus konservatif.

- Klien hanya mengklaim catatan **tanpa operasi antrean** (sama dengan baseline cloud). Klaim berisi `[versi, kategori, judul, panjang isi]`; server harus cocok pada keempatnya, kalau tidak catatan penuh dikirim. Klaim yang salah atau cacat hanya berakibat dikirimnya catatan penuh, tidak pernah catatan yang hilang atau basi.
- Penghapusan, penambahan, pindah kategori, dan rename tercermin karena server selalu mengirim daftar lengkap ID; stub hanya menggantikan isinya.
- Edit pengguna selama permintaan berlangsung tidak tertimpa: operasi antrean tetap menang (diuji di browser).
- Respons tak valid, stub untuk ID yang tidak diklaim, atau kegagalan delta (misalnya server lama) memicu **satu** fallback ke `getNotes()` penuh.

Diuji: uji invarian acak 160 langkah (perubahan server acak, klaim klien acak) di mana hasil rakitan harus sama dengan `getNotes()`; 9 mutasi sengaja pada pemeriksaan keamanan, semuanya tertangkap; dan 19 pemeriksaan integrasi browser dengan `google.script.run` palsu. Pada tiruan Drive dengan 40 catatan, respons delta bersih berukuran kurang dari 15% respons penuh.

### Cache lokal: IndexedDB (P3)

Cache catatan kini di IndexedDB (`NotesCache` di `AppScripts.html`): satu record per catatan, hanya catatan yang berubah yang ditulis, urutan tersimpan eksplisit, dan tidak ada batas 5 MB.

Keputusan desain yang disengaja:

- **Hanya cache catatan yang pindah.** Antrean operasi dan draf editor tetap di `localStorage` dan ditulis **sinkron**. `persistLocal()` sejak awal hanya mengembalikan status antrean, jadi cache catatan memang sudah diperlakukan sebagai best-effort; Drive adalah sumber kebenaran dan antrean adalah log pemulihan. Penulisan IndexedDB yang asinkron tidak mengubah jaminan itu.
- **Migrasi aman.** Data `localStorage` lama dipindah dalam **satu transaksi**, jumlahnya diverifikasi, dan baru kemudian salinan lama dihapus. Bila migrasi gagal, salinan lama tidak disentuh dan aplikasi memakai `localStorage` seperti sebelumnya.
- **Fallback.** IndexedDB tidak tersedia, melempar kesalahan, atau tidak merespons dalam 4 detik: kembali ke `localStorage` (diuji).
- **Tidak menimpa sebelum dimuat.** Penulisan ditunda sampai pemuatan awal selesai, agar daftar kosong di memori tidak menghapus cache.
- **Pemulihan dari antrean.** Catatan yang hanya ada di antrean (cache hilang) dipulihkan ke daftar saat startup.
- **Pembersihan.** Salinan `localStorage` basi (misalnya dari versi aplikasi lama) diabaikan dan dihapus; cache tidak pernah digabung.

Hasil nyata di Chromium (40 catatan x 200 KB = 8 MB): versi lama menampilkan "Data terlalu besar untuk disimpan lokal" dan 0 catatan tersisa setelah muat ulang; versi baru mempertahankan ke-40 catatan, dan mengubah satu catatan hanya menulis satu record.

Bug yang ditemukan lewat uji mutasi: promise `transactionDone` yang ditolak setelah pengecualian sinkron menghasilkan `unhandledRejection` (error "Uncaught (in promise)" di konsol browser). Sudah diperbaiki dan dijaga tes.

Perlu diketahui: `navigator.storage.persist()` sengaja **tidak** dipanggil (Firefox menampilkan dialog izin). Browser tetap boleh membersihkan IndexedDB saat penyimpanan perangkat menipis; itu aman karena cache dibangun ulang dari Drive.


## Riwayat optimasi frontend (Tahap 1–3A)

Perubahan berikut dilakukan bertahap di atas baseline v1.3.8. Perubahan ini tidak mengubah backend, format catatan, skema IndexedDB, format backup, atau protokol sinkronisasi cloud.

### Tahap 1 — Preview, cache, dan editor metrics

- Preview pada Grid/List dibatasi panjangnya (Grid 400 karakter, List 200 karakter) dengan tetap mempertahankan konteks pencarian.
- Cache hasil pemrosesan preview menggunakan `Map` dengan key `String(note.id)`; validasi menggunakan versi/panjang konten dan metadata lowercase.
- Pengukuran metrik editor menggunakan debounce 250 ms dan menampilkan teks melalui `textContent`.
- Verifikasi: pemeriksaan sintaks, 5 assertion preview, dan 11/11 pemeriksaan statis lulus.
- Belum dilakukan: profiling browser dan pemeriksaan visual pada perangkat mobile nyata.

### Tahap 2.4 — Bounded rendering

- Daftar catatan dirender bertahap: batch awal 60 kartu, tombol **Muat lebih banyak** menambahkan hingga 60 kartu berikutnya.
- Pagination direset ketika filter, kategori, tag, pencarian, preset tanggal, atau urutan ID hasil filter berubah.
- Jumlah hasil tetap dihitung dari seluruh hasil filter. Bulk selection tetap mencakup seluruh catatan yang cocok, bukan hanya kartu yang sedang dirender.
- Catatan pinned dan reguler berbagi batas batch awal yang sama.
- Verifikasi: bagian dari 10/10 pemeriksaan statis Tahap 2 lulus. Pengukuran waktu render di browser belum dilakukan.

### Tahap 2.5 — Sidebar separation

- Rendering sidebar dipisahkan melalui `renderSidebarIfNeeded()`.
- Sidebar hanya dibangun ulang ketika referensi array notes/categories atau kategori/tag aktif berubah.
- Perubahan array pada beberapa jalur diperbarui menjadi immutable replacement agar perubahan referensi dapat dideteksi.
- Ketikan pencarian dan pagination tidak lagi memicu pembangunan ulang sidebar.
- Verifikasi: pemeriksaan statis Tahap 2 lulus; profiling browser belum dilakukan.

### Tahap 2.6 — Sync comparison

- `syncToBackend()` menggunakan pemeriksaan referensi terlebih dahulu (`notes.slice()`), lalu JSON comparison hanya bila referensi notes berubah.
- Snapshot `lastObservedNotes` dibuat secara shallow.
- Jalur mutasi note diaudit; tidak ditemukan assignment langsung ke properti objek note pada jalur yang diperiksa.
- Mutasi metadata `pendingOperations` tetap terpisah dan tidak mengubah objek note.
- Verifikasi: pemeriksaan statis Tahap 2 lulus. Pengujian sinkronisasi dua tab dan profiling runtime belum dilakukan.

### Tahap 3A — JSZip lazy load

- Pemanggilan JSZip eager dihapus dari pemuatan awal halaman.
- JSZip 3.10.1 dimuat ketika pengguna menjalankan Backup ZIP atau Restore/Import ZIP.
- Loader berbagi Promise untuk mencegah injeksi script berulang; Promise yang gagal dibersihkan agar pengguna dapat mencoba lagi.
- Alur backup dan restore menunggu library siap sebelum menggunakan JSZip.
- CDN, versi library, validasi backup/restore, dan format arsip dipertahankan.
- Verifikasi: pemeriksaan sintaks JavaScript inline lulus. Pemeriksaan statis terhadap loader dan alur backup/restore dilakukan; browser/network testing dan pengukuran penghematan waktu muat belum dilakukan.

### Tahap 3B — Tailwind CLI (ditunda)

- Audit dan scaffold pipeline Tailwind CLI telah dibuat, tetapi dependency tidak berhasil dipasang karena koneksi ke `registry.npmjs.org` gagal (`EAI_AGAIN`).
- CSS belum berhasil dikompilasi dan belum ada visual regression test.
- **Keputusan:** tetap gunakan Tailwind CDN. Scaffold Stage 3B tidak digabungkan ke baseline stabil.
- Jangan menghapus CDN sebelum CSS production berhasil dibangun dan diverifikasi pada tema terang/gelap serta viewport desktop/mobile.

## Hal yang sudah baik (dipertahankan)

- Antrean sinkronisasi offline dengan `opId`, backoff, pembatalan, dan penanganan konflik versi (optimistic concurrency).
- Hapus = pindah ke sampah Drive (dapat dipulihkan), bukan hapus permanen.
- Validasi akses file: hanya folder penyimpanan KeepFlow atau folder kategori langsungnya.
- Impor ZIP membatasi ukuran total, jumlah entri, dan ukuran hasil ekstraksi (anti zip-bomb).
- Sanitizer editor memakai daftar tag yang diizinkan dan membuang semua atribut.
- `prefers-reduced-motion`, indikator `:focus-visible`, focus trap pada modal, dan target sentuh ≥44px.

## Kompatibilitas data

Format baru bersifat *lazy*: file lama (`---JSON---` atau tanpa metadata) tetap terbaca dan baru ditulis ulang ke v2 saat disimpan lagi. Tidak ada migrasi massal. **Versi aplikasi lama tidak membaca v2 dengan benar** (front matter akan tampak sebagai isi), jadi buat backup ZIP sebelum memperbarui dan jangan menurunkan versi setelah mulai menyimpan.
