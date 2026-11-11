'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Image as ImageIcon,
  Wrench,
  Database,
  ArrowRight,
  PlusCircle,
  Copy,
  Check,
  HardDrive,
  Eye,
  BookOpen,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    photos: 0,
    services: 0,
    contents: 0,
    settings: 0,
    articles: 0,
  });
  const [recentPhotos, setRecentPhotos] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const dbPath = '/home/ifhalfaizi/Downloads/bengkel_las_besi_jogja_layanan/database/bengkel.db';

  useEffect(() => {
    Promise.all([
      fetch('/api/photos').then((r) => r.json()),
      fetch('/api/services').then((r) => r.json()),
      fetch('/api/content').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/articles').then((r) => r.json()),
    ])
      .then(([photos, services, content, settings, articles]) => {
        setStats({
          photos: photos?.data?.length || 0,
          services: services?.data?.length || 0,
          contents: content?.data?.length || 0,
          settings: Object.keys(settings?.data || {}).length || 0,
          articles: articles?.data?.length || 0,
        });
        setRecentPhotos((photos?.data || []).slice(0, 4));
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(dbPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SQLite & DBeaver Connected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Selamat Datang di Panel Admin</h1>
          <p className="text-sm text-sky-100 leading-relaxed">
            Kelola foto portofolio, ganti teks di setiap halaman website, dan pantau data langsung lewat panel ini atau via aplikasi <strong>DBeaver</strong>.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/admin/photos"
              className="px-4 py-2 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Foto Baru</span>
            </Link>
            <Link
              href="/admin/pages"
              className="px-4 py-2 rounded-xl bg-sky-500/30 hover:bg-sky-500/40 text-white font-bold text-xs border border-white/20 transition flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Edit Teks Halaman</span>
            </Link>
            <Link
              href="/admin/articles"
              className="px-4 py-2 rounded-xl bg-sky-500/30 hover:bg-sky-500/40 text-white font-bold text-xs border border-white/20 transition flex items-center space-x-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Kelola Artikel</span>
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* DBeaver Connection Alert Box */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-900">Jalur File Database DBeaver (SQLite)</h2>
            <p className="text-xs text-slate-500 font-mono truncate max-w-xl">{dbPath}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={handleCopyPath}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5"
            title="Salin path file untuk DBeaver"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Path'}</span>
          </button>
          <Link
            href="/admin/database"
            className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition flex items-center space-x-1"
          >
            <span>Panduan DBeaver</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Foto</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.photos}</p>
          <Link href="/admin/photos" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1">
            <span>Kelola galeri</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Layanan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.services}</p>
          <Link href="/admin/services" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
            <span>Kelola layanan</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Artikel</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.articles}</p>
          <Link href="/admin/articles" className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center space-x-1">
            <span>Kelola artikel</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Bagian Teks</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.contents}</p>
          <Link href="/admin/pages" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
            <span>Edit teks halaman</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Database</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900 pt-2 font-mono">bengkel.db</p>
          <p className="text-[11px] text-slate-500">Tersinkron dengan DBeaver</p>
        </div>
      </div>

      {/* Recent Photos Preview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Foto Portofolio Terbaru</h2>
            <p className="text-xs text-slate-500">Foto yang saat ini aktif tampil di halaman Galeri & Home</p>
          </div>
          <Link
            href="/admin/photos"
            className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition flex items-center space-x-1"
          >
            <span>Semua Foto ({stats.photos})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {recentPhotos.map((photo) => (
            <div key={photo.id} className="group relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-[4/3]">
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-3 flex flex-col justify-end text-white">
                <span className="text-[10px] text-sky-300 font-bold uppercase">{photo.category}</span>
                <p className="text-xs font-bold truncate">{photo.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

