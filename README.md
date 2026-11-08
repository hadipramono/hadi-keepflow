# Hadi KeepFlow

Aplikasi Personal Knowledge Management (PKM) ringan berbasis **Google Apps Script, Google Drive, HTML, dan browser storage**.

## Fitur

- Catatan Markdown-compatible dengan penyimpanan utama di Google Drive.
- Cache, draft editor, preferensi, dan antrean sinkronisasi offline di browser.
- Pencarian, filter, tag, pin, arsip, checklist, template, dan editor fokus.
- Backup/restore ZIP.
- Temporary Inbox untuk catatan tanpa kategori.
- Pengelolaan kategori: buat, ubah nama, dan hapus kategori kosong.
- Editor responsif dengan dock mobile (Format, Template, Kategori) yang berada tepat di atas keyboard virtual, serta menu tindakan.

## Aturan data

- **Inbox** adalah tampilan untuk catatan aktif tanpa kategori, bukan kategori permanen.
- **Umum** adalah folder legacy yang dilindungi; tidak dapat dihapus sebagai kategori biasa.
- Kategori hanya dapat dihapus jika kosong. Catatan tidak dipindahkan atau dihapus ketika kategori ditolak karena masih berisi catatan.
- Catatan pinned tetap dihitung dalam kategori; catatan archived tidak dihitung dalam hitungan aktif.
- Google Drive adalah sumber data persisten. LocalStorage hanya untuk cache, draft, preferensi, dan antrean operasi.

## Struktur repository

```text
.
├── Code.gs              Web app entry point dan shared utilities
├── NotesApi.gs          API catatan dan kategori
├── DriveStorage.gs      Operasi Google Drive
├── SyncOperations.gs    Sinkronisasi dan idempotency receipts
├── Index.html           Struktur halaman dan komponen UI
├── AppStyles.html       CSS dan responsive layout
├── AppScripts.html      UI, state, editor, pencarian, offline queue
├── INSTALL.md           Instalasi, deployment, dan pembaruan
├── TESTING.md           Checklist verifikasi manual
├── CHANGELOG.md         Ringkasan perubahan
├── ROADMAP.md           Status dan pekerjaan berikutnya
├── SECURITY.md          Model keamanan dan privasi
├── CONTRIBUTING.md      Panduan kontribusi
└── LICENSE              MIT
```

## Arsitektur

```text
Browser
├── Index.html / AppStyles.html / AppScripts.html
└── LocalStorage     Cache, draft, preferensi, pending operations
         │ google.script.run
         ▼
Google Apps Script
├── Code.gs / NotesApi.gs / DriveStorage.gs / SyncOperations.gs
         │
         ▼
Google Drive: My Drive/apps/KeepFlow/storage/<kategori>/<catatan>.md
```

## Instalasi singkat

1. Buat project di [Google Apps Script](https://script.google.com/).
2. Tambahkan empat file `.gs` dan tiga file HTML dengan nama yang sama seperti pada repository.
3. Salin source, simpan, lalu deploy sebagai **Web app**.
4. Untuk penggunaan pribadi, gunakan **Execute as: Me** dan **Who has access: Only myself**.
5. Uji pada project dan folder Drive khusus testing sebelum memakai data utama.

Panduan lengkap, termasuk cara memperbarui deployment: [`INSTALL.md`](INSTALL.md).

## Status

Versi aplikasi: **v1.3.8** (kandidat). Perubahan terbaru diverifikasi lewat simulasi browser, tetapi **belum diverifikasi** pada perangkat nyata, Apps Script, dan Google Drive. Jangan dianggap production-verified sebelum [`TESTING.md`](TESTING.md) selesai dijalankan.

- [`CHANGELOG.md`](CHANGELOG.md) — ringkasan perubahan.
- [`ROADMAP.md`](ROADMAP.md) — status dan pekerjaan berikutnya.
- [`TESTING.md`](TESTING.md) — checklist verifikasi.
- [`SECURITY.md`](SECURITY.md) — model keamanan dan privasi.

## Batasan

- Ditujukan untuk penggunaan personal/single-user.
- Belum menyediakan autentikasi aplikasi, role, tenant isolation, atau kolaborasi multi-user.
- Tidak menggunakan AI, vector database, atau semantic search.
- Membutuhkan koneksi internet untuk dependency CDN (lihat [`SECURITY.md`](SECURITY.md)).

## Lisensi

[MIT](LICENSE)
