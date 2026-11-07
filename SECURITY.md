# Security & privacy

## Model penggunaan
Hadi KeepFlow dirancang sebagai aplikasi personal/single-user. Aplikasi belum menyediakan autentikasi aplikasi, role, tenant isolation, atau otorisasi per pengguna.

Rekomendasi deployment:
- Setiap pengguna membuat Apps Script project sendiri.
- Deploy sebagai **Execute as: Me** dan batasi akses ke **Only myself**.
- Jangan mengekspos deployment milik Anda kepada publik.

## Penyimpanan data
- Catatan persisten disimpan di Google Drive.
- Cache, draft, preferensi, dan antrean operasi disimpan di LocalStorage browser.
- Konten catatan tidak dienkripsi oleh aplikasi.
- Backup ZIP dapat berisi seluruh isi catatan; perlakukan sebagai data pribadi.

## Repository hygiene
Jangan commit file catatan pribadi, backup ZIP, token, private key, kredensial, atau identifier Drive pribadi. Gunakan data sintetis saat testing. Periksa dependency eksternal sebelum memperbaruinya.
