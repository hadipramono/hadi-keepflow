# Hadi KeepFlow — Backend Security Test (Tahap 1.3)

Lakukan pengujian setelah memperbarui `Code.gs` dan deploy sebagai New version.

## Persiapan aman
- Export JSON dari KeepFlow.
- Buat salinan project Apps Script.
- Siapkan satu catatan uji yang dibuat melalui KeepFlow.
- Jangan memakai ID file pribadi lain sebagai target uji hapus. Untuk menguji penolakan file di luar KeepFlow, gunakan file teks dummy yang boleh dihapus manual setelah pengujian.

## Checklist

### A. Operasi normal
- [ ] Buat catatan baru pada kategori Umum.
- [ ] Buat catatan baru pada kategori lain.
- [ ] Edit isi dan judul catatan yang sudah ada.
- [ ] Pindahkan catatan ke kategori lain melalui fitur aplikasi (jika tersedia).
- [ ] Hapus catatan uji dan pastikan masuk Trash.
- [ ] Pastikan catatan lain tetap dapat dibaca.

### B. Penolakan ID di luar storage
- [ ] Buat file teks dummy di luar `apps/KeepFlow/storage`.
- [ ] Uji pemanggilan `saveNote` dengan ID file dummy tersebut dari editor Apps Script (gunakan payload uji, jangan dari catatan penting).
- [ ] Pastikan eksekusi ditolak dengan pesan akses ditolak dan file dummy tidak berubah.
- [ ] Uji `deleteNote` terhadap ID file dummy tersebut.
- [ ] Pastikan eksekusi ditolak dan file dummy tidak masuk Trash.

Contoh payload uji (ganti `ID_FILE_DUMMY_DI_LUAR_KEEPFLOW` dengan ID file dummy):

```javascript
function testRejectExternalFile() {
  const id = 'ID_FILE_DUMMY_DI_LUAR_KEEPFLOW';
  const note = {
    id: id,
    title: 'Tidak boleh berubah',
    content: 'Uji keamanan',
    category: 'Umum',
    tags: []
  };

  let saveRejected = false;
  try {
    saveNote(note);
  } catch (error) {
    saveRejected = true;
    Logger.log('saveNote ditolak seperti yang diharapkan: ' + error.message);
  }
  if (!saveRejected) throw new Error('GAGAL: saveNote seharusnya menolak file di luar KeepFlow.');

  let deleteRejected = false;
  try {
    deleteNote(id);
  } catch (error) {
    deleteRejected = true;
    Logger.log('deleteNote ditolak seperti yang diharapkan: ' + error.message);
  }
  if (!deleteRejected) throw new Error('GAGAL: deleteNote seharusnya menolak file di luar KeepFlow.');
}
```

### C. Validasi payload
- [ ] Payload dengan `content` bukan string ditolak.
- [ ] Payload dengan `tags` bukan array ditolak.
- [ ] Judul lebih dari 180 karakter ditolak.
- [ ] Isi lebih dari 500.000 karakter ditolak.

### D. Struktur folder
- [ ] Pastikan hanya ada satu folder `apps` pada root Drive.
- [ ] Pastikan hanya ada satu folder `KeepFlow` di dalam `apps`.
- [ ] Pastikan hanya ada satu folder `storage` di dalam `KeepFlow`.
- [ ] Pastikan setiap file catatan berada langsung di storage atau di satu folder kategori langsung di bawah storage.
- [ ] Periksa file yang memiliki lebih dari satu parent Drive; file seperti ini akan ditolak oleh backend.

## Hasil yang diharapkan
- Operasi normal di dalam storage tetap berjalan.
- File di luar storage tidak dapat diubah atau dihapus melalui `saveNote`/`deleteNote`.
- Kegagalan validasi tidak membuat backend diam-diam membuat catatan baru.
- File dummy di luar KeepFlow tetap utuh.
