# Instalasi dan deployment

## Prasyarat
- Akun Google dan akses ke Google Apps Script.
- Google Drive.
- Browser modern dengan JavaScript aktif.
- Koneksi internet untuk dependency CDN yang dipakai UI: Tailwind CSS (`cdn.tailwindcss.com`), Font Awesome 6.4.0 (`cdnjs.cloudflare.com`), dan JSZip 3.10.1 (`cdn.jsdelivr.net`).

## Membuat project
1. Buka https://script.google.com/ lalu buat project baru.
2. Tambahkan file script: `Code.gs`, `DriveStorage.gs`, `NotesApi.gs`, `NoteFormat.gs`, `SyncOperations.gs`.
3. Tambahkan file HTML: `Index.html`, `AppStyles.html`, `AppScripts.html`.
4. Salin source dari repository ke file dengan nama yang sama. Semua file `.gs` berbagi global namespace.
5. Buka **Project Settings → Show "appsscript.json" manifest file in editor**, lalu salin isi `appsscript.json` dari repository. Manifest ini membatasi scope OAuth hanya ke `drive`, memakai runtime V8, dan menetapkan web app *Execute as: Me* / *Only myself*.
6. Simpan dan periksa error sintaks pada editor Apps Script.

## Deploy
1. Pilih **Deploy → New deployment → Web app**.
2. Untuk instance pribadi, pilih **Execute as: Me** dan **Who has access: Only myself**.
3. Deploy, berikan otorisasi Google Drive, lalu buka URL aplikasi (`.../exec`).
4. Buat catatan uji dan pastikan file muncul di folder `My Drive/apps/KeepFlow/storage/`.

## Memperbarui deployment
Perubahan source **tidak otomatis tampil** pada URL `/exec`. Setelah menyalin source baru:

1. Pilih **Deploy → Manage deployments**.
2. Klik ikon pensil (Edit) pada deployment yang ada.
3. Pada **Version**, pilih **New version**, lalu **Deploy**.
4. Muat ulang aplikasi di browser (tutup tab lama dan buka dari tab baru).

Langkah ini wajib untuk perubahan di `Code.gs`, termasuk meta viewport (`interactive-widget=resizes-content`) yang membuat toolbar editor mobile tetap berada di atas keyboard virtual. Meta tersebut hanya berlaku bila halaman dibuka lewat URL `/exec` deployment terbaru.

## Catatan keyboard virtual
- Android (Chrome 108+, Samsung Internet): toolbar editor mengikuti keyboard melalui `interactive-widget=resizes-content`.
- iOS Safari tidak mendukung `interactive-widget`; posisi toolbar bergantung pada `visualViewport`. Verifikasi pada perangkat nyata dicatat di [`TESTING.md`](TESTING.md).

## Memperbarui dari versi sebelum 1.3.8
v1.3.8 menulis catatan dalam format v2 (front matter YAML). File lama tetap terbaca dan ditingkatkan saat disimpan berikutnya, tetapi **versi aplikasi lama tidak membaca v2 dengan benar**. Sebelum memperbarui:

1. Buat **Backup ZIP** dari versi lama.
2. Perbarui source (termasuk file baru `NoteFormat.gs` dan `appsscript.json`) lalu deploy sebagai New version.
3. Jangan menurunkan versi setelah mulai menyimpan catatan.

## Penting
Jangan membuka akses publik untuk deployment yang berjalan sebagai akun pemilik. Aplikasi ini belum memiliki autentikasi dan otorisasi multi-user sendiri. Lakukan pengujian pada project dan data Drive terpisah sebelum menggunakan data utama.
