'use client';

import React from 'react';
import { COMPANY_INFO } from '@/data/content';
import { usePageContent, useSiteSettings } from '@/lib/useDynamicData';
import { DEFAULT_TICKER_ITEMS, parseTickerItems } from '@/lib/tickerUtils';

interface RunningTickerStripProps {
  breadcrumb?: string;
}

export function RunningTickerStrip({ breadcrumb = 'home // profil' }: RunningTickerStripProps) {
  const { content: globalContent } = usePageContent('global', {
    ticker_text_1: DEFAULT_TICKER_ITEMS[0],
    ticker_text_2: DEFAULT_TICKER_ITEMS[1],
    ticker_phone: 'WhatsApp: 0812 2345 9728',
    ticker_btn_label: 'Whatsapp',
  });

  const settings = useSiteSettings({
    whatsapp: COMPANY_INFO.waNumber,
    ticker_items: JSON.stringify(DEFAULT_TICKER_ITEMS),
    ticker_text_1: DEFAULT_TICKER_ITEMS[0],
    ticker_text_2: DEFAULT_TICKER_ITEMS[1],
    ticker_phone: 'WhatsApp: 0812 2345 9728',
    ticker_btn_label: 'Whatsapp',
  });

  const tickerItems = parseTickerItems(settings, globalContent);
  const tickerPhone = settings.ticker_phone || globalContent.ticker_phone || 'WhatsApp: 0812 2345 9728';
  const tickerBtnLabel = settings.ticker_btn_label || globalContent.ticker_btn_label || 'Whatsapp';
  const waDigits = (settings.whatsapp || COMPANY_INFO.waNumber || '').replace(/\D/g, '') || COMPANY_INFO.waNumber;

  const renderLoop = (loopKey: string) => (
    <div key={loopKey} className="flex items-center gap-10 flex-shrink-0">
      {tickerItems.map((text, idx) => (
        <React.Fragment key={`${loopKey}-${idx}`}>
          <span>{text}</span>
          {idx < tickerItems.length - 1 ? (
            <span className="text-sky-500 font-bold text-xs">★</span>
          ) : (
            <span className="text-slate-300">•</span>
          )}
        </React.Fragment>
      ))}
      {tickerPhone && (
        <>
          <span>{tickerPhone}</span>
          <span className="text-sky-500 font-bold text-xs">★</span>
        </>
      )}
    </div>
  );

  return (
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
            {renderLoop('loop-1')}
            {renderLoop('loop-2')}
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
            <span>{tickerBtnLabel}</span>
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
  );
}
