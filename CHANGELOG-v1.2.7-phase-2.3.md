# Changelog — Hadi KeepFlow v1.2.7

## Tahap 2.3 — Editor & Content Handling

### Draft lokal otomatis
- Editor menyimpan draft terpisah di LocalStorage setelah jeda 650 ms sejak input terakhir.
- Draft tidak dikirim ke Google Drive sampai pengguna menekan Simpan.
- Draft bertahan ketika tab/browser ditutup atau halaman direload.
- Saat editor dibuka kembali, draft untuk catatan yang sama (atau draft catatan baru) dapat dipulihkan dengan konfirmasi.
- Draft dari baseline catatan yang lebih lama diberi peringatan sebelum dipulihkan.
- Draft dihapus setelah penyimpanan berhasil di sisi lokal atau ketika pengguna mengonfirmasi membuang perubahan.

### Indikator perubahan
- Status editor menunjukkan ketika perubahan sedang menunggu autosave dan ketika draft sudah tersimpan di perangkat.
- Shortcut Ctrl+S / Cmd+S menjalankan aksi Simpan.

### Pengamanan dan normalisasi konten
- HTML editor dibersihkan melalui allowlist elemen format yang didukung toolbar.
- Script, style, iframe, object, embed, SVG, MathML, atribut event, dan atribut tidak dikenal dibuang.
- Link hanya mempertahankan protokol HTTP, HTTPS, dan mailto.
- Normalisasi tag menghapus duplikat tanpa membedakan kapitalisasi, membatasi 50 tag dan 60 karakter per tag.
- Judul dibatasi 180 karakter; kategori 120 karakter; isi 500.000 karakter.

### Kompatibilitas
- Tidak mengubah `Code.gs`, format file Markdown/metadata Drive, key antrean sinkronisasi, atau key cache catatan.
- Draft editor menggunakan key baru `hadi_keepflow_editor_draft_v1`.
- Draft lokal tidak dianggap sebagai operasi sinkronisasi sampai pengguna menekan Simpan.
