# Sync Queue — Manual Regression Test

Lakukan pada deployment uji atau setelah backup data. Gunakan catatan percobaan, bukan catatan penting.

## Persiapan
- Deploy versi v1.2.0 Tahap 1.1.
- Buka aplikasi pada satu tab.
- Pastikan status sinkronisasi normal.
- Siapkan catatan uji bernama `QUEUE TEST`.

## Test cases
1. **Create**
   - Buat catatan baru.
   - Tunggu status tersinkron.
   - Reload; catatan harus tetap ada dan tidak duplikat.

2. **Edit beruntun ketika save berlangsung**
   - Edit catatan dan simpan.
   - Segera edit lagi sebelum status sinkron selesai.
   - Tunggu antrean kosong lalu reload.
   - Isi terakhir harus tetap tersimpan.

3. **Pin/Archive beruntun**
   - Toggle pin, lalu archive/unarchive dengan cepat.
   - Tunggu sinkronisasi selesai dan reload.
   - Status akhir harus sama dengan tindakan terakhir.

4. **Create lalu delete saat request pertama berjalan**
   - Buat catatan baru, lalu segera hapus setelah catatan muncul.
   - Tunggu sinkronisasi dan reload.
   - Catatan tidak boleh muncul kembali.

5. **Perubahan saat initial load**
   - Reload aplikasi dan segera buat/edit catatan sebelum data cloud selesai dimuat.
   - Tunggu sinkronisasi dan reload.
   - Perubahan harus tetap ada.

6. **Offline queue**
   - Matikan koneksi.
   - Buat atau edit catatan.
   - Pastikan status offline dan perubahan tetap tampil.
   - Sambungkan kembali.
   - Tunggu baseline cloud dimuat dan antrean diproses.
   - Reload; perubahan harus tetap ada.

7. **Queue persistence**
   - Saat offline, buat perubahan.
   - Reload dalam keadaan offline.
   - Sambungkan kembali.
   - Pastikan antrean diproses dan perubahan tersimpan.

## Kriteria lulus
- Tidak ada catatan duplikat.
- Perubahan terakhir tidak tertimpa respons save sebelumnya.
- Delete tidak membuat catatan muncul kembali.
- Antrean tidak hilang setelah reload.
- Status tersinkron hanya muncul ketika antrean kosong.
