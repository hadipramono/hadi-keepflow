# Hadi KeepFlow v1.2.8 — Tahap 2.4: Maintainability & Code Structure

## Perubahan
- Frontend dipisah menjadi `Index.html` (markup), `AppStyles.html` (CSS), dan `AppScripts.html` (JavaScript aplikasi).
- Backend dipisah menjadi `Code.gs` (entry point/helper), `DriveStorage.gs` (akses dan validasi struktur Drive), `SyncOperations.gs` (idempotency receipt), dan `NotesApi.gs` (API catatan).
- Nama fungsi global dipertahankan agar pemanggilan `google.script.run` dan trigger lama tetap kompatibel.
- `doGet()` memakai HtmlService template untuk menyertakan partial frontend.
- Tidak ada perubahan yang disengaja pada format data, nama key LocalStorage, operasi antrean, atau kontrak API.

## Catatan
Google Apps Script menggabungkan file `.gs` dalam satu global namespace. Urutan file tidak menentukan urutan eksekusi. HTML partial dimasukkan server-side melalui `include()`.
