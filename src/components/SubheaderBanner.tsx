'use client';

import React from 'react';
import { usePageContent, useSiteSettings } from '@/lib/useDynamicData';

interface SubheaderBannerProps {
  breadcrumb?: string;
  bannerImage?: string;
  pageKey?: string;
}

export function SubheaderBanner({
  breadcrumb = 'home // profil',
  bannerImage,
  pageKey,
}: SubheaderBannerProps) {
  // If pageKey is provided and bannerImage is not passed explicitly, load dynamic banner
  const { content: pageContent } = usePageContent(pageKey || '', {});
  const { content: globalContent } = usePageContent('global', {
    ticker_text_1: 'Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel',
    ticker_text_2: 'Pengerjaan Cepat, Rapi & Bergaransi Resmi di Bandung Barat',
    ticker_phone: 'WhatsApp: 0812 2345 9728',
    ticker_btn_label: 'Whatsapp',
  });
  const settings = useSiteSettings({
    whatsapp: '6281223459728',
    ticker_text_1: 'Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel',
    ticker_text_2: 'Pengerjaan Cepat, Rapi & Bergaransi Resmi di Bandung Barat',
    ticker_phone: 'WhatsApp: 0812 2345 9728',
    ticker_btn_label: 'Whatsapp',
  });
  const activeImage = bannerImage || pageContent?.banner_image || '/assets/images/asset_12_subheader-oke.jpg';

  const t1 = settings.ticker_text_1 || globalContent.ticker_text_1 || 'Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel';
  const t2 = settings.ticker_text_2 || globalContent.ticker_text_2 || 'Pengerjaan Cepat, Rapi & Bergaransi Resmi di Bandung Barat';
  const tp = settings.ticker_phone || globalContent.ticker_phone || 'WhatsApp: 0812 2345 9728';
  const btnLabel = settings.ticker_btn_label || globalContent.ticker_btn_label || 'Whatsapp';
  const waDigits = (settings.whatsapp || '6281223459728').replace(/\D/g, '') || '6281223459728';

  return (
    <div className="w-full">
      {/* Subheader Banner Image */}
      <div className="relative w-full aspect-[21/5.2] sm:aspect-[21/4.75] min-h-[88px] sm:min-h-[130px] lg:min-h-[160px] bg-slate-950 overflow-hidden shadow-sm">
        <img
          src={activeImage}
          alt="Bengkel Las Besi Bandung Barat Subheader"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Subheader Breadcrumb & Running Text Ticker */}
      <div className="w-full bg-white border-b border-slate-200/80 shadow-[0_15px_30px_0_rgba(0,0,0,0.03)] py-3 sm:py-4 px-3 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-6">
          {/* Bagian Kiri: Icon Hamburger Biru Muda + Teks Breadcrumb + Pembatas Vertikal */}
          <div className="flex items-center flex-shrink-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2 text-slate-500">
              <svg
                className="w-4 h-4 text-sky-400 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="text-[11px] sm:text-xs text-slate-600 font-normal lowercase whitespace-nowrap">
                {breadcrumb}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-300 ml-2 sm:ml-5 mr-1.5 sm:mr-4 flex-shrink-0" />
          </div>

          {/* Bagian Tengah: Teks Bergerak (Running Text Marquee) dengan Bintang Biru */}
          <div className="flex-1 overflow-hidden min-w-0">
            <div className="running-marquee items-center gap-10 text-xs text-slate-700 font-normal select-none">
              {/* Loop 1 */}
              <div className="flex items-center gap-10 flex-shrink-0">
                <span>{t1}</span>
                <span className="text-sky-500 font-bold text-xs">★</span>
                <span>{t2}</span>
                <span className="text-slate-300">•</span>
                <span>{tp}</span>
                <span className="text-sky-500 font-bold text-xs">★</span>
              </div>
              {/* Loop 2 (Seamless loop) */}
              <div className="flex items-center gap-10 flex-shrink-0">
                <span>{t1}</span>
                <span className="text-sky-500 font-bold text-xs">★</span>
                <span>{t2}</span>
                <span className="text-slate-300">•</span>
                <span>{tp}</span>
                <span className="text-sky-500 font-bold text-xs">★</span>
              </div>
            </div>
          </div>

          {/* Bagian Kanan: Tombol Pill Whatsapp Navy Blue dengan Panah */}
          <div className="flex-shrink-0">
            <a
              href={`https://api.whatsapp.com/send?phone=${waDigits}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-[#0c1145] hover:bg-sky-500 text-white font-medium text-[11px] sm:text-xs transition-colors duration-200 shadow-sm group whitespace-nowrap"
            >
              <span>{btnLabel}</span>
              <svg
                className="w-3.5 h-3.5 fill-current group-hover:translate-x-0.5 transition-transform"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm10.354-.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L9.793 7.5H5a.5.5 0 0 0 0 1h4.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

