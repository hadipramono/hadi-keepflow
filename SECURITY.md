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

## Perlindungan yang ada
- HTML editor disanitasi dengan daftar tag yang diizinkan; atribut dibuang dan tautan dibatasi ke `http`, `https`, dan `mailto`.
- Backend hanya mengakses file di dalam folder penyimpanan KeepFlow atau folder kategori langsungnya.
- Operasi tulis memakai `LockService`, idempotency receipt, dan pengecekan konflik versi.
- Header `X-Frame-Options` bawaan Apps Script dipertahankan (tidak memakai `ALLOWALL`).

## Dependency eksternal
UI memuat Tailwind CSS, Font Awesome, dan JSZip dari CDN **tanpa Subresource Integrity (SRI)**. Kompromi pada CDN tersebut dapat memengaruhi aplikasi. Periksa dependency sebelum memperbarui versinya; lihat juga [`ROADMAP.md`](ROADMAP.md).

## Repository hygiene
Jangan commit file catatan pribadi, backup ZIP, token, private key, kredensial, atau identifier Drive pribadi. Gunakan data sintetis saat testing.

## Melaporkan kerentanan
Laporkan secara privat kepada pemilik repository (misalnya melalui GitHub Security Advisories) dan jangan membuka issue publik yang memuat detail eksploitasi atau data pribadi.
