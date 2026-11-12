import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { COMPANY_INFO, SERVICES_DATA, GALLERY_ITEMS, ARTICLES_DATA } from '@/data/content';
import { getDefaultCategories, type CategoryScope } from '@/lib/categoryDefaults';
import {
  DEFAULT_ESTIMATOR_CATEGORIES,
  DEFAULT_ESTIMATOR_CONFIG,
} from '@/lib/estimatorDefaults';

// Ensure database directory exists
const dbDir = path.join(process.cwd(), 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'bengkel.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance and concurrent reads
db.pragma('journal_mode = WAL');

// 1. Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS page_contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_key TEXT NOT NULL,
    section_key TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text',
    dimension_hint TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page_key, section_key)
  );

  CREATE TABLE IF NOT EXISTS gallery_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT NOT NULL,
    src TEXT NOT NULL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    tagline TEXT,
    desc TEXT NOT NULL,
    specs TEXT,
    materials TEXT,
    price_range TEXT,
    image TEXT NOT NULL,
    features TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS articles (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    read_time TEXT,
    author TEXT,
    image TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope TEXT NOT NULL,
    slug TEXT NOT NULL,
    label TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(scope, slug)
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT,
    district TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    password TEXT,
    project_name TEXT NOT NULL,
    project_category TEXT NOT NULL,
    project_status TEXT NOT NULL,
    progress_percentage INTEGER DEFAULT 75,
    project_estimate TEXT NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS estimator_categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    unit_label TEXT NOT NULL,
    calc_mode TEXT NOT NULL DEFAULT 'area',
    result_unit TEXT NOT NULL DEFAULT 'm²',
    primary_label TEXT NOT NULL DEFAULT 'Panjang',
    primary_max INTEGER NOT NULL DEFAULT 30,
    secondary_label TEXT DEFAULT 'Lebar',
    secondary_max INTEGER DEFAULT 15,
    options TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  db.exec('ALTER TABLE page_contents ADD COLUMN dimension_hint TEXT;');
} catch (e) {}

// Seed initial demo clients if empty
db.prepare(`
  INSERT OR IGNORE INTO clients (id, name, phone, email, password, project_name, project_category, project_status, progress_percentage, project_estimate, location, notes)
  VALUES (
    1,
    'Bapak Hendra Wijaya',
    '081223459728',
    'hendra.klien@gmail.com',
    'klien123',
    'Kanopi Carport Alderon Double Layer & Pintu Pagar Otomatis',
    'Kanopi & Pagar',
    'Tahap Fabrikasi & Pengecatan Powder Coating',
    80,
    'Rp 18.500.000',
    'Kota Baru Parahyangan, Padalarang, Bandung Barat',
    'Rangka besi hollow galvanis 40x80 tebal 2mm, atap Alderon RS white doff, motor autogate 800kg. Estimasi pemasangan instalasi lapangan hari Sabtu.'
  )
`).run();

db.prepare(`
  INSERT OR IGNORE INTO clients (id, name, phone, email, password, project_name, project_category, project_status, progress_percentage, project_estimate, location, notes)
  VALUES (
    2,
    'Ibu Ratna Sari',
    '081904098333',
    'ratna.sari@gmail.com',
    'klien123',
    'Railing Balkon Kaca Tempered & Tangga Putar Minimalis',
    'Railing & Tangga',
    'Pemasangan Lapangan (Finishing)',
    95,
    'Rp 12.800.000',
    'Lembang, Bandung Barat',
    'Stainless Steel SUS 304 anti karat, kaca tempered 10mm, handle kayu jati natural. Tinggal proses serah terima dan garansi.'
  )
`).run();

// 2. Seed Default Admin User if empty
const defaultPasswordHash = crypto.createHash('sha256').update('adminbengkel123!').digest('hex');
db.prepare(`
  INSERT OR IGNORE INTO admin_users (username, password, name, role)
  VALUES (?, ?, ?, ?)
`).run('admin', defaultPasswordHash, 'Administrator Bengkel', 'superadmin');

// 3. Seed Site Settings (INSERT OR IGNORE ensures new keys exist on existing DBs too)
const insertSetting = db.prepare('INSERT OR IGNORE INTO site_settings (key, value, description) VALUES (?, ?, ?)');
const initialSettings = [
  ['site_name', COMPANY_INFO.name, 'Nama Singkat Bengkel'],
  ['company_full_name', COMPANY_INFO.fullName, 'Nama Lengkap Usaha'],
  ['phone', COMPANY_INFO.phone, 'Nomor Telepon'],
  ['whatsapp', COMPANY_INFO.waNumber, 'Nomor WhatsApp API'],
  ['email', COMPANY_INFO.email, 'Email Resmi'],
  ['address', COMPANY_INFO.address, 'Alamat Lengkap Workshop'],
  ['hours', COMPANY_INFO.hours, 'Jam Operasional'],
  ['maps_url', COMPANY_INFO.mapsUrl, 'Link Google Maps'],
  ['instagram_url', 'https://www.instagram.com/', 'Link Profil Instagram'],
  ['facebook_url', 'https://www.facebook.com/', 'Link Halaman Facebook'],
  ['youtube_url', 'https://www.youtube.com/', 'Link Channel YouTube'],
  ['topbar_tagline', 'Bengkel Las Stainless Steel Terbaik', 'Teks Tagline Kiri Topbar Website'],
  ['ticker_text_1', 'Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel', 'Teks Berjalan 1 (Semua Halaman)'],
  ['ticker_text_2', 'Pengerjaan Cepat, Rapi & Bergaransi Resmi di Bandung Barat', 'Teks Berjalan 2 (Semua Halaman)'],
  ['ticker_phone', 'WhatsApp: 0812 2345 9728', 'Teks Nomor WhatsApp di Ticker Berjalan'],
  ['ticker_btn_label', 'Whatsapp', 'Label Tombol Kanan Ticker Berjalan'],
  ['estimator_config', JSON.stringify(DEFAULT_ESTIMATOR_CONFIG), 'Konfigurasi Teks Kalkulator Estimasi Biaya'],
];

for (const [key, val, desc] of initialSettings) {
  insertSetting.run(key, val, desc);
}

// 4. Seed Page Contents if empty or missing
const insertContent = db.prepare(`
  INSERT INTO page_contents (page_key, section_key, title, content, content_type, dimension_hint)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(page_key, section_key) DO UPDATE SET
    title = CASE WHEN page_contents.title = page_contents.section_key THEN excluded.title ELSE page_contents.title END,
    dimension_hint = COALESCE(excluded.dimension_hint, page_contents.dimension_hint),
    content_type = COALESCE(excluded.content_type, page_contents.content_type)
`);

const heroSlidesDefault = JSON.stringify([
  {
    image: '/assets/images/asset_30_banner-2.jpg',
    title: 'Bengkel Las Besi Bandung Barat',
    subtitle: 'Pusat Fabrikasi Kanopi, Pagar, Railing, Tangga & Teralis di Bandung Barat'
  },
  {
    image: '/assets/images/asset_24_Banner-1-revisi.jpg',
    title: 'Bengkel Las Putra Iing Jaya Bandung Barat',
    subtitle: 'Layanan Pengerjaan Stainless & Besi Terbaik di Bandung Barat'
  }
]);

const initialContents = [
  // Home Page
  ['home', 'hero_slides', 'Slider Carousel Utama (Hero)', heroSlidesDefault, 'carousel', '1920 x 1080 px (Rasio 16:9 Standar) atau 2100 x 1080 px (Widescreen) | Otomatis Full Edge-to-Edge tanpa spasi hitam | Format: JPG, PNG, WebP | Maks: 10MB'],
  ['home', 'hero_headline', 'Judul Utama Hero (Fallback)', 'Bengkel Las Besi Bandung Barat', 'text', null],
  ['home', 'hero_subheadline', 'Subjudul Hero (Fallback)', 'Pusat Fabrikasi Kanopi, Pagar, Railing, Tangga & Teralis di Bandung Barat', 'text', null],
  ['home', 'about_intro_badge', 'Intro: Badge Biru Atas', 'BENGKEL LAS BESI BANDUNG BARAT', 'text', null],
  ['home', 'about_intro_phone', 'Intro: Nomor Telepon Tampil', '0812 2345 9728', 'text', null],
  ['home', 'about_intro_title', 'Intro: Judul Besar', 'Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel', 'text', null],
  ['home', 'about_intro_desc', 'Intro: Deskripsi Singkat', 'Kami melayani pembuatan berbagai jenis konstruksi besi, seperti pagar, kanopi, dan struktur lainnya yang membutuhkan ketahanan dan kekuatan tinggi.', 'textarea', null],
  ['home', 'about_intro_wa_btn', 'Intro: Teks Tombol WA', 'Free Konsultasi', 'text', null],
  ['home', 'about_intro_btn', 'Intro: Teks Tombol Layanan', 'Layanan Kami', 'text', null],
  ['home', 'banner_split_image', 'Banner Belah: Gambar Background Kiri', '/assets/images/banner-kanopi-real.jpg', 'image', '1000 x 600 px (Rasio Landscape / 16:10) | Format: JPG, PNG, WebP | Maks: 5MB'],
  ['home', 'banner_split_title', 'Banner Belah: Judul Kiri', 'Jasa Bengkel Las Pengerjaan Stainless dan Besi Terbaik', 'text', null],
  ['home', 'banner_split_subtitle', 'Banner Belah: Subjudul Kiri', 'Bengkel Las Putra Iing Jaya Stainless & Besi', 'text', null],
  ['home', 'banner_split_btn', 'Banner Belah: Teks Tombol Kiri', 'Free Konsultasi', 'text', null],
  ['home', 'banner_split_desc', 'Banner Belah: Teks Box Kanan', 'Kami menyediakan berbagai layanan pengerjaan stainless steel dan besi berkualitas, termasuk kanopi, railing, pintu pagar otomatis, tangga, dan lainnya.', 'textarea', null],
  ['home', 'services_badge', 'Layanan: Badge Atas', 'Katalog Unggulan', 'text', null],
  ['home', 'services_title', 'Layanan: Judul Section', 'Layanan Fabrikasi Kami Meliputi:', 'text', null],
  ['home', 'subheader_banner_image', 'Banner Subheader Tengah (Panorama)', '/assets/images/asset_12_subheader-oke.jpg', 'image', '2100 x 475 px (Rasio Panorama ~4.4:1) | Format: JPG, PNG, WebP | Maks: 4MB'],
  ['home', 'about_section_image', 'Foto Seksi Tentang Kami (Beranda)', '/assets/images/asset_12_tentang-kami-1.jpg', 'image', '1200 x 850 px (Rasio 4:3) | Format: JPG, PNG, WebP | Maks: 4MB'],
  ['home', 'about_section_badge', 'Tentang Kami Depan: Badge', 'Bengkel Las Besi Bandung Barat', 'text', null],
  ['home', 'about_section_title', 'Tentang Kami Depan: Judul', 'Bengkel Las Putra Iing Jaya Stainless & Besi', 'text', null],
  ['home', 'about_section_p1', 'Tentang Kami Depan: Paragraf 1', 'Kami spesialis dalam pengerjaan stainless steel dan besi untuk berbagai kebutuhan arsitektural dan residensial di Kabupaten Bandung Barat, mulai dari pembuatan kanopi modern, railing, tangga, hingga pintu pagar otomatis dan manual.', 'textarea', null],
  ['home', 'about_section_p2', 'Tentang Kami Depan: Paragraf 2', 'Berdiri dengan tujuan memberikan solusi konstruksi yang kokoh, tahan lama, dan estetik, kami selalu mengutamakan kualitas setiap proyek. Dengan pengalaman yang kami miliki, tim ahli kami siap memberikan hasil pengerjaan yang sesuai dengan keinginan anda.', 'textarea', null],
  ['home', 'about_section_btn', 'Tentang Kami Depan: Teks Tombol', 'Semua Layanan', 'text', null],
  ['home', 'welder_stats_image', 'Foto Seksi Pengelasan & Statistik', '/assets/images/welder-stats.jpg', 'image', '1000 x 600 px (Rasio 16:10 / Landscape HD) | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['home', 'stat_tab_text', 'Statistik: Label Tab Vertikal', 'Konsultasi', 'text', null],
  ['home', 'stat_val_1', 'Statistik 1: Angka', '1550+', 'text', null],
  ['home', 'stat_lbl_1', 'Statistik 1: Keterangan', 'Proyek Selesai.', 'text', null],
  ['home', 'stat_val_2', 'Statistik 2: Angka', '99%', 'text', null],
  ['home', 'stat_lbl_2', 'Statistik 2: Keterangan', 'Hasil Memuaskan.', 'text', null],
  ['home', 'stat_val_3', 'Statistik 3: Angka', '15+', 'text', null],
  ['home', 'stat_lbl_3', 'Statistik 3: Keterangan', 'Tahun Jam Terbang', 'text', null],
  ['home', 'stat_val_4', 'Statistik 4: Angka', '100%', 'text', null],
  ['home', 'stat_lbl_4', 'Statistik 4: Keterangan', 'Jaminan Garansi Resmi', 'text', null],
  ['home', 'gallery_title', 'Galeri Depan: Judul Utama', 'Layanan Terbaik & Portofolio Proyek', 'text', null],
  ['home', 'gallery_subtitle', 'Galeri Depan: Subjudul Biru', 'Pengerjaan Nyata di Bandung Barat', 'text', null],
  ['home', 'gallery_desc', 'Galeri Depan: Deskripsi', 'Kami siap menangani berbagai jenis proyek di Padalarang, Lembang, Ngamprah, Kotabaru Parahyangan, dari yang kecil hingga besar, dengan kualitas pengerjaan terbaik.', 'textarea', null],
  ['home', 'gallery_btn', 'Galeri Depan: Teks Tombol', 'Galeri Lainnya', 'text', null],
  ['home', 'advantages_badge', 'Keunggulan: Badge Atas', 'Mengapa Memilih Kami', 'text', null],
  ['home', 'advantages_title', 'Keunggulan: Judul Utama', 'Keunggulan Layanan Kami', 'text', null],
  ['home', 'advantages_desc', 'Keunggulan: Deskripsi Section', 'Komitmen mutu terbaik dan pelayanan prima untuk setiap proyek pengelasan & fabrikasi di Bandung Barat.', 'textarea', null],
  ['home', 'adv_title_1', 'Keunggulan 1: Judul Card', 'Material Berkualitas', 'text', null],
  ['home', 'adv_desc_1', 'Keunggulan 1: Keterangan', 'Menggunakan bahan terbaik untuk memastikan ketahanan cuaca Bandung Barat.', 'textarea', null],
  ['home', 'adv_title_2', 'Keunggulan 2: Judul Card', 'Profesional & Berpengalaman', 'text', null],
  ['home', 'adv_desc_2', 'Keunggulan 2: Keterangan', 'Memiliki tim berpengalaman dibidang pengelasan lebih dari 10 Tahun.', 'textarea', null],
  ['home', 'adv_title_3', 'Keunggulan 3: Judul Card', 'Harga Kompetitif', 'text', null],
  ['home', 'adv_desc_3', 'Keunggulan 3: Keterangan', 'Memberikan solusi terbaik tanpa membebani anggaran Anda.', 'textarea', null],
  ['home', 'adv_title_4', 'Keunggulan 4: Judul Card', 'Gratis Konsultasi', 'text', null],
  ['home', 'adv_desc_4', 'Keunggulan 4: Keterangan', 'Konsultasi dan survey lokasi di Bandung Barat tanpa dipungut biaya apapun.', 'textarea', null],
  ['home', 'cta_bg_image', 'Background Parallax Call to Action (CTA)', '/assets/images/cta-fabrikasi-bg.jpg', 'image', '1920 x 800 px (Landscape Widescreen Fixed) | Format: JPG, PNG, WebP | Maks: 4MB'],
  ['home', 'cta_headline', 'CTA: Judul Utama', 'Wujudkan Pagar, Kanopi & Railing Impian Hunian Anda Sekarang', 'text', null],
  ['home', 'cta_desc', 'CTA: Teks Paragraf Penawaran', 'Konsultasikan desain, ukuran, dan estimasi biaya (RAB) bersama tim ahli Bengkel Las Putra Iing Jaya. Survey lokasi dan konsultasi 100% Gratis di seluruh area Bandung Barat.', 'textarea', null],
  ['home', 'cta_btn_text', 'CTA: Teks Tombol', 'Hubungi Kami', 'text', null],
  ['home', 'articles_section_title', 'Artikel Depan: Judul Utama', 'Informasi & Edukasi Terbaru', 'text', null],
  ['home', 'articles_section_desc', 'Artikel Depan: Deskripsi', 'Berikut adalah beberapa artikel informatif dan inspiratif yang dapat membantu Anda memahami layanan kami lebih dalam', 'textarea', null],

  // Tentang Kami
  ['tentang-kami', 'banner_image', 'Subheader Banner Atas', '/assets/images/asset_12_subheader-oke.jpg', 'image', '2100 x 475 px (Rasio Panorama ~4.4:1) | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['tentang-kami', 'story_image', 'Foto Profil Workshop 1 (Kiri Atas)', '/assets/images/asset_12_tentang-kami-1.jpg', 'image', '800 x 600 px (Rasio 4:3) atau 1200 x 800 px | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['tentang-kami', 'story_image_2', 'Foto Profil Workshop 2 (Kanan Atas)', '/assets/images/asset_12_subheader-oke.jpg', 'image', '800 x 600 px (Rasio 4:3) atau 1200 x 800 px | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['tentang-kami', 'story_image_3', 'Foto Profil Workshop 3 (Kiri Bawah)', '/assets/images/asset_24_Bengkel-Las-Stainless-Steel-Te.jpg', 'image', '800 x 600 px (Rasio 4:3) atau 1200 x 800 px | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['tentang-kami', 'story_image_4', 'Foto Profil Workshop 4 (Kanan Bawah)', '/assets/images/asset_24_Jasa-pembuatan-kanopi-70x42.jpg', 'image', '800 x 600 px (Rasio 4:3) atau 1200 x 800 px | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['tentang-kami', 'hero_title', 'Judul Halaman Tentang Kami', 'Tentang Bengkel Las Putra Iing Jaya', 'text', null],
  ['tentang-kami', 'hero_subtitle', 'Subjudul Halaman Tentang Kami', 'Lebih Dari 15 Tahun Melayani Pembuatan Kanopi, Pagar & Railing Stainless Terbaik di Bandung Barat', 'textarea', null],
  ['tentang-kami', 'story_title', 'Judul Kisah / Profil', 'Keahlian Logam Bertahun-Tahun di Bandung Barat', 'text', null],
  ['tentang-kami', 'story_p1', 'Paragraf Cerita 1', 'Bengkel Las Putra Iing Jaya Stainless & Besi bermula dari komitmen sederhana: menghadirkan pengerjaan las berkualitas presisi tinggi dengan material berstandar SNI dan Stainless Steel SUS 304 asli.', 'textarea', null],
  ['tentang-kami', 'story_p2', 'Paragraf Cerita 2', 'Berlokasi strategis di Padalarang, Kabupaten Bandung Barat, kami telah dipercaya menangani ribuan proyek perumahan, villa, ruko, pabrik, hingga gedung komersial.', 'textarea', null],
  ['tentang-kami', 'features_item_1', 'Poin Keunggulan 1', 'Bahan Stainless Steel Grade 304 Asli (Anti Karat Abadi)', 'text', null],
  ['tentang-kami', 'features_item_2', 'Poin Keunggulan 2', 'Besi Hollow Galvanis Berkualitas Standar SNI', 'text', null],
  ['tentang-kami', 'features_item_3', 'Poin Keunggulan 3', 'Sistem Pengelasan TIG Gas Argon untuk Sambungan Halus & Kuat', 'text', null],
  ['tentang-kami', 'features_item_4', 'Poin Keunggulan 4', 'Finishing Cat Duco / Powder Coating Tahan Gores & Cuaca', 'text', null],
  ['tentang-kami', 'features_item_5', 'Poin Keunggulan 5', 'Garansi Resmi Kebocoran & Sambungan Las Tertulis', 'text', null],
  ['tentang-kami', 'btn_contact_text', 'Teks Tombol Hubungi Kami', 'Hubungi Workshop Kami', 'text', null],
  ['tentang-kami', 'btn_services_text', 'Teks Tombol Semua Layanan', 'Lihat Semua Layanan', 'text', null],

  // Layanan
  ['layanan', 'banner_image', 'Subheader Banner Atas', '/assets/images/asset_12_subheader-oke.jpg', 'image', '2100 x 475 px (Rasio Panorama ~4.4:1) | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['layanan', 'hero_title', 'Judul Halaman Layanan', 'Layanan Pengerjaan Las Stainless & Besi', 'text', null],
  ['layanan', 'hero_subtitle', 'Subjudul Halaman Layanan', 'Solusi Lengkap Fabrikasi Logam, Kanopi, Pagar, Railing & Konstruksi di Bandung Barat', 'textarea', null],

  // Galeri
  ['galeri', 'banner_image', 'Subheader Banner Atas', '/assets/images/asset_12_subheader-oke.jpg', 'image', '2100 x 475 px (Rasio Panorama ~4.4:1) | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['galeri', 'hero_title', 'Judul Halaman Galeri', 'Galeri Portofolio Proyek', 'text', null],
  ['galeri', 'hero_subtitle', 'Subjudul Halaman Galeri', 'Dokumentasi Asli Hasil Pengerjaan Kanopi, Pagar, Railing Tangga & Tangga Putar di Bandung Barat', 'textarea', null],

  // Artikel
  ['artikel', 'banner_image', 'Subheader Banner Atas', '/assets/images/asset_12_subheader-oke.jpg', 'image', '2100 x 475 px (Rasio Panorama ~4.4:1) | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['artikel', 'hero_title', 'Judul Halaman Artikel', 'Artikel, Edukasi & Tips Fabrikasi Logam', 'text', null],
  ['artikel', 'hero_subtitle', 'Subjudul Halaman Artikel', 'Informasi seputar pemilihan material besi, perawatan stainless steel, dan tips renovasi kanopi rumah.', 'textarea', null],

  // Kontak
  ['kontak', 'banner_image', 'Subheader Banner Atas', '/assets/images/asset_12_subheader-oke.jpg', 'image', '2100 x 475 px (Rasio Panorama ~4.4:1) | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['kontak', 'workshop_image', 'Foto Workshop / Lokasi Bengkel', '/assets/images/asset_12_tentang-kami-1.jpg', 'image', '1200 x 800 px (Landscape Widescreen) | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['kontak', 'hero_title', 'Judul Halaman Kontak', 'Kontak & Alamat Workshop', 'text', null],
  ['kontak', 'hero_subtitle', 'Subjudul Halaman Kontak', 'Silakan hubungi kami untuk survey lokasi, perhitungan estimasi biaya (RAB), atau konsultasi desain gratis di wilayah Bandung Barat & sekitarnya.', 'textarea', null],
  ['kontak', 'info_title', 'Judul Box Info Workshop', 'Informasi Workshop', 'text', null],
  ['kontak', 'info_desc', 'Deskripsi Info Workshop', 'Anda dapat berkunjung langsung ke workshop kami di Padalarang atau menghubungi tim kami melalui WhatsApp untuk respon cepat.', 'textarea', null],
  ['kontak', 'info_address_val', 'Alamat Lengkap Workshop', 'Jl. Raya Padalarang No. 123, Kertamulya, Kec. Padalarang, Kabupaten Bandung Barat, Jawa Barat 40553', 'textarea', null],
  ['kontak', 'info_hours_val', 'Jam Operasional Workshop', 'Senin - Sabtu: 08.00 - 17.00 WIB (Minggu Libur/Janji Temu)', 'text', null],
  ['kontak', 'form_title', 'Judul Formulir Kontak', 'Kirim Pesan & Konsultasi', 'text', null],

  // Global (Header, Ticker & Footer)
  ['global', 'topbar_tagline', 'Header: Tagline Kiri', 'Bengkel Las Stainless Steel Terbaik', 'text', null],
  ['global', 'topbar_phone', 'Header: Nomor Telepon Topbar', '+62 812-2345-9728', 'text', null],
  ['global', 'topbar_login_text', 'Header: Teks Link Portal Masuk', 'Portal Masuk', 'text', null],
  ['global', 'nav_login_text', 'Header: Teks Tombol Masuk Nav', 'Masuk', 'text', null],
  ['global', 'ticker_text_1', 'Ticker Berjalan: Teks Pesan 1', 'Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel', 'text', null],
  ['global', 'ticker_text_2', 'Ticker Berjalan: Teks Pesan 2', 'Pengerjaan Cepat, Rapi & Bergaransi Resmi di Bandung Barat', 'text', null],
  ['global', 'ticker_phone', 'Ticker Berjalan: Teks WhatsApp', 'WhatsApp: 0812 2345 9728', 'text', null],
  ['global', 'ticker_btn_label', 'Ticker Berjalan: Teks Tombol', 'Whatsapp', 'text', null],
  ['global', 'footer_tagline', 'Footer: Tagline Usaha', 'Pusat Fabrikasi Logam & Pengelasan Presisi Bandung Barat', 'text', null],
  ['global', 'footer_desc', 'Footer: Deskripsi Singkat Usaha', 'Spesialis pembuatan kanopi minimalis, pagar modern, railing tangga, hingga konstruksi besi custom berstandar SNI dengan garansi resmi.', 'textarea', null],
  ['global', 'footer_copyright', 'Footer: Teks Hak Cipta', '© 2026 Bengkel Las Putra Iing Jaya Bandung Barat. Seluruh Hak Cipta Dilindungi.', 'text', null],
];

for (const [page, section, title, content, type, dim] of initialContents) {
  insertContent.run(page, section, title, content, type, dim);
}

// 5. Seed Services if empty
const serviceCount = db.prepare('SELECT count(*) as count FROM services').get() as { count: number };
if (serviceCount.count === 0) {
  const insertService = db.prepare(`
    INSERT OR IGNORE INTO services (id, title, category, tagline, desc, specs, materials, price_range, image, features)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const srv of SERVICES_DATA) {
    insertService.run(
      srv.id,
      srv.title,
      srv.category,
      srv.tagline,
      srv.desc,
      JSON.stringify(srv.specs),
      JSON.stringify(srv.materials),
      srv.priceRange,
      srv.image,
      JSON.stringify(srv.features)
    );
  }
}

// 6. Seed Gallery Photos if empty
const galleryCount = db.prepare('SELECT count(*) as count FROM gallery_photos').get() as { count: number };
if (galleryCount.count === 0) {
  const insertPhoto = db.prepare(`
    INSERT OR IGNORE INTO gallery_photos (title, category, category_label, src, location)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const item of GALLERY_ITEMS) {
    insertPhoto.run(item.title, item.category, item.categoryLabel, item.src, item.location);
  }
}

// 7. Seed Articles if empty
const articleCount = db.prepare('SELECT count(*) as count FROM articles').get() as { count: number };
if (articleCount.count === 0) {
  const insertArticle = db.prepare(`
    INSERT OR IGNORE INTO articles (slug, title, date, read_time, author, image, excerpt, content, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const art of ARTICLES_DATA) {
    insertArticle.run(
      art.slug,
      art.title,
      art.date,
      art.readTime,
      art.author,
      art.image,
      art.excerpt,
      JSON.stringify(art.content),
      JSON.stringify(art.tags)
    );
  }
}

// 8. Seed Default Categories per scope if empty (preserve admin edits/deletes)
const countCategoriesByScope = db.prepare(
  'SELECT count(*) as count FROM categories WHERE scope = ?'
);
const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (scope, slug, label, sort_order)
  VALUES (?, ?, ?, ?)
`);

for (const scope of ['layanan', 'galeri'] as CategoryScope[]) {
  const { count } = countCategoriesByScope.get(scope) as { count: number };
  if (count === 0) {
    for (const cat of getDefaultCategories(scope)) {
      insertCategory.run(cat.scope, cat.slug, cat.label, cat.sort_order);
    }
  }
}

// 9. Seed Estimator Categories if empty (preserve admin edits/deletes)
const estimatorCount = db
  .prepare('SELECT count(*) as count FROM estimator_categories')
  .get() as { count: number };
if (estimatorCount.count === 0) {
  const insertEstimatorCategory = db.prepare(`
    INSERT OR IGNORE INTO estimator_categories (
      id, title, unit_label, calc_mode, result_unit,
      primary_label, primary_max, secondary_label, secondary_max,
      options, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < DEFAULT_ESTIMATOR_CATEGORIES.length; i++) {
    const item = DEFAULT_ESTIMATOR_CATEGORIES[i];
    insertEstimatorCategory.run(
      item.id,
      item.title,
      item.unitLabel,
      item.calcMode,
      item.resultUnit,
      item.primaryLabel,
      item.primaryMax,
      item.secondaryLabel || 'Lebar',
      item.secondaryMax || 15,
      JSON.stringify(item.options),
      item.sortOrder ?? i
    );
  }
}

export { db };
export default db;

// Export Helper Queries
export function getSiteSettings(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  return settings;
}

export function getPageContents(pageKey: string) {
  return db.prepare('SELECT * FROM page_contents WHERE page_key = ?').all(pageKey) as any[];
}

export function getAllPageContents() {
  return db.prepare('SELECT * FROM page_contents ORDER BY page_key, id').all() as any[];
}

export function getGalleryPhotos(category?: string) {
  if (category && category !== 'all') {
    return db.prepare('SELECT * FROM gallery_photos WHERE category = ? ORDER BY id DESC').all(category) as any[];
  }
  return db.prepare('SELECT * FROM gallery_photos ORDER BY id DESC').all() as any[];
}

export function getAllServices() {
  return db.prepare('SELECT * FROM services ORDER BY created_at ASC').all() as any[];
}

export function getAllArticles() {
  return db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all() as any[];
}

export function getEstimatorCategories() {
  const rows = db
    .prepare('SELECT * FROM estimator_categories ORDER BY sort_order ASC, rowid ASC')
    .all() as any[];
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    unitLabel: row.unit_label,
    calcMode: row.calc_mode === 'linear' ? ('linear' as const) : ('area' as const),
    resultUnit: row.result_unit || (row.calc_mode === 'linear' ? 'm¹' : 'm²'),
    primaryLabel: row.primary_label || 'Panjang',
    primaryMax: Number(row.primary_max) || 30,
    secondaryLabel: row.secondary_label || 'Lebar',
    secondaryMax: Number(row.secondary_max) || 15,
    sortOrder: Number(row.sort_order) || 0,
    options: (() => {
      try {
        const parsed = JSON.parse(row.options || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })(),
  }));
}

export function getEstimatorConfig() {
  const row = db
    .prepare("SELECT value FROM site_settings WHERE key = 'estimator_config'")
    .get() as { value?: string } | undefined;
  if (!row?.value) return { ...DEFAULT_ESTIMATOR_CONFIG };
  try {
    return { ...DEFAULT_ESTIMATOR_CONFIG, ...JSON.parse(row.value) };
  } catch {
    return { ...DEFAULT_ESTIMATOR_CONFIG };
  }
}
