'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Wrench, Image as ImageIcon, BookOpen, MapPin, Phone } from 'lucide-react';
import { SERVICES_DATA, ARTICLES_DATA, COMPANY_INFO, ArticleItem } from '@/data/content';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<ArticleItem[]>(ARTICLES_DATA);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      fetch('/api/articles', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setArticles(data.data);
          }
        })
        .catch(() => {
          // Keep default articles fallback
        });
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Search items database
  const searchPool = [
    ...SERVICES_DATA.map((s) => ({
      title: s.title,
      category: 'Layanan Fabrikasi',
      desc: s.desc,
      href: `/layanan#${s.id}`,
      icon: Wrench,
    })),
    ...articles.map((a) => ({
      title: a.title,
      category: 'Artikel & Panduan',
      desc: a.excerpt,
      href: `/artikel?slug=${encodeURIComponent(a.slug)}`,
      icon: BookOpen,
    })),
    {
      title: 'Galeri Foto Proyek Kanopi, Pagar, & Railing',
      category: 'Portofolio Nyata',
      desc: 'Dokumentasi hasil pengerjaan di perumahan dan ruko Bandung Barat',
      href: '/galeri',
      icon: ImageIcon,
    },
    {
      title: 'Profil Bengkel Las Putra Iing Jaya & Garansi',
      category: 'Tentang Kami',
      desc: 'Pengalaman 15+ tahun, standar material SNI dan SUS 304',
      href: '/tentang-kami',
      icon: Wrench,
    },
    {
      title: 'Alamat Workshop Padalarang Bandung Barat & WhatsApp',
      category: 'Kontak',
      desc: COMPANY_INFO.address,
      href: '/kontak',
      icon: MapPin,
    },
  ];

  const filtered = query.trim() === ''
    ? searchPool.slice(0, 5)
    : searchPool.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[1100] flex items-start justify-center pt-12 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Input Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/50">
            <Search className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kanopi, pagar, stainless, harga, alamat workshop..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Suggestions / Results */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {query ? `Hasil Pencarian (${filtered.length})` : 'Pencarian Populer'}
            </div>

            {filtered.length > 0 ? (
              filtered.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition group border border-transparent hover:border-sky-500/30"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-sky-500 group-hover:text-white transition">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-sky-400 transition">
                          {item.title}
                        </div>
                        <span className="text-xs text-slate-400 block line-clamp-1 mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition flex-shrink-0 ml-2" />
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm text-slate-400">
                  Tidak ditemukan hasil untuk <span className="text-white font-bold">"{query}"</span>
                </p>
                <p className="text-xs text-slate-500">
                  Coba kata kunci lain seperti "kanopi", "pagar", "alderon", atau hubungi kami langsung di WhatsApp.
                </p>
                <a
                  href={COMPANY_INFO.waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 mt-2 rounded-xl bg-sky-500 text-white font-bold text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Tanya Langsung ke Tim CS</span>
                </a>
              </div>
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center px-4">
            <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ESC</kbd> untuk menutup</span>
            <span className="text-sky-400 font-medium">Bengkel Las Besi Bandung Barat</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
