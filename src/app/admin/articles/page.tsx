'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink } from 'lucide-react';
import { ArticleManagerPanel } from '@/components/admin/ArticleManagerPanel';

export default function AdminArticlesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <span>Kelola Artikel &amp; Edukasi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Tambah artikel baru, edit isi atau foto cover artikel yang ada. Website otomatis membatasi{' '}
            <strong>maksimal 6 card per halaman</strong> lengkap dengan navigasi nomor halaman.
          </p>
        </div>

        <Link
          href="/artikel"
          target="_blank"
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition inline-flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>Lihat Halaman Artikel</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <ArticleManagerPanel />
    </div>
  );
}

