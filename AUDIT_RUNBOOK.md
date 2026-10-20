# InterExam - Audit Repositori & Panduan Pemulihan Lingkungan Pengembangan (Runbook)

Dokumen ini berisi hasil audit teknis mendalam terhadap repositori **InterExam** (platform ujian online berbasis komputer / CBT) setelah periode tidak aktif selama kurang lebih 8 bulan. Dokumen ini dirancang sebagai panduan praktis (*runbook*) untuk memverifikasi prasyarat, menyiapkan lingkungan lokal, dan menjalankan kembali aplikasi secara aman dan terukur.

---

## 1. Ringkasan Eksekutif (Executive Summary)

- **Jenis Proyek:** Monorepo platform Computer-Based Test (CBT) skala penuh yang menggabungkan backend REST API dan frontend modern.
- **Tumpukan Teknologi Utama:**
  - **Backend:** Node.js, Express.js (v5.1/5.2), Prisma ORM (v5.22), PostgreSQL 18, JWT, Nodemailer, Midtrans Payment Gateway, Google Auth Library.
  - **Frontend:** React Router v7 (SSR Mode), React 19, Vite 7, Tailwind CSS v4, TypeScript 5.9, GSAP Animation, Flowbite React.
  - **Monorepo Orchestrator:** Turborepo v2.6.0 & Git Submodules.
  - **Testing:** Selenium WebDriver + ChromeDriver.
- **Status Kesiapan Lingkungan:** **`READY FOR SETUP`**
  - Mesin lokal saat ini telah terverifikasi memiliki **Node.js v22.13.0**, **npm 10.9.2**, **Git 2.42.0**, dan service **PostgreSQL 18.6** (`postgresql-x64-18`) yang berjalan aktif pada port `5432`.
- **Temuan Kritis Utama:** Submodule frontend berada di jalur bertingkat `apps/frontend/frontend`. Hal ini menyebabkan deklarasi root workspace `apps/*` di `package.json` tidak mendeteksi frontend. Aplikasi backend dan frontend saat ini **wajib dijalankan melalui dua sesi terminal terpisah** (bukan melalui root `npm run dev`).

---

## 2. Gambaran Arsitektur & Struktur Repositori

### 2.1. Peta Struktur Repositori
```
interexam-main/ (Root Orchestrator - Branch: main)
├── .gitmodules                 # Definisi Git Submodule backend & frontend
├── turbo.json                  # Konfigurasi Turborepo pipeline/tasks
├── package.json                # Root package manifest & workspace definition
├── tests/                      # Automated E2E testing suite
│   ├── README.md               # Dokumentasi testing Selenium
│   └── selenium/
│       ├── config.js           # Konfigurasi WebDriver & Base URL (port 5173)
│       └── loginInternal.test.js # Test suite Login Google & Internal
├── apps/
│   ├── backend/                # Submodule: KrishnaWaradana/backend-interexam (Branch: yasa-branch-back)
│   │   ├── prisma/             # Schema Prisma (24 model) & 28 berkas migrasi
│   │   ├── src/                # Express API routes, controllers, middleware
│   │   ├── uploads/            # Direktori berkas statis (photos, questions, events, paket)
│   │   ├── package.json        # Manifest backend Express
│   │   └── user_test.http      # Koleksi pengujian endpoint REST Client
│   └── frontend/               # Submodule: SumertaYasa/interexam-frontend (Branch: yasa-branch-new)
│       └── frontend/           # Direktori aplikasi React Router v7 sebenarnya
│           ├── app/            # Source code frontend (routes, components, services)
│           ├── vite.config.ts  # Konfigurasi Vite & Tailwind CSS v4
│           └── package.json    # Manifest frontend React Router v7
```

### 2.2. Diagram Alur Sistem
```mermaid
graph TD
    User([Pengguna / Browser]) -->|Port 5173 (HTTP/HMR)| Frontend[Frontend App - React 19 + React Router v7]
    Frontend -->|REST API :5000 /api/v1| Backend[Backend App - Express.js v5]
    Backend -->|Prisma Engine| DB[(PostgreSQL 18 - DB: interexam)]
    Backend -->|Auth Verification| Google[Google OAuth 2.0 API]
    Backend -->|Snap Transaction| Midtrans[Midtrans Payment Gateway]
    Backend -->|SMTP Protocol| Email[Nodemailer Mail Server]
    Backend -->|Static Files| Storage[Local Disk: apps/backend/uploads]
```

---

## 3. Matriks Kebutuhan Lingkungan Pengembangan

| Perangkat Lunak / Tool | Versi Dibutuhkan | Sumber Bukti | Status di Mesin Host | Tindakan yang Harus Dilakukan |
|---|---|---|---|---|
| **Node.js** | `>= 20.x` / `22.x` | `devDependencies.@types/node: ^22` | **v22.13.0** (Terpasang) | Tidak ada tindakan. Versi sudah kompatibel. |
| **npm** | `>= 10.x` | `package-lock.json` format v3 | **10.9.2** (Terpasang) | Gunakan npm untuk eksekusi skrip direktori. |
| **PostgreSQL** | `14.x - 18.x` | `schema.prisma` (`provider = "postgresql"`) | **PostgreSQL 18.6** (Service aktif di port 5432) | Pastikan database bernama `interexam` sudah dibuat. |
| **Git** | `>= 2.30` | Repositori dengan submodules | **2.42.0.windows.2** (Terpasang) | Tidak ada tindakan. |
| **Turborepo** | `^2.6.0` | Root `package.json` | Terpasang di root devDependencies | Opsional. Jalankan aplikasi via terminal terpisah. |
| **Google Chrome** | Versi stabil terbaru | `chromedriver: ^149.0.0` di root | Terpasang | Opsional. Hanya digunakan saat pengujian Selenium. |

---

## 4. Konfigurasi & Variabel Lingkungan (.env)

> [!WARNING]
> Nilai kredensial sebenarnya (password, API keys, JWT secrets) tidak boleh dipublikasikan ke Git publik. Pastikan berkas `.env` ada di subdirektori masing-masing dan diabaikan oleh `.gitignore`.

### 4.1. Backend (`apps/backend/.env`)

| Variabel | Sifat | Kegunaan | Format / Contoh Default Aman | Sumber Nilai Resmi |
|---|---|---|---|---|
| `PORT` | Opsional | Port listen server Express API | `5000` | Port bebas di sistem lokal (default kode: 5000). |
| `DATABASE_URL` | **Wajib** | String koneksi PostgreSQL untuk Prisma | `postgresql://postgres:password@localhost:5432/interexam?schema=public` | Username & password PostgreSQL lokal Anda. |
| `JWT_SECRET` | **Wajib** | Kunci enkripsi token otentikasi JWT | String acak berkekuatan tinggi | Dibuat manual oleh developer untuk keamanan sesi. |
| `JWT_EXPIRES_IN` | Opsional | Masa berlaku token login | `1d` atau `7d` | Konfigurasi sesi backend. |
| `GOOGLE_CLIENT_ID`| Fitur OAuth | Verifikasi token OAuth dari Google | `*.apps.googleusercontent.com` | Google Cloud Console (OAuth Credentials). |
| `MIDTRANS_SERVER_KEY`| Fitur Bayar | Kunci transaksi server Midtrans | `SB-Mid-server-*` | Dashboard Akun Midtrans Sandbox. |
| `MIDTRANS_CLIENT_KEY`| Fitur Bayar | Kunci publik client Midtrans | `SB-Mid-client-*` | Dashboard Akun Midtrans Sandbox. |
| `EMAIL_USER` | Fitur Email | Email pengirim SMTP verifikasi | `nama@gmail.com` | Email pengembang / admin sistem. |
| `EMAIL_PASS` | Fitur Email | Sandi aplikasi (App Password) SMTP | 16 digit Google App Password | Pengaturan keamanan akun Google. |

### 4.2. Frontend (`apps/frontend/frontend/.env`)

| Variabel | Sifat | Kegunaan | Format / Contoh Default Aman | Sumber Nilai Resmi |
|---|---|---|---|---|
| `VITE_API_BASE_URL` | **Wajib** | URL dasar endpoint API Express | `http://localhost:5000/api/v1` | Menyesuaikan port server backend Express. |
| `VITE_GOOGLE_CLIENT_ID`| Fitur OAuth | Inisialisasi tombol login Google di frontend | Sama dengan `GOOGLE_CLIENT_ID` di backend | Google Cloud Console. |
| `VITE_MIDTRANS_CLIENT_KEY`| Fitur Bayar | Inisialisasi skrip popup Snap Midtrans | Sama dengan `MIDTRANS_CLIENT_KEY` di backend | Dashboard Midtrans Sandbox. |

---

## 5. Panduan Instalasi & Inisialisasi (Step-by-Step Runbook)

### Langkah 1: Verifikasi & Pembuatan Database PostgreSQL
Buka PowerShell atau Command Prompt, lalu pastikan database `interexam` tersedia:
```powershell
# 1. Cek daftar database di PostgreSQL lokal
psql -U postgres -h localhost -p 5432 -c "\l"

# 2. Jika database 'interexam' belum ada, buat database baru:
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE interexam;"
```

### Langkah 2: Sinkronisasi Skema Database via Prisma
Pindah ke direktori backend:
```bash
cd apps/backend

# 1. Generate Prisma Client lokal
npx prisma generate

# 2. Terapkan 28 berkas migrasi ke database (Non-destruktif, tidak menghapus data)
npx prisma migrate deploy

# 3. (Opsional) Lakukan Seeding data awal (Kategori, Subject, User, dan 50 Soal)
node prisma/seed.js
```

> [!CAUTION]
> **Jangan jalankan `npx prisma migrate reset`**, karena perintah tersebut akan menghapus seluruh isi database yang ada.

### Langkah 3: Verifikasi Dependensi (Bila Diperlukan)
Jika folder `node_modules` belum lengkap atau rusak:
```bash
# Backend
cd apps/backend
npm install

# Frontend
cd apps/frontend/frontend
npm install
```

---

## 6. Cara Menjalankan Aplikasi (Local Development)

Jalankan aplikasi menggunakan **dua terminal terpisah**:

### Terminal 1 — Backend API
```bash
cd apps/backend
npm run dev
```
- **Port:** `http://localhost:5000`
- **Tanda Berhasil:** Muncul log terminal: `✅ Server Express berjalan di http://localhost:5000`.
- **Verifikasi Endpoint:** Buka browser di `http://localhost:5000/api/v1/categories`.

### Terminal 2 — Frontend Application
```bash
cd apps/frontend/frontend
npm run dev
```
- **Port:** `http://localhost:5173`
- **Tanda Berhasil:** Muncul pesan: `VITE v7.1.7 ready in ... ms` dan tautan `➜ Local: http://localhost:5173/`.
- **Verifikasi UI:** Buka browser di `http://localhost:5173`.

---

## 7. Rencana Pengujian & Smoke Test

1. **Uji Fungsional Endpoint API (REST Client):**
   - Buka berkas `apps/backend/user_test.http` di VS Code (dengan ekstensi REST Client) untuk menguji alur pembuatan user, manajemen role, dan dropdown data.
   - Perhatikan bahwa baseUrl backend adalah `http://localhost:5000/api/v1`.
2. **Uji Validasi Kode Frontend (Typecheck & Build):**
   ```bash
   cd apps/frontend/frontend
   # Pemeriksaan tipe data TypeScript
   npm run typecheck

   # Uji kompilasi bundel produksi SSR
   npm run build
   ```
3. **Uji Otomatis Login E2E (Selenium WebDriver):**
   Setelah backend (:5000) dan frontend (:5173) berjalan:
   ```bash
   # Jalankan test internal Selenium langsung via Node:
   node tests/selenium/loginInternal.test.js

   # Atau mode headless tanpa membuka jendela browser:
   $env:HEADLESS="true"; node tests/selenium/loginInternal.test.js
   ```

---

## 8. Daftar Risiko & Rencana Penanganan (Priority Issues)

| Prioritas | Temuan Masalah | Lokasi Bukti | Dampak | Rekomendasi Solusi |
|---|---|---|---|---|
| **P1** | Submodule Frontend berada di subfolder `apps/frontend/frontend` | `apps/frontend` | Root `npm run dev` / `turbo dev` tidak menyalakan frontend | Jalankan frontend langsung dari foldernya. Ke depan, ubah workspace di root `package.json` menjadi `"apps/*/*"`. |
| **P1** | Skrip root `"test:login"` mengarah ke file fiktif | Root `package.json:L8` | `npm run test:login` error: `Cannot find module` | Perbarui skrip root menjadi `"test:login": "node tests/selenium/loginInternal.test.js"`. |
| **P2** | 200+ dependensi backend tertumpuk di root `package.json` | Root `package.json:L24-215` | Hoisting dependensi monorepo membengkak | Bersihkan dependensi di root yang sudah ada di `apps/backend/package.json` setelah sistem stabil. |
| **P2** | Skema Turborepo menggunakan format lama `"pipeline"` | `turbo.json:L3` | Muncul pesan peringatan depresiasi pada Turborepo 2.x | Ganti `"pipeline"` menjadi `"tasks"` di `turbo.json`. |
| **P2** | Berkas statis di `uploads/photos` & `uploads/questions` terhapus | Submodule `apps/backend` git status | Gambar aset soal/pembahasan lama mungkin 404 | Pastikan direktori `uploads/` memiliki izin baca/tulis saat mengunggah soal baru. |

---

## 9. Panduan Pemecahan Masalah (Troubleshooting)

- **PostgreSQL Connection Error (`P1001: Can't reach database server`):**
  - Pastikan service Windows `postgresql-x64-18` menyala (`Get-Service *postgres*`).
  - Periksa kecocokan password di `DATABASE_URL` pada `apps/backend/.env`.
- **Table Missing Error (`P2021: The table ... does not exist`):**
  - Migrasi belum diaplikasikan. Jalankan `npx prisma migrate deploy` di `apps/backend`.
- **CORS Error pada Browser Console:**
  - Backend mengizinkan origin: `http://localhost:5173`, `http://localhost:3000`, dan `http://127.0.0.1:5173`. Pastikan frontend berjalan pada port tersebut.
- **Port 5000 / 5173 Already In Use:**
  - Cek proses yang menduduki port:
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess
    ```
  - Matikan proses tersebut sebelum menyalakan server.

---

## 10. Roadmap Pemulihan (Next Steps)

1. **Tahap 1:** Pastikan database `interexam` dibuat di PostgreSQL dan jalankan migrasi Prisma (`npx prisma migrate deploy`).
2. **Tahap 2:** Buka 2 terminal dan jalankan backend (`apps/backend`) dan frontend (`apps/frontend/frontend`).
3. **Tahap 3:** Lakukan smoke test melalui browser di `http://localhost:5173` dan login menggunakan user seeder (`admin@seeder.com` / `PasswordTest123`).
4. **Tahap 4:** Setelah fungsionalitas berjalan normal, lakukan perapian konfigurasi monorepo root (`turbo.json`, `workspaces`, dan skrip testing).
