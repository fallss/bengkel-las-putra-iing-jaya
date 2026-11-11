import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { COMPANY_INFO, SERVICES_DATA, GALLERY_ITEMS, ARTICLES_DATA } from '@/data/content';
import { getDefaultCategories, type CategoryScope } from '@/lib/categoryDefaults';

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

// 3. Seed Site Settings if empty
const settingsCount = db.prepare('SELECT count(*) as count FROM site_settings').get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare('INSERT OR REPLACE INTO site_settings (key, value, description) VALUES (?, ?, ?)');
  const initialSettings = [
    ['site_name', COMPANY_INFO.name, 'Nama Singkat Bengkel'],
    ['company_full_name', COMPANY_INFO.fullName, 'Nama Lengkap Usaha'],
    ['phone', COMPANY_INFO.phone, 'Nomor Telepon'],
    ['whatsapp', COMPANY_INFO.waNumber, 'Nomor WhatsApp API'],
    ['email', COMPANY_INFO.email, 'Email Resmi'],
    ['address', COMPANY_INFO.address, 'Alamat Lengkap Workshop'],
    ['hours', COMPANY_INFO.hours, 'Jam Operasional'],
    ['maps_url', COMPANY_INFO.mapsUrl, 'Link Google Maps'],
  ];

  for (const [key, val, desc] of initialSettings) {
    insertSetting.run(key, val, desc);
  }
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
  ['home', 'banner_split_image', 'Banner Belah: Gambar Background Kiri', '/assets/images/banner-kanopi-real.jpg', 'image', '1000 x 600 px (Rasio Landscape / 16:10) | Format: JPG, PNG, WebP | Maks: 5MB'],
  ['home', 'subheader_banner_image', 'Banner Subheader Tengah (Panorama)', '/assets/images/asset_12_subheader-oke.jpg', 'image', '2100 x 475 px (Rasio Panorama ~4.4:1) | Format: JPG, PNG, WebP | Maks: 4MB'],
  ['home', 'about_section_image', 'Foto Seksi Tentang Kami (Beranda)', '/assets/images/asset_12_tentang-kami-1.jpg', 'image', '1200 x 850 px (Rasio 4:3) | Format: JPG, PNG, WebP | Maks: 4MB'],
  ['home', 'welder_stats_image', 'Foto Seksi Pengelasan & Statistik', '/assets/images/welder-stats.jpg', 'image', '1000 x 600 px (Rasio 16:10 / Landscape HD) | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['home', 'cta_bg_image', 'Background Parallax Call to Action (CTA)', '/assets/images/cta-fabrikasi-bg.jpg', 'image', '1920 x 800 px (Landscape Widescreen Fixed) | Format: JPG, PNG, WebP | Maks: 4MB'],
  ['home', 'hero_headline', 'Judul Utama Hero', 'Bengkel Las Besi Bandung Barat', 'text', null],
  ['home', 'hero_subheadline', 'Subjudul Hero', 'Pusat Fabrikasi Kanopi, Pagar, Railing, Tangga & Teralis di Bandung Barat', 'text', null],
  ['home', 'about_intro_badge', 'Badge Intro Depan', 'BENGKEL LAS PUTRA IING JAYA', 'text', null],
  ['home', 'about_intro_phone', 'Nomor Telepon Intro Depan', '0812 2345 9728', 'text', null],
  ['home', 'about_intro_title', 'Judul Intro Depan', 'Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel', 'text', null],
  ['home', 'about_intro_desc', 'Deskripsi Intro Depan', 'Kami melayani pembuatan berbagai jenis konstruksi besi, seperti pagar, kanopi, dan struktur lainnya yang membutuhkan ketahanan dan kekuatan tinggi.', 'textarea', null],
  ['home', 'cta_headline', 'Judul Call-to-Action', 'Wujudkan Pagar, Kanopi & Railing Impian Hunian Anda Sekarang', 'text', null],
  ['home', 'cta_desc', 'Deskripsi Call-to-Action', 'Konsultasikan desain, ukuran, dan estimasi biaya (RAB) bersama tim ahli Bengkel Las Putra Iing Jaya. Survey lokasi dan konsultasi 100% Gratis di seluruh area Bandung Barat.', 'textarea', null],

  // Tentang Kami
  ['tentang-kami', 'banner_image', 'Subheader Banner Atas', '/assets/images/asset_12_subheader-oke.jpg', 'image', '2100 x 475 px (Rasio Panorama ~4.4:1) | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['tentang-kami', 'story_image', 'Foto Profil Workshop & Fabrikasi', '/assets/images/asset_12_tentang-kami-1.jpg', 'image', '800 x 600 px (Rasio 4:3) atau 1200 x 800 px | Format: JPG, PNG, WebP | Maks: 3MB'],
  ['tentang-kami', 'hero_title', 'Judul Halaman Tentang Kami', 'Tentang Bengkel Las Putra Iing Jaya', 'text', null],
  ['tentang-kami', 'hero_subtitle', 'Subjudul Halaman Tentang Kami', 'Lebih Dari 15 Tahun Melayani Pembuatan Kanopi, Pagar & Railing Stainless Terbaik di Bandung Barat', 'textarea', null],
  ['tentang-kami', 'story_p1', 'Paragraf Cerita 1', 'Bengkel Las Putra Iing Jaya Stainless & Besi bermula dari komitmen sederhana: menghadirkan pengerjaan las berkualitas presisi tinggi dengan material berstandar SNI dan Stainless Steel SUS 304 asli.', 'textarea', null],
  ['tentang-kami', 'story_p2', 'Paragraf Cerita 2', 'Berlokasi strategis di Padalarang, Kabupaten Bandung Barat, kami telah dipercaya menangani ribuan proyek perumahan, villa, ruko, pabrik, hingga gedung komersial.', 'textarea', null],

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
