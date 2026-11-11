'use client';

import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  Table,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function AdminDatabaseGuidePage() {
  const [copied, setCopied] = useState(false);
  const [copiedSql, setCopiedSql] = useState<string | null>(null);

  const dbPath = '/home/ifhalfaizi/Downloads/bengkel_las_besi_jogja_layanan/database/bengkel.db';

  const handleCopyPath = () => {
    navigator.clipboard.writeText(dbPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySql = (sql: string, key: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedSql(key);
    setTimeout(() => setCopiedSql(null), 2000);
  };

  const TABLES = [
    {
      name: 'page_contents',
      desc: 'Menyimpan seluruh teks, judul, subjudul, dan paragraf di setiap halaman website (Home, Tentang Kami, Layanan, Galeri, Kontak).',
      columns: ['id (PK)', 'page_key', 'section_key', 'title', 'content', 'content_type', 'updated_at'],
    },
    {
      name: 'gallery_photos',
      desc: 'Menyimpan daftar foto portofolio, kategori foto (kanopi, pagar, railing, tangga), lokasi proyek, dan file URL.',
      columns: ['id (PK)', 'title', 'category', 'category_label', 'src', 'location', 'created_at'],
    },
    {
      name: 'services',
      desc: 'Menyimpan daftar layanan fabrikasi, harga estimasi, deskripsi, spesifikasi teknis, dan foto cover.',
      columns: ['id (PK)', 'title', 'category', 'tagline', 'desc', 'specs', 'materials', 'price_range', 'image'],
    },
    {
      name: 'site_settings',
      desc: 'Menyimpan informasi global seperti nomor WhatsApp, telepon acuan (+62 812-2345-9728), alamat workshop, email, dan jam buka.',
      columns: ['key (PK)', 'value', 'description'],
    },
    {
      name: 'admin_users',
      desc: 'Data akun administrator yang dapat login ke dashboard panel ini.',
      columns: ['id (PK)', 'username', 'password (SHA256)', 'name', 'role', 'created_at'],
    },
    {
      name: 'articles',
      desc: 'Artikel edukasi, tips memilih material stainless SUS 304, kanopi alderon, dan panduan lainnya.',
      columns: ['slug (PK)', 'title', 'date', 'read_time', 'author', 'image', 'excerpt', 'content', 'tags'],
    },
  ];

  const SAMPLE_QUERIES = [
    {
      key: 'q1',
      title: '1. Lihat Semua Teks Halaman Beranda (Home)',
      sql: `SELECT id, section_key, title, content FROM page_contents WHERE page_key = 'home';`,
    },
    {
      key: 'q2',
      title: '2. Ubah Teks Judul Hero Langsung via SQL',
      sql: `UPDATE page_contents \nSET content = 'Bengkel Las Besi Terbaik & Bergaransi Resmi'\nWHERE page_key = 'home' AND section_key = 'hero_headline';`,
    },
    {
      key: 'q3',
      title: '3. Tambah Foto Portofolio Baru via SQL',
      sql: `INSERT INTO gallery_photos (title, category, category_label, src, location)\nVALUES ('Kanopi Minimalis Kaca Tempered', 'kanopi', 'Kanopi', '/uploads/kanopi-baru.jpg', 'Padalarang, Bandung Barat');`,
    },
    {
      key: 'q4',
      title: '4. Update Nomor WhatsApp Utama di Pengaturan',
      sql: `UPDATE site_settings \nSET value = '+62 812-2345-9728' \nWHERE key = 'phone';\n\nUPDATE site_settings \nSET value = '6281223459728' \nWHERE key = 'whatsapp';`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-sky-500" />
            <span>Panduan Menghubungkan ke DBeaver</span>
          </h1>
          <p className="text-xs text-slate-500">
            DBeaver mendukung penuh file SQLite secara native tanpa perlu install server database terpisah.
          </p>
        </div>
      </div>

      {/* Connection Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-5 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Jalur File Database SQLite Anda</h2>
            <p className="text-xs text-sky-300">Gunakan path ini saat membuat koneksi baru di DBeaver</p>
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <code className="text-xs font-mono text-emerald-400 break-all select-all">{dbPath}</code>
          <button
            onClick={handleCopyPath}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 flex-shrink-0 shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Path Tersalin!' : 'Salin Path'}</span>
          </button>
        </div>

        {/* 4 Step Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h3 className="text-xs font-bold text-white">Buka DBeaver</h3>
            <p className="text-[11px] text-slate-300">Klik menu <strong>Database</strong> &gt; <strong>New Database Connection</strong>.</p>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h3 className="text-xs font-bold text-white">Pilih SQLite</h3>
            <p className="text-[11px] text-slate-300">Cari dan pilih driver <strong>SQLite</strong>, lalu klik <strong>Next</strong>.</p>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center">3</span>
            <h3 className="text-xs font-bold text-white">Tempel Path File</h3>
            <p className="text-[11px] text-slate-300">Pada kolom <strong>Path</strong>, tempel path file di atas (atau klik Browse).</p>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">4</span>
            <h3 className="text-xs font-bold text-white">Klik Finish</h3>
            <p className="text-[11px] text-slate-300">Selesai! Seluruh tabel langsung muncul dan siap Anda edit langsung.</p>
          </div>
        </div>
      </div>

      {/* Tables Breakdown */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-500" />
            <span>Struktur Tabel di DBeaver</span>
          </h2>
          <p className="text-xs text-slate-500">Tabel-tabel ini terdaftar di dalam <code>bengkel.db</code></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TABLES.map((t) => (
            <div key={t.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                  {t.name}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{t.columns.length} Kolom</span>
              </div>
              <p className="text-xs text-slate-600">{t.desc}</p>
              <div className="pt-1 flex flex-wrap gap-1">
                {t.columns.map((col) => (
                  <span key={col} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SQL Snippets */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-500" />
            <span>Contoh Query SQL di DBeaver</span>
          </h2>
          <p className="text-xs text-slate-500">
            Anda dapat menjalankan query SQL ini di SQL Editor DBeaver untuk memeriksa atau mengubah data secara langsung
          </p>
        </div>

        <div className="space-y-4">
          {SAMPLE_QUERIES.map((q) => (
            <div key={q.key} className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{q.title}</span>
                <button
                  onClick={() => handleCopySql(q.sql, q.key)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 transition"
                >
                  {copiedSql === q.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql === q.key ? 'Tersalin' : 'Salin SQL'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-sky-300 text-xs font-mono overflow-x-auto leading-relaxed">
                {q.sql}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

