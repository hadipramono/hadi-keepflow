# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/). Semua rilis di bawah ini masih berstatus **kandidat** sampai checklist [`TESTING.md`](TESTING.md) selesai dijalankan pada perangkat nyata.

## v1.3.8 — 2026-11-08 (kandidat)

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
