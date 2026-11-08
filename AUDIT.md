# Laporan audit — Hadi KeepFlow v1.3.8

Tanggal: 2026-11-08. Cakupan: keamanan, kode, cara dan format penyimpanan, keandalan sinkronisasi, UI/UX, aksesibilitas, dan rekayasa repo.

**Batasan:** semua verifikasi dijalankan pada Chromium headless dan tiruan Google Drive di memori. Belum ada uji di Apps Script, Google Drive, atau perangkat nyata; checklist untuk itu ada di [`TESTING.md`](TESTING.md).

## Metode

- Membaca seluruh source (backend ±900 baris, frontend ±3.700 baris).
- ESLint pada seluruh JavaScript: tidak ada variabel tak terdefinisi, duplikat, atau kode tak terjangkau; hanya 10 parameter `catch` yang tidak dipakai.
- axe-core (WCAG 2.0/2.1 A/AA + best practice) pada daftar catatan dan editor, desktop dan mobile, tema terang dan gelap.
- Proof-of-concept untuk temuan keamanan.
- Tes otomatis baru (`tests/`, 59 tes) dan uji mutasi untuk memastikan tes benar-benar menangkap kerusakan.

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
| E1 | Rekayasa | Tidak ada tes, manifest, atau CI. | Sedang | **Ditambah** (`tests/`, `appsscript.json`, GitHub Actions) |

## Temuan terbuka (belum dikerjakan)

| # | Temuan | Usulan |
|---|---|---|
| O1 | Respons `getNotes` masih berisi seluruh isi semua catatan pada setiap pemuatan (biaya transfer, bukan biaya Drive). | Setelah P1 diukur di Drive nyata: protokol delta (klien mengirim ID+versi yang dimilikinya, server hanya mengirim yang berubah). |
| O2 | Cache lokal memakai `localStorage` (±5 MB, sinkron, memblokir UI) berisi seluruh isi catatan. | Pindah ke IndexedDB. |
| O3 | `document.execCommand` sudah deprecated. | Ganti dengan Selection/Range API atau pustaka editor. |
| O4 | 10 `confirm()` dan 5 `prompt()` masih native. | Dialog di dalam aplikasi (butuh refaktor alur async). |
| O5 | Isi catatan adalah HTML di file `.md`. | Konversi ke Markdown murni. Butuh pembuat/pembaca Markdown dan uji bolak-balik; field `content_type: html` sudah disiapkan untuk migrasi. |
| O6 | Tailwind Play CDN, Font Awesome, dan JSZip dimuat dari CDN tanpa SRI; Tailwind Play CDN tidak ditujukan untuk produksi. | Bundel lokal atau tambahkan SRI. |
| O7 | Scope OAuth `drive` penuh (tidak bisa dipersempit selama memakai `DriveApp`). | Batasan platform; didokumentasikan di `SECURITY.md`. |
| O8 | Tidak ada backup otomatis (hanya ZIP manual). | Time-driven trigger yang menulis ZIP ke folder Drive terpisah. |
| O9 | Tes browser (Playwright) belum masuk repo/CI; hanya tes Node. | Tambahkan setelah ada keputusan soal dependensi dev. |
| O10 | Restore melewati catatan berjudul sama tetapi isi berbeda. | Impor sebagai salinan ("(impor)") bila pengguna setuju. |

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

## Hal yang sudah baik (dipertahankan)

- Antrean sinkronisasi offline dengan `opId`, backoff, pembatalan, dan penanganan konflik versi (optimistic concurrency).
- Hapus = pindah ke sampah Drive (dapat dipulihkan), bukan hapus permanen.
- Validasi akses file: hanya folder penyimpanan KeepFlow atau folder kategori langsungnya.
- Impor ZIP membatasi ukuran total, jumlah entri, dan ukuran hasil ekstraksi (anti zip-bomb).
- Sanitizer editor memakai daftar tag yang diizinkan dan membuang semua atribut.
- `prefers-reduced-motion`, indikator `:focus-visible`, focus trap pada modal, dan target sentuh ≥44px.

## Kompatibilitas data

Format baru bersifat *lazy*: file lama (`---JSON---` atau tanpa metadata) tetap terbaca dan baru ditulis ulang ke v2 saat disimpan lagi. Tidak ada migrasi massal. **Versi aplikasi lama tidak membaca v2 dengan benar** (front matter akan tampak sebagai isi), jadi buat backup ZIP sebelum memperbarui dan jangan menurunkan versi setelah mulai menyimpan.
