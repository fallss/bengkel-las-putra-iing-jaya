'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ZoomIn, X, MapPin, Phone } from 'lucide-react';
import { GALLERY_ITEMS, COMPANY_INFO, GalleryPhoto } from '@/data/content';
import { usePageContent } from '@/lib/useDynamicData';
import { SubheaderBanner } from '@/components/SubheaderBanner';
import { BounceHeading } from '@/components/BounceHeading';
import { DEFAULT_GALERI_CATEGORIES, type CategoryItem } from '@/lib/categoryDefaults';

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>(GALLERY_ITEMS);
  const [categoryList, setCategoryList] = useState<CategoryItem[]>(DEFAULT_GALERI_CATEGORIES);

  const { content } = usePageContent('galeri', {
    hero_title: 'Galeri Hasil Pengerjaan Nyata',
    hero_subtitle: 'Dokumentasi pengerjaan kanopi, pagar, railing tangga, dan tangga putar kami di berbagai lokasi Kabupaten Bandung Barat & sekitarnya.',
  });

  useEffect(() => {
    fetch('/api/categories?scope=galeri', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategoryList(data.data);
        }
      })
      .catch((e) => console.error(e));

    fetch('/api/photos', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setPhotos(data.data);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const categories = useMemo(
    () => [
      { id: 'all', label: 'Semua Proyek' },
      ...categoryList.map((c) => ({ id: c.slug, label: c.label })),
    ],
    [categoryList]
  );

  const filteredPhotos = activeCategory === 'all'
    ? photos
    : photos.filter((p) => (p.category || '').toLowerCase() === activeCategory.toLowerCase());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
    };
    if (selectedPhoto) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedPhoto]);

  return (
    <div className="min-h-screen bg-white">
      {/* Subheader Banner Full-Width */}
      <SubheaderBanner breadcrumb="home // galeri" pageKey="galeri" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">
        {/* Header Breadcrumb */}
        <div className="border-b border-sky-100 pb-8 text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-sky-600 font-bold bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
            Home // Galeri Proyek
          </span>
          <div className="pt-2">
            <BounceHeading
              text={content.hero_title || 'Galeri Hasil Pengerjaan Nyata'}
              highlightWords={['Galeri', 'Pengerjaan', 'Nyata']}
              shimmerColor="blue"
              className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
              as="h1"
            />
          </div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {content.hero_subtitle || 'Dokumentasi pengerjaan kanopi, pagar, railing tangga, dan tangga putar kami di berbagai lokasi Kabupaten Bandung Barat & sekitarnya.'}
          </p>

        {/* Filter Pills */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 ring-1 ring-sky-400'
                    : 'bg-sky-50 text-slate-700 hover:bg-sky-100/80 border border-sky-100'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of photos */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-sky-100 bg-sky-50/40 text-slate-600 text-sm font-medium">
          Belum ada foto proyek pada kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="min-w-0 group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 shadow-sm cursor-pointer hover:shadow-lg hover:border-sky-300 transition duration-300"
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />

              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                <ZoomIn className="w-8 h-8 drop-shadow" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[90dvh] flex flex-col my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex-1 min-h-0 bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="w-full max-h-[68dvh] object-contain"
                />

                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-black/70 text-white hover:text-sky-400 transition"
                  aria-label="Tutup Lightbox"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="flex-shrink-0 p-4 sm:p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-t border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedPhoto.title}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Lokasi: {selectedPhoto.location}
                  </span>
                </div>

                <a
                  href={`https://api.whatsapp.com/send?phone=${COMPANY_INFO.waNumber}&text=Halo%20Bengkel%20Las%20Bandung%20Barat,%20saya%20tertarik%20dengan%20proyek%20${encodeURIComponent(selectedPhoto.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition flex-shrink-0"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span>Tanya Model Ini di WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}
