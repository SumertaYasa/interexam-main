# 📋 Ringkasan Eksekutif & Quick Runbook: InterExam

> **TL;DR:** Proyek siap dijalankan (**READY FOR SETUP**). Mesin lokal sudah memiliki **Node.js v22** dan **PostgreSQL 18** aktif. Kunci utama peluncuran: **jalankan backend dan frontend di 2 terminal terpisah** karena struktur submodule frontend bertingkat (`apps/frontend/frontend`).

---

## 1. Profil Singkat Proyek
* **Nama:** InterExam (Platform CBT / Tryout & Ujian Online).
* **Arsitektur:** Monorepo (Turborepo + Git Submodules).
* **Backend:** Express.js v5 + Prisma ORM v5.22 + PostgreSQL 18 (Port `5000`).
* **Frontend:** React 19 + React Router v7 (SSR) + Vite 7 + Tailwind CSS v4 (Port `5173`).
* **Status Lingkungan Host:** 
  * Node.js: `v22.13.0` (Terpasang)
  * npm: `10.9.2` (Terpasang)
  * PostgreSQL: `18.6` (Service `postgresql-x64-18` aktif di port 5432)

---

## 2. Temuan Kritis (Wajib Diketahui Tim)
1. **Frontend Tidak Terdeteksi oleh Root `npm run dev`:**
   Repositori frontend ditaruh pada `apps/frontend/frontend`. Akibatnya, perintah monorepo di root hanya menyalakan backend. **Solusi:** Buka terminal terpisah untuk frontend.
2. **Database PostgreSQL:**
   Membutuhkan database bernama `interexam` dan eksekusi migrasi Prisma sebelum backend dapat memproses data.
3. **Layanan Pihak Ketiga (Opsional untuk Dev Dasar):**
   Google OAuth, Midtrans (Payment), dan SMTP Email sudah terintegrasi di kode, namun tidak memblokir startup halaman utama jika belum dikonfigurasi.

---

## 3. Quick Start Guide (3 Langkah Menyalakan Aplikasi)

### Langkah 1: Persiapan Database PostgreSQL
Buka terminal dan pastikan database serta migrasi sudah terpasang:
```powershell
# Buat database jika belum ada
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE interexam;"

# Terapkan skema & migrasi tabel
cd apps/backend
npx prisma generate
npx prisma migrate deploy

# (Opsional) Isi data master kategori & 50 soal awal
node prisma/seed.js
```

### Langkah 2: Jalankan Backend (Terminal 1)
```bash
cd apps/backend
npm run dev
```
* Akses API: `http://localhost:5000`
* Cek status: `http://localhost:5000/api/v1/categories`

### Langkah 3: Jalankan Frontend (Terminal 2)
```bash
cd apps/frontend/frontend
npm run dev
```
* Buka browser: `http://localhost:5173`

---

## 4. Matriks Konfigurasi Singkat (.env)

| Variabel Kunci | Lokasi | Nilai Default Pengembangan |
|---|---|---|
| `DATABASE_URL` | `apps/backend/.env` | `postgresql://postgres:password@localhost:5432/interexam?schema=public` |
| `JWT_SECRET` | `apps/backend/.env` | *(String acak pengembang)* |
| `PORT` | `apps/backend/.env` | `5000` |
| `VITE_API_BASE_URL` | `apps/frontend/frontend/.env` | `http://localhost:5000/api/v1` |

---

## 5. Kontak Dokumen Lengkap
Untuk detail arsitektur mendalam, checklist troubleshooting, dan daftar 24 entitas database, lihat:
👉 **[AUDIT_RUNBOOK.md](./AUDIT_RUNBOOK.md)**
