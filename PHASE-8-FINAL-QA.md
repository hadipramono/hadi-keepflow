# Hadi KeepFlow — Phase 8 Final QA & Release

Tanggal: 2026-11-03  
Candidate package: **v1.3.6-rc.1**  
Target stable version: **v1.3.6**  
Classification: **pre-release candidate; not yet approved as production-stable**.

## Keputusan versi

Versi fitur tetap pada target v1.3.6. Paket final QA diberi label v1.3.6-rc.1 karena deployment GAS/Drive, konflik multi-sesi, restore, dan pengujian perangkat nyata belum dilakukan. Menetapkan label stabil sekarang akan menyatakan validasi yang belum terjadi. Setelah semua checklist deployment/live di bawah lulus, kandidat ini dapat ditetapkan sebagai v1.3.6 tanpa perubahan fitur.

## Cakupan final QA

Paket menggabungkan tujuh source aplikasi terbaru setelah optimasi Phase 7: `Index.html`, `AppStyles.html`, `AppScripts.html`, `Code.gs`, `DriveStorage.gs`, `NotesApi.gs`, dan `SyncOperations.gs`. Hanya versi pada metadata/header aplikasi yang dinaikkan dari `1.3.6-dev` ke `1.3.6-rc.1`; optimasi render dashboard Phase 7 dipertahankan. File proyek asli di `/data/projects/google-apps-script/Hadi-KeepFlow` tidak diubah.

## Hasil pemeriksaan lokal

- Sintaks JavaScript inline `AppScripts.html`: lulus.
- Sintaks backend empat `.gs` bila digabung sebagai source Apps Script: lulus.
- Node mock regression Phase 3.7.4: lulus (3 assertions groups).
- HTML ID: 129 unik, tanpa duplikat; 120 referensi `getElementById()` literal cocok dengan ID yang ada.
- CSS braces: seimbang; fallback `100vh` mendahului `100dvh`.
- Referensi partial template: `AppStyles` tersedia dan digunakan oleh `Index.html`.
- Versi kandidat: metadata halaman dan backup menunjukkan `1.3.6-rc.1`; tidak ada string `1.3.6-dev` tersisa di source aplikasi.
- Arsip ZIP: integrity check lulus.

## Belum tervalidasi

Belum ada deployment GAS uji, pemanggilan Google Drive live, simulasi kuota PropertiesService, pengujian lintas browser/perangkat, atau benchmark dataset besar. Karena itu paket belum diklasifikasikan sebagai rilis stabil.

## Syarat penetapan stabil v1.3.6

- [ ] Deploy paket ke project Apps Script uji terpisah.
- [ ] Verifikasi Dashboard/workspace, Inbox, kategori, tag, pencarian, editor, draft, pin, arsip, dan delete pada browser.
- [ ] Uji pembuatan, penggantian nama, dan penghapusan kategori terhadap Drive uji.
- [ ] Buat backup, simpan file backup, lalu uji migrasi legacy `Umum` dan pemulihan move terputus; pastikan ID file terjaga.
- [ ] Uji offline queue, reload saat offline, reconnect, retry setelah commit termasuk antrean berumur lebih dari 7 hari, dan konflik dua sesi.
- [ ] Uji kegagalan penyimpanan receipt/PropertiesService setelah mutasi Drive.
- [ ] Uji backup ZIP dan restore pada storage uji terpisah.
- [ ] Uji tampilan dan interaksi pada matriks desktop/mobile yang didukung.
- [ ] Pastikan tidak ada kehilangan catatan, duplikasi tak diinginkan, atau perubahan metadata.
- [ ] Periksa console, network, serta otorisasi deployment (personal, bukan akses publik/broad).
- [ ] Catat hasil checklist dan baru ubah klasifikasi kandidat menjadi stable v1.3.6.
