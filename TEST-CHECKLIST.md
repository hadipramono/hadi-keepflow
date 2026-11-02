# Phase 8 Release Checklist

## Selesai secara lokal

- [x] Source aplikasi 7 file hadir.
- [x] Sintaks frontend dan backend lulus.
- [x] Node mock regression Phase 3.7.4 lulus.
- [x] 129 ID unik dan 120 literal `getElementById()` references lolos pemeriksaan.
- [x] CSS brace balance dan fallback viewport lolos.
- [x] Metadata versi kandidat konsisten.
- [x] ZIP dapat dibuka dan checksum dicatat.

## Wajib sebelum stable v1.3.6

- [ ] Deploy ke Apps Script uji terpisah dan verifikasi otorisasi.
- [ ] Uji fungsi utama dan kategori terhadap Google Drive uji.
- [ ] Uji migrasi legacy `Umum` dan pemulihan Drive move terputus.
- [ ] Uji offline queue, commit-response loss, antrean lebih dari 7 hari, dan konflik multi-sesi.
- [ ] Uji kegagalan receipt/PropertiesService setelah mutasi Drive.
- [ ] Uji backup/restore.
- [ ] Uji desktop/mobile serta browser yang didukung.
- [ ] Periksa console/network dan pastikan tidak ada kehilangan/duplikasi/perubahan metadata.
