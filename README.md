# Bengkel Las Putra Iing Jaya — Company Profile & CMS Platform

Platform web full-stack untuk **Bengkel Las Putra Iing Jaya Stainless & Besi Bandung Barat**, dibangun menggunakan **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, dan **SQLite (`better-sqlite3`)**.

Website ini mencakup halaman profil perusahaan, katalog layanan fabrikasi besi dan stainless steel, galeri portofolio proyek dengan lightbox, artikel edukasi berpaginasi, kalkulator estimasi biaya interaktif, portal pelacakan progres proyek klien, serta panel **Admin CMS** lengkap untuk mengelola seluruh konten secara dinamis tanpa mengubah kode.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Arsitektur Halaman & API](#arsitektur-halaman--api)
- [Struktur Proyek](#struktur-proyek)
- [Skema Database SQLite](#skema-database-sqlite)
- [Cara Menjalankan Secara Lokal](#cara-menjalankan-secara-lokal)
- [Akses Portal Demo](#akses-portal-demo)
- [Catatan Deployment & Keamanan](#catatan-deployment--keamanan)

---

## Fitur Utama

### Website Publik
- **Beranda (`/`)**: Carousel hero otomatis bertransisi halus dengan slide yang dapat dikelola dari Admin, ringkasan statistik bengkel, pratinjau layanan unggulan, galeri proyek terbaru, artikel terbaru (maksimal 6 per halaman dengan paginasi bernomor), FAQ, dan testimoni pelanggan.
- **Tentang Kami (`/tentang-kami`)**: Profil bengkel, visi & standar pengerjaan, serta galeri workshop.
- **Layanan (`/layanan`)**: Katalog layanan (*Kanopi, Pagar, Railing Stainless 304, Tangga Putar, Konstruksi WF, Teralis, hingga kategori **Lainnya** & kategori kustom*) yang terhubung langsung dengan database serta **Kalkulator Estimasi Biaya** interaktif (`src/components/CostEstimator.tsx`) yang langsung terhubung ke WhatsApp.
- **Galeri Proyek (`/galeri`)**: Portofolio dokumentasi hasil pengerjaan dengan filter kategori dinamis (termasuk **Lainnya** & kategori kustom dari Admin) serta modal **Lightbox** resolusi penuh.
- **Artikel (`/artikel`)**: Artikel edukasi seputar material besi & perawatan dengan fitur pencarian, pembacaan detail dalam modal, dan **paginasi bernomor** (maksimal 6 kartu per halaman).
- **Kontak (`/kontak`)**: Formulir konsultasi dan pemesanan survei yang tersimpan ke SQLite (`contact_messages`) sekaligus integrasi WhatsApp dan Google Maps.
- **Pencarian Global**: Modal pencarian cepat (`src/components/SearchModal.tsx`) untuk menelusuri layanan, artikel, dan proyek.

### Portal Klien & Panel Admin CMS
- **Portal Masuk Terpadu (`/login`)**: Mendukung autentikasi **Klien** (pelacakan progres proyek via `/client/dashboard`) dan **Administrator** (`/admin/login` -> `/admin`).
- **Panel Admin (`/admin`)**:
  - **Sidebar Sticky Independen**: Navigasi kiri tetap statis sementara area konten utama dapat di-scroll dengan nyaman (`src/app/admin/layout.tsx`).
  - **Kelola Halaman & Banner (`/admin/pages`)**: Edit teks konten, slide hero carousel, subheader banner, foto utama Tentang Kami, serta banner split di beranda (`banner_split_image`).
  - **Kelola Foto & Galeri (`/admin/photos`)**: Unggah foto baru, kelola filter, serta **Kelola Kategori Galeri** (tambah kategori baru, edit nama kategori inline, hapus kategori, dan dukungan kategori **Lainnya**).
  - **Kelola Layanan (`/admin/services`)**: Tambah/hapus item layanan beserta foto & estimasi harga, serta **Kelola Kategori Layanan** (tambah, edit nama, hapus, dan dukungan kategori **Lainnya**).
  - **Kelola Artikel (`/admin/articles`)**: Tambah, edit, dan hapus artikel blog secara terpusat di panel Admin.
  - **Pengaturan Kontak (`/admin/settings`)**: Pengaturan nomor telepon, WhatsApp API, alamat workshop, email, dan jam operasional.
  - **Koneksi DBeaver (`/admin/database`)**: Panduan dan informasi jalur file `database/bengkel.db` untuk inspeksi langsung via DBeaver.

---

## Teknologi yang Digunakan

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js 14 (`App Router`) |
| Bahasa | TypeScript 5 & React 18 |
| Styling | Tailwind CSS 3 (`clsx`, `tailwind-merge`) |
| Animasi & Ikon | Framer Motion 11 & Lucide React |
| Database | SQLite via `better-sqlite3` (`WAL mode`) |

---

## Arsitektur Halaman & API

### Rute Halaman (`src/app`)
- **Publik**: `/`, `/tentang-kami`, `/layanan`, `/galeri`, `/artikel`, `/kontak`, `/login`, `/client/dashboard`
- **Admin CMS**: `/admin`, `/admin/login`, `/admin/pages`, `/admin/photos`, `/admin/services`, `/admin/articles`, `/admin/settings`, `/admin/database`
- **SEO & Metadata**: `/robots.txt` (`src/app/robots.ts`), `/sitemap.xml` (`src/app/sitemap.ts`)

### Endpoint API (`src/app/api`)
| Endpoint | Metode | Deskripsi |
| --- | --- | --- |
| `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` | `POST`, `GET` | Autentikasi sesi admin berbasis cookie `admin_session` |
| `/api/auth/client-login`, `/api/auth/client-logout` | `POST` | Autentikasi portal pelacakan proyek klien |
| `/api/content` | `GET`, `PUT` | Manajemen konten dinamis per halaman (`page_contents`) |
| `/api/categories` | `GET`, `POST`, `PUT`, `DELETE` | Manajemen kategori `layanan` dan `galeri` |
| `/api/services` | `GET`, `POST`, `DELETE` | CRUD katalog layanan fabrikasi |
| `/api/photos` | `GET`, `POST`, `DELETE` | Manajemen foto portofolio galeri |
| `/api/articles` | `GET`, `POST`, `PUT`, `DELETE` | CRUD artikel edukasi (mutasi memerlukan sesi admin) |
| `/api/settings` | `GET`, `PUT` | Konfigurasi identitas & kontak bengkel |
| `/api/messages` | `GET`, `POST` | Penyimpanan & pembacaan pesan formulir kontak |
| `/api/upload` & `/uploads/[...path]` | `POST`, `GET` | Unggah dan penyajian file media lokal |

---

## Struktur Proyek

```text
.
├── database/
│   └── bengkel.db              # Database SQLite (WAL mode)
├── public/
│   ├── assets/                 # Aset gambar & logo statis
│   └── uploads/                # Hasil unggahan gambar melalui Admin CMS
├── src/
│   ├── app/
│   │   ├── admin/              # Panel Admin CMS (pages, photos, services, articles, settings, database)
│   │   ├── api/                # Next.js Route Handlers
│   │   ├── artikel/            # Halaman daftar artikel berpaginasi
│   │   ├── client/             # Dashboard progres proyek klien
│   │   ├── galeri/             # Halaman galeri proyek & Lightbox
│   │   ├── kontak/             # Halaman kontak & formulir survei
│   │   ├── layanan/            # Halaman katalog layanan & kalkulator biaya
│   │   ├── login/              # Portal masuk Klien & Admin
│   │   └── tentang-kami/       # Halaman profil bengkel
│   ├── components/
│   │   ├── admin/              # Komponen khusus admin (ArticleManagerPanel, CategoryManager)
│   │   └── ...                 # Navbar, Footer, CostEstimator, Pagination, SearchModal, dll.
│   ├── data/
│   │   └── content.ts          # Data awal & fallback perusahaan, layanan, galeri, artikel
│   └── lib/
│       ├── db.ts               # Inisialisasi schema & seeding otomatis SQLite
│       ├── auth.ts             # Verifikasi sesi admin
│       ├── articleHelpers.ts   # Helper slug, parsing konten/tag, format respons artikel
│       ├── categoryDefaults.ts # Definisi & default kategori layanan & galeri
│       └── useDynamicData.ts   # Hook sinkronisasi data konten & pengaturan situs
├── next.config.mjs
├── package.json
└── tailwind.config.js
```

---

## Skema Database SQLite

Saat aplikasi dijalankan pertama kali, `src/lib/db.ts` otomatis membuat `database/bengkel.db` (mengaktifkan `WAL mode`) dan mengisi data awal (*seeding*) pada tabel berikut:
- `admin_users` — Akun administrator CMS
- `site_settings` — Pengaturan nama bengkel, nomor telepon, WhatsApp, email, alamat, jam buka
- `page_contents` — Teks & gambar banner dinamis per halaman
- `categories` — Daftar kategori terkelola untuk `layanan` dan `galeri` (termasuk `Lainnya`)
- `services` — Data layanan fabrikasi beserta spesifikasi dan kisaran harga
- `gallery_photos` — Dokumentasi foto proyek beserta kategori dan lokasi pengerjaan
- `articles` — Konten artikel edukasi bengkel las
- `contact_messages` — Pesan konsultasi & survei dari pengunjung
- `clients` — Data proyek klien untuk portal pelacakan progres

---

## Cara Menjalankan Secara Lokal

### Prasyarat
- **Node.js 20+** dan **npm**

### Langkah Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/fallss/bengkel-las-putra-iing-jaya.git
cd bengkel-las-putra-iing-jaya

# 2. Instal dependensi
npm install

# 3. Jalankan server pengembangan (http://localhost:3000)
npm run dev
```

### Build & Produksi

```bash
# Build aplikasi untuk produksi
npm run build

# Jalankan server produksi di port 3000
npm run start

# Jalankan linter
npm run lint
```

---

## Akses Portal Demo

Untuk pengujian lokal, `src/lib/db.ts` menyertakan data contoh berikut saat database masih kosong:
- **Admin CMS (`/admin/login` atau `/login`)**
  - Username: `admin`
  - Password default lokal: lihat definisi seed di [`src/lib/db.ts`](src/lib/db.ts) *(segera ubah kata sandi sebelum deploy ke lingkungan produksi)*
- **Portal Klien (`/login`)**
  - Nomor HP terdaftar contoh: `081223459728` / `081904098333`

---

## Catatan Deployment & Keamanan

- **Inisialisasi Otomatis**: File database SQLite (`database/bengkel.db`) dan seluruh tabel serta data awal akan dibuat otomatis saat server dijalankan pertama kali melalui [`src/lib/db.ts`](src/lib/db.ts).
- **File `.gitignore`**: Direktori hasil build (`.next/`, `node_modules/`), database runtime lokal (`database/*.db*`), dan file unggahan pengujian (`public/uploads/*`) dikecualikan agar repositori tetap bersih dan ringan.
- **Keamanan Produksi**: Segera perbarui kata sandi akun `admin` di tabel `admin_users` sebelum menjalankan aplikasi di server produksi publik.
