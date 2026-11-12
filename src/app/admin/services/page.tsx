'use client';

import React from 'react';
import Link from 'next/link';
import { Wrench, ExternalLink } from 'lucide-react';
import { ServiceManagerPanel } from '@/components/admin/ServiceManagerPanel';

export default function AdminServicesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            <span>Kelola Layanan Fabrikasi &amp; Las</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Tambah layanan baru, edit detail card, harga, spesifikasi, atau foto layanan yang ada serta atur{' '}
            <strong>kategori layanan</strong> untuk halaman website.
          </p>
        </div>

        <Link
          href="/layanan"
          target="_blank"
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition inline-flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>Lihat Halaman Layanan</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <ServiceManagerPanel />
    </div>
  );
}
