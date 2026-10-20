# 📘 Panduan Lengkap Operasional: InterExam

Dokumen ini memuat panduan lengkap *step-by-step* untuk:
1. **Cara Mengambil Pembaruan Kode Terbaru (*Git Pull* & *Submodules*)**
2. **Cara Menyiapkan dan Menjalankan Aplikasi dari Awal (*Fresh Start*)**
3. **Cara Menambahkan Akun Gmail ke Database sebagai Admin / Role Lain**
4. **Cara Menjalankan Ngrok untuk Akses Publik**
5. **Panduan Membuat Google OAuth Client ID & Akun Midtrans Sandbox**

---

## DAFTAR ISI
1. [Bagian 1: Cara Git Pull & Update Submodule Terbaru](#bagian-1-cara-git-pull--update-submodule-terbaru)
2. [Bagian 2: Cara Menjalankan Aplikasi dari Nol (Fresh Setup)](#bagian-2-cara-menjalankan-aplikasi-dari-nol-fresh-setup)
3. [Bagian 3: Cara Menambahkan Akun Gmail ke Database (Role Admin)](#bagian-3-cara-menambahkan-akun-gmail-ke-database-role-admin)
4. [Bagian 4: Menjalankan Ngrok & Akses URL Admin](#bagian-4-menjalankan-ngrok--akses-url-admin)
5. [Bagian 5: Panduan Pembuatan Google OAuth Client ID](#bagian-5-panduan-pembuatan-google-oauth-client-id)
6. [Bagian 6: Panduan Pendaftaran & Kunci Midtrans Sandbox](#bagian-6-panduan-pendaftaran--kunci-midtrans-sandbox)

---

## Bagian 1: Cara Git Pull & Update Submodule Terbaru

Proyek InterExam menggunakan **Monorepo** yang menghubungkan dua repositori mandiri melalui **Git Submodules**:
* `apps/backend` ➔ `https://github.com/KrishnaWaradana/backend-interexam.git`
* `apps/frontend` ➔ `https://github.com/SumertaYasa/interexam-frontend.git`

Jika ada perubahan kode baru di GitHub (baik di root, backend, maupun frontend), ikuti urutan berikut:

### Opsi A: Update Otomatis Sekaligus (Direkomendasikan)
Buka terminal di root direktori (`interexam-main`):

```bash
# 1. Tarik pembaruan repositori root
git pull origin main

# 2. Tarik dan gabungkan pembaruan commit terbaru dari semua submodule
git submodule update --remote --merge
```

---

### Opsi B: Update Manual per Submodule
Jika ingin menarik perubahan spesifik pada salah satu branch:

```bash
# 1. Update Backend
cd apps/backend
git pull origin yasa-branch-back

# 2. Update Frontend
cd ../frontend
git pull origin yasa-branch-new

# 3. Kembali ke root
cd ../..
```

---

### ⚠️ Tindakan Wajib Setelah Git Pull (Bila Ada Perubahan Struktur):
1. **Jika ada perubahan skema database (`schema.prisma` di backend):**
   ```bash
   cd apps/backend
   npx prisma generate
   npx prisma migrate deploy
   ```
2. **Jika ada penambahan library baru (`package.json`):**
   ```bash
   # Di backend:
   cd apps/backend && npm install

   # Di frontend:
   cd apps/frontend/frontend && npm install
   ```

---

## Bagian 2: Cara Menjalankan Aplikasi dari Nol (Fresh Setup)

Gunakan panduan ini jika Anda baru saja clone repositori di komputer baru atau ingin menyalakan ulang setelah restart komputer.

### Prasyarat:
* **Node.js**: Versi `20.x` atau `22.x` (cek dengan `node -v`).
* **PostgreSQL**: Pastikan layanan PostgreSQL aktif di port `5432` (cek dengan `psql -U postgres -h localhost -p 5432 -c "\l"`).

---

### Langkah 1: Persiapan Database PostgreSQL
Buka PowerShell / Command Prompt:

```powershell
# Buat database 'interexam' jika belum pernah dibuat
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE interexam;"
```

---

### Langkah 2: Konfigurasi Berkas Lingkungan (.env)

#### A. Backend (`apps/backend/.env`)
Pastikan berkas `apps/backend/.env` memiliki konfigurasi database yang benar:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES_ANDA@localhost:5432/interexam?schema=public"
JWT_SECRET="bebas_isi_string_rahasia_acak_minimal_32_karakter"
GOOGLE_CLIENT_ID="isi_client_id_google_anda.apps.googleusercontent.com"
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxx"
```
*(Ganti `PASSWORD_POSTGRES_ANDA` dengan password akun PostgreSQL lokal Anda).*

#### B. Frontend (`apps/frontend/frontend/.env`)
Pastikan berkas `apps/frontend/frontend/.env` mengarah ke backend:
```env
VITE_API_BASE_URL="http://localhost:5000/api/v1"
VITE_GOOGLE_CLIENT_ID="isi_client_id_google_anda.apps.googleusercontent.com"
VITE_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxx"
```

---

### Langkah 3: Generate Prisma Client & Terapkan Migrasi

Buka terminal di folder backend:
```powershell
cd apps/backend

# 1. Sinkronisasi Prisma Client
npx prisma generate

# 2. Terapkan seluruh tabel ke database
npx prisma migrate deploy

# 3. (Opsional) Isi data awal (Kategori, Jenjang, Soal-Soal latihan)
node prisma/seed.js
```

---

### Langkah 4: Jalankan Aplikasi (2 Terminal Terpisah)

> [!IMPORTANT]
> **JANGAN** jalankan `npm run dev` dari folder root `interexam-main` karena subfolder frontend berada di `apps/frontend/frontend`. Buka **2 tab terminal terpisah**:

#### Terminal 1 — Backend Express API:
```bash
cd apps/backend
npm run dev
```
* **Status:** Aktif di `http://localhost:5000`
* **Log Sukses:** `✅ Server Express berjalan di http://localhost:5000`

#### Terminal 2 — Frontend React Router:
```bash
cd apps/frontend/frontend
npm run dev
```
* **Status:** Aktif di `http://localhost:5173`
* **Log Sukses:** `➜ Local: http://localhost:5173/`

Buka browser ke: **`http://localhost:5173`**.

---

## Bagian 3: Cara Menambahkan Akun Gmail ke Database (Role Admin)

Sistem InterExam memisahkan tabel **`subscribers`** (siswa/peserta ujian biasa) dan tabel **`users`** (staff internal: `Admin`, `Validator`, `Contributor`). 

Jika akun Gmail Anda belum terdaftar di tabel `users` dengan status `Verified`, Anda tidak akan bisa masuk ke halaman dashboard admin.

---

### Cara 1: Menggunakan Skrip Otomatis (Paling Cepat & Praktis) ⭐
Kami telah menyediakan skrip pembantu di folder `apps/backend/scripts/add-user.js`.

Buka terminal di `apps/backend`, lalu jalankan:

```bash
# Format: node scripts/add-user.js <email> [role] [nama]

# Contoh 1: Tambah Admin
node scripts/add-user.js emailanda@gmail.com Admin "Nama Lengkap Anda"

# Contoh 2: Tambah Validator Soal
node scripts/add-user.js validator@gmail.com Validator "Nama Validator"

# Contoh 3: Tambah Kontributor Pembuat Soal
node scripts/add-user.js pembuatsoal@gmail.com Contributor "Nama Kontributor"
```

*Skrip ini secara otomatis akan:*
1. Membersihkan email dari tabel `subscribers` jika sebelumnya pernah terdaftar sebagai siswa (mencegah error konflik role).
2. Menambahkan/memperbarui data ke tabel `users` dengan role yang dipilih dan status **`Verified`**.
3. Mencatat riwayat ke tabel `user_status`.

---

### Cara 2: Menggunakan Antarmuka Visual (Prisma Studio)
Jika Anda ingin mengedit atau melihat data pengguna secara visual lewat browser:

1. Buka terminal di folder backend:
   ```bash
   cd apps/backend
   npx prisma studio
   ```
2. Buka browser di: `http://localhost:5555`.
3. Klik model **`Users`**.
4. Klik **Add record**:
   * `email_user`: masukkan alamat Gmail (misal: `contoh@gmail.com`)
   * `nama_user`: nama Anda
   * `username`: username unik
   * `role`: pilih **`Admin`**
   * `status`: pilih **`Verified`**
5. Klik **Save 1 change**.

---

### Cara 3: Melalui Perintah Query SQL (psql)
Jika ingin memasukkan langsung via SQL prompt:

```sql
psql -U postgres -d interexam -c "INSERT INTO users (email_user, nama_user, username, role, status) VALUES ('emailanda@gmail.com', 'Admin Yasa', 'admin_yasa', 'Admin', 'Verified') ON CONFLICT (email_user) DO UPDATE SET role = 'Admin', status = 'Verified';"
```

---

## Bagian 4: Menjalankan Ngrok & Akses URL Admin

Jika Anda ingin mengakses aplikasi atau mendemokannya ke luar localhost:

### 1. Menjalankan Ngrok
Buka terminal baru:
```powershell
ngrok http 5173
```
*Salin URL publik yang muncul (contoh: `https://xxxx.ngrok-free.dev`).*

---

### 2. Daftar URL Penting InterExam

| Halaman | URL Lokal | URL via Ngrok (Contoh) | Keterangan |
|---|---|---|---|
| **Landing Page** | `http://localhost:5173` | `https://xxxx.ngrok-free.dev` | Halaman beranda publik & paket ujian |
| **Login Siswa** | `http://localhost:5173/login` | `https://xxxx.ngrok-free.dev/login` | Login peserta / subscriber |
| **Login Admin** | `http://localhost:5173/login-internal` | `https://xxxx.ngrok-free.dev/login-internal` | **Login khusus Admin / Staff** |
| **Dashboard Admin** | `http://localhost:5173/dashboard` | `https://xxxx.ngrok-free.dev/dashboard` | Manajemen bank soal, user, dll |
| **Bank Soal** | `http://localhost:5173/dashboard/bank-soal` | `https://xxxx.ngrok-free.dev/dashboard/bank-soal` | Halaman manajemen bank soal |
| **API Backend** | `http://localhost:5000/api/v1` | - | Endpoint REST API Express |

---

## Bagian 5: Panduan Pembuatan Google OAuth Client ID

Google Client ID diperlukan agar fitur **Login with Google** berfungsi di halaman login siswa (`/login`) maupun login admin (`/login-internal`).

### Langkah 1: Masuk ke Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Login menggunakan akun Google Anda.
3. Di bilah navigasi atas, klik pemilih proyek (*Project Selector*), lalu klik **New Project**.
4. Beri nama proyek, misalnya: **InterExam CBT**, lalu klik **Create**.

---

### Langkah 2: Konfigurasi OAuth Consent Screen
1. Pada menu sebelah kiri, masuk ke **APIs & Services** ➔ **OAuth consent screen**.
2. Pilih User Type: **External**, lalu klik **Create**.
3. **App Information:**
   * **App name:** `InterExam CBT`
   * **User support email:** Pilih email Anda.
   * **Developer contact information:** Masukkan email Anda.
   * Klik **Save and Continue**.
4. **Scopes:** Klik **Add or Remove Scopes**, centang:
   * `.../auth/userinfo.email`
   * `.../auth/userinfo.profile`
   * `openid`
   * Klik **Update**, lalu klik **Save and Continue**.
5. **Test users:**
   * Klik **+ ADD USERS**.
   * Masukkan email Gmail yang akan digunakan untuk pengujian (misal: `yasa8spasi@gmail.com`).
   * Klik **Save and Continue**, lalu **Back to Dashboard**.

---

### Langkah 3: Membuat OAuth 2.0 Client ID
1. Pada menu sebelah kiri, klik **Credentials**.
2. Di bagian atas, klik **+ CREATE CREDENTIALS** ➔ pilih **OAuth client ID**.
3. **Application type:** Pilih **Web application**.
4. **Name:** Beri nama `InterExam Web Client`.
5. **Authorized JavaScript origins (SANGAT PENTING):**
   Tambahkan URL asal berikut agar tombol login tidak diblokir browser:
   * `http://localhost:5173`
   * `http://localhost:3000`
   * `http://127.0.0.1:5173`
   * *(Jika memakai Ngrok, tambahkan juga URL ngrok Anda, misal: `https://unaskable-marianne-meningeal.ngrok-free.dev`)*.
6. **Authorized redirect URIs:**
   * `http://localhost:5173`
   * `http://localhost:5173/login`
   * `http://localhost:5173/login-internal`
   * *(Jika memakai Ngrok, tambahkan juga URL redirect ngrok)*.
7. Klik **Create**.

---

### Langkah 4: Salin Client ID ke Berkas `.env`
Sebuah pop-up akan menampilkan **Your Client ID** (berakhir dengan `.apps.googleusercontent.com`):

1. Buka `apps/backend/.env`:
   ```env
   GOOGLE_CLIENT_ID="1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
   ```
2. Buka `apps/frontend/frontend/.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID="1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
   ```
3. Restart dev server frontend (`npm run dev`) agar Vite memuat variabel lingkungan yang baru.

---

## Bagian 6: Panduan Pendaftaran & Kunci Midtrans Sandbox

Midtrans digunakan untuk simulasi pembayaran paket soal atau langganan berbayar menggunakan lingkungan uji coba (**Sandbox** tanpa uang sungguhan).

### Langkah 1: Registrasi Akun Midtrans
1. Buka [Midtrans Registration](https://dashboard.midtrans.com/register).
2. Daftarkan akun baru menggunakan email Anda.
3. Setelah berhasil verifikasi dan login, perhatikan sudut kiri atas dashboard:
   👉 **Pastikan mode beralih ke "SANDBOX"** (biasanya ditandai badge kuning/oranye bertuliskan *Sandbox*). Jangan gunakan *Production*.

---

### Langkah 2: Mengambil API Access Keys
1. Di bilah menu sebelah kiri, buka **Settings** ➔ **Access Keys**.
2. Anda akan melihat dua kunci penting:
   * **Client Key** (diawali dengan `SB-Mid-client-...`)
   * **Server Key** (diawali dengan `SB-Mid-server-...`)

---

### Langkah 3: Masukkan Kunci ke Berkas `.env`

#### A. Di Backend (`apps/backend/.env`):
```env
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxxxxxxxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxxxxxxxxxx"
```

#### B. Di Frontend (`apps/frontend/frontend/.env`):
```env
VITE_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxxxxxxxxxx"
```

---

### Langkah 4: Pengaturan Webhook / Notification URL (Opsional untuk Dev)
Agar status transaksi otomatis berubah menjadi `success` setelah simulasi bayar:
1. Di Dashboard Midtrans Sandbox, buka **Settings** ➔ **Configuration**.
2. Pada field **Payment Notification URL**, isi:
   * Jika lokal menggunakan ngrok: `https://xxxx.ngrok-free.dev/api/v1/payment/notification`
3. Klik **Save Changes**.

---

### 💳 Data Kartu Kredit Uji Coba Midtrans Sandbox (Testing Cards)
Saat mencoba simulasi pembayaran kartu kredit di popup Snap Midtrans, gunakan nomor kartu uji coba resmi:
* **Card Number:** `4811 1111 1111 1114`
* **Valid Thru / Expiry:** Sembarang bulan/tahun di masa depan (misal: `12/28`)
* **CVV:** `123`
* **Kode OTP SMS:** `112233`
