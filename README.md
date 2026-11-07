# Hadi KeepFlow

Aplikasi Personal Knowledge Management (PKM) ringan berbasis **Google Apps Script, Google Drive, HTML, dan browser storage**.

## Fitur

- Catatan Markdown-compatible dengan penyimpanan utama di Google Drive.
- Cache, draft editor, preferensi, dan antrean sinkronisasi offline di browser.
- Pencarian, filter, tag, pin, arsip, checklist, template, dan editor fokus.
- Backup/restore ZIP.
- Temporary Inbox untuk catatan tanpa kategori.
- Pengelolaan kategori: buat, ubah nama, dan hapus kategori kosong.
- Editor responsif dengan toolbar mobile, menu tindakan, dan dukungan keyboard.

## Aturan data

- **Inbox** adalah tampilan untuk catatan aktif tanpa kategori, bukan kategori permanen.
- **Umum** adalah folder legacy yang dilindungi; tidak dapat dihapus sebagai kategori biasa.
- Kategori hanya dapat dihapus jika kosong. Catatan tidak dipindahkan atau dihapus ketika kategori ditolak karena masih berisi catatan.
- Catatan pinned tetap dihitung dalam kategori; catatan archived tidak dihitung dalam hitungan aktif.
- Google Drive adalah sumber data persisten. LocalStorage hanya untuk cache, draft, preferensi, dan antrean operasi.

## Arsitektur

```text
Browser
├── Index.html       Struktur halaman dan komponen UI
├── AppStyles.html   CSS dan responsive layout
├── AppScripts.html  UI, state, editor, pencarian, offline queue
└── LocalStorage     Cache, draft, preferensi, pending operations
         │ google.script.run
         ▼
Google Apps Script
├── Code.gs          Web app entry point dan shared utilities
├── NotesApi.gs      API catatan dan kategori
├── DriveStorage.gs  Operasi Google Drive
└── SyncOperations.gs Sinkronisasi dan idempotency receipts
```

## Instalasi singkat

1. Buat project di [Google Apps Script](https://script.google.com/).
2. Tambahkan empat file `.gs` dan tiga file HTML sesuai nama pada repository.
3. Salin source, simpan, lalu deploy sebagai **Web app**.
4. Untuk penggunaan pribadi, gunakan **Execute as: Me** dan **Who has access: Only myself**.
5. Uji pada project dan folder Drive khusus testing sebelum memakai data utama.

Panduan lengkap: [`INSTALL.md`](INSTALL.md).

## Status

Versi aplikasi pada UI: **v1.3.7**. Paket ini merupakan kandidat stabilisasi setelah R1 dan R2; belum boleh dianggap production-verified sampai pengujian browser, perangkat nyata, Apps Script, dan Google Drive selesai.

Lihat:
- [`CHANGELOG.md`](CHANGELOG.md) — ringkasan perubahan.
- [`ROADMAP.md`](ROADMAP.md) — status dan pekerjaan berikutnya.
- [`TESTING.md`](TESTING.md) — checklist verifikasi.
- [`SECURITY.md`](SECURITY.md) — model keamanan dan privasi.

## Batasan

- Ditujukan untuk penggunaan personal/single-user.
- Belum menyediakan autentikasi aplikasi, role, tenant isolation, atau kolaborasi multi-user.
- Tidak menggunakan AI, vector database, atau semantic search.
