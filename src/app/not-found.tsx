'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Phone, ArrowLeft, Wrench } from 'lucide-react';
import { COMPANY_INFO } from '@/data/content';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full text-center space-y-6 p-8 rounded-3xl bg-slate-900 border border-sky-950 shadow-2xl"
      >
        <div className="w-16 h-16 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/30">
          <Wrench className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-400">
            Error 404 // Halaman Tidak Ditemukan
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Halaman Sedang Dalam Pengerjaan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan atau tautan salah. Silakan kembali ke beranda atau hubungi tim customer service kami.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <a
            href={COMPANY_INFO.waLink}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Hubungi WhatsApp</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
