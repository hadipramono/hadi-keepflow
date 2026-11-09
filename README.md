# Hadi KeepFlow

Aplikasi Personal Knowledge Management (PKM) ringan berbasis **Google Apps Script, Google Drive, HTML, dan browser storage**.

## Fitur

- Catatan tersimpan sebagai file `.md` di Google Drive: front matter YAML standar + isi HTML sederhana (subset yang aman).
- Cache catatan (IndexedDB), draft editor, preferensi, dan antrean sinkronisasi offline di browser.
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
- Google Drive adalah sumber data persisten. Browser (IndexedDB dan LocalStorage) hanya untuk cache, draft, preferensi, dan antrean operasi.

## Struktur repository

```text
.
├── Code.gs              Web app entry point dan shared utilities
├── NotesApi.gs          API catatan dan kategori
├── NoteFormat.gs        Format file catatan v2 (YAML front matter)
├── NotesIndex.gs        Indeks cache catatan (mempercepat pemuatan)
├── DriveStorage.gs      Operasi Google Drive
├── SyncOperations.gs    Sinkronisasi dan idempotency receipts
├── Index.html           Struktur halaman dan komponen UI
├── AppStyles.html       CSS dan responsive layout
├── AppScripts.html      UI, state, editor, pencarian, offline queue
├── appsscript.json      Manifest Apps Script (scope, akses web app)
├── package.json         Skrip tes dan dependensi dev (fake-indexeddb)
├── tests/               Tes otomatis (npm test)
├── .github/workflows/   CI
├── AUDIT.md             Laporan audit dan temuan terbuka
├── INSTALL.md           Instalasi, deployment, dan pembaruan
├── TESTING.md           Checklist verifikasi manual
├── CHANGELOG.md         Ringkasan perubahan
├── ROADMAP.md           Status dan pekerjaan berikutnya
├── SECURITY.md          Model keamanan dan privasi
├── CONTRIBUTING.md      Panduan kontribusi
└── LICENSE              MIT
```

## Format penyimpanan

Satu catatan = satu file `.md` di `My Drive/apps/KeepFlow/storage/<kategori>/`. Catatan tanpa kategori berada langsung di `storage/` (Inbox).

```markdown
---
keepflow: 2
title: "Roma 8: Ayat 1"
created: "2026-11-01T00:00:00.000Z"
pinned: false
archived: false
tags: ["studi", "roma"]
content_type: html
---

<p>Isi catatan...</p>
```

- Front matter valid sebagai YAML sehingga dapat dibaca alat lain; semua nilai berupa literal JSON.
- **Isi catatan adalah HTML sederhana, bukan Markdown.** Penyimpanan Markdown murni ada di [`ROADMAP.md`](ROADMAP.md).
- Judul asli disimpan di front matter; nama file hanya versi yang aman untuk Drive.
- Format lama (`---JSON---`) dan file tanpa metadata tetap terbaca dan ditingkatkan saat disimpan lagi.
- `storage/.keepflow-index.json` adalah indeks cache yang dibuat otomatis agar pemuatan cepat. Aman dihapus (dibangun ulang) dan tidak pernah tampil sebagai catatan.

## Arsitektur

```text
Browser
├── Index.html / AppStyles.html / AppScripts.html
├── IndexedDB        Cache catatan (satu record per catatan)
└── LocalStorage     Draft, preferensi, antrean operasi (ditulis sinkron)
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
2. Tambahkan enam file `.gs` dan tiga file HTML dengan nama yang sama seperti pada repository.
3. Salin source, simpan, lalu deploy sebagai **Web app**.
4. Untuk penggunaan pribadi, gunakan **Execute as: Me** dan **Who has access: Only myself**.
5. Uji pada project dan folder Drive khusus testing sebelum memakai data utama.

Panduan lengkap, termasuk cara memperbarui deployment: [`INSTALL.md`](INSTALL.md).

## Status

Versi aplikasi: **v1.3.8** (kandidat). Perubahan terbaru diverifikasi lewat tes otomatis dan simulasi browser, tetapi **belum diverifikasi** pada perangkat nyata, Apps Script, dan Google Drive. Jangan dianggap production-verified sebelum [`TESTING.md`](TESTING.md) selesai dijalankan.

- [`CHANGELOG.md`](CHANGELOG.md) — ringkasan perubahan.
- [`ROADMAP.md`](ROADMAP.md) — status dan pekerjaan berikutnya.
- [`TESTING.md`](TESTING.md) — checklist verifikasi.
- [`SECURITY.md`](SECURITY.md) — model keamanan dan privasi.
- [`AUDIT.md`](AUDIT.md) — hasil audit dan temuan terbuka.

## Batasan

- Ditujukan untuk penggunaan personal/single-user.
- Belum menyediakan autentikasi aplikasi, role, tenant isolation, atau kolaborasi multi-user.
- Tidak menggunakan AI, vector database, atau semantic search.
- Membutuhkan koneksi internet untuk dependency CDN (lihat [`SECURITY.md`](SECURITY.md)).

## Lisensi

[MIT](LICENSE)
