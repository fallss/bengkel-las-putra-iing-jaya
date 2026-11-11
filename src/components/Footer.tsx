'use client';

import React from 'react';
import Link from 'next/link';
import { COMPANY_INFO } from '@/data/content';
import { usePageContent } from '@/lib/useDynamicData';
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Compass,
  ArrowRight
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { content } = usePageContent('global', {
    footer_tagline: 'Bengkel Las Putra Iing Jaya Stainless & Besi',
    footer_desc: 'Bengkel Las Putra Iing Jaya Stainless & Besi adalah pusat fabrikasi logam profesional di Kabupaten Bandung Barat. Kami melayani pembuatan kanopi modern, pagar otomatis/manual, railing tangga, tangga spiral, dan konstruksi baja dengan pengerjaan presisi bergaransi resmi.',
    footer_copyright: '© 2026 Bengkel Las Besi Bandung Barat (Putra Iing Jaya Stainless & Besi). All Rights Reserved.',
  });
  return (
    <footer id="footer" className="relative bg-gradient-to-b from-sky-50/80 via-white to-sky-100/60 text-slate-700 border-t-2 border-sky-200/80 pt-16 pb-12 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Top Trust Features Strip (White cards with sky blue accents) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex items-center space-x-4 p-5 rounded-2xl bg-white/95 border border-sky-100 shadow-sm shadow-sky-100/50 hover:shadow-md hover:border-sky-300 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Garansi Resmi Tertulis</h4>
              <p className="text-xs text-slate-500">Jaminan kebocoran & kekuatan sambungan las kokoh</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-5 rounded-2xl bg-white/95 border border-sky-100 shadow-sm shadow-sky-100/50 hover:shadow-md hover:border-sky-300 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-600/25">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Survey & Estimasi Gratis</h4>
              <p className="text-xs text-slate-500">Konsultasi langsung ke lokasi seluruh Bandung Barat</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-5 rounded-2xl bg-white/95 border border-sky-100 shadow-sm shadow-sky-100/50 hover:shadow-md hover:border-sky-300 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Material SNI & SUS 304</h4>
              <p className="text-xs text-slate-500">Besi hollow galvanis tebal & stainless steel anti-karat</p>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pt-2">
          {/* Col 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block py-1 group">
              <img
                src="/assets/images/logo-bengkel-las-new.png"
                alt="Bengkel Las Besi Bandung Barat"
                width={180}
                height={70}
                style={{ maxHeight: '68px', width: 'auto' }}
                className="h-14 sm:h-16 md:h-[64px] w-auto object-contain transition-all duration-300 group-hover:opacity-90 drop-shadow-sm"
              />
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {content.footer_desc || (
                <>
                  <strong className="text-slate-900 font-bold">{content.footer_tagline || 'Bengkel Las Putra Iing Jaya Stainless & Besi'}</strong> adalah pusat fabrikasi logam profesional di Kabupaten Bandung Barat. Kami melayani pembuatan kanopi modern, pagar otomatis/manual, railing tangga, tangga spiral, dan konstruksi baja dengan pengerjaan presisi bergaransi resmi.
                </>
              )}
            </p>

            {/* Quick WhatsApp Action Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/25 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-sky-100 block font-medium">Konsultasi Cepat via WA:</span>
                <span className="text-sm font-bold font-mono tracking-wide">{COMPANY_INFO.phoneFormatted}</span>
              </div>
              <a
                href={COMPANY_INFO.waLink}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white text-sky-600 font-bold text-xs hover:bg-sky-50 transition shadow-sm active:scale-95"
              >
                Chat Sekarang
              </a>
            </div>
          </div>

          {/* Col 2: Halaman Utama (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 pb-1.5 border-b border-sky-200">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
                Menu Utama
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {[
                { label: 'Home', href: '/' },
                { label: 'Tentang Kami', href: '/tentang-kami' },
                { label: 'Katalog Layanan', href: '/layanan' },
                { label: 'Galeri Proyek', href: '/galeri' },
                { label: 'Artikel & Tips', href: '/artikel' },
                { label: 'Kontak Workshop', href: '/kontak' },
                { label: 'Portal Masuk (Client & Admin)', href: '/login' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center space-x-1.5 text-slate-600 hover:text-sky-600 font-medium transition py-0.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-1 transition-transform" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Layanan Fabrikasi (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center space-x-2 pb-1.5 border-b border-sky-200">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
                Layanan Unggulan
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {[
                'Kanopi Besi & Stainless Steel',
                'Pintu Pagar Otomatis & Manual',
                'Railing Tangga & Balkon SUS 304',
                'Tangga Putar & Tangga Spiral',
                'Rangka Atap Baja Ringan SNI',
                'Pintu Radiasi Timbal Rumah Sakit',
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href="/layanan"
                    className="group flex items-center space-x-1.5 text-slate-600 hover:text-sky-600 font-medium transition py-0.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                    <span className="line-clamp-1">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Informasi Workshop & Lokasi (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center space-x-2 pb-1.5 border-b border-sky-200">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
                Kontak & Lokasi
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-3.5 text-xs">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600 flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Alamat Workshop:</span>
                  <span className="text-slate-600 leading-relaxed block">
                    {COMPANY_INFO.address}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-sky-50 text-emerald-600 flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Telepon / WhatsApp:</span>
                  <a
                    href={COMPANY_INFO.waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 font-mono font-bold hover:underline"
                  >
                    {COMPANY_INFO.phoneFormatted}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600 flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Jam Operasional:</span>
                  <span className="text-slate-600">{COMPANY_INFO.hours}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-800 bg-sky-50/90 px-2.5 py-1.5 rounded-lg border border-sky-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Area: Padalarang, Lembang, Ngamprah, Batujajar, Cimahi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Publisher */}
        <div className="pt-8 border-t border-sky-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pl-24 pr-4">
          <div>
            {content.footer_copyright || `© ${new Date().getFullYear()} Bengkel Las Besi Bandung Barat (Putra Iing Jaya Stainless & Besi). All Rights Reserved.`}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Kabupaten Bandung Barat, Jawa Barat</span>
            <span>•</span>
            <div>
              Published by <a href="https://www.asain.co.id" target="_blank" rel="noreferrer" className="text-sky-600 hover:text-sky-700 font-bold hover:underline">www.asain.co.id</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
