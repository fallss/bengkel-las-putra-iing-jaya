'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Phone,
  Check,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Wrench,
  Ruler
} from 'lucide-react';
import { SERVICES_DATA, COMPANY_INFO } from '@/data/content';
import { CostEstimator } from '@/components/CostEstimator';
import { usePageContent } from '@/lib/useDynamicData';
import { SubheaderBanner } from '@/components/SubheaderBanner';
import { BounceHeading } from '@/components/BounceHeading';
import { DEFAULT_LAYANAN_CATEGORIES, type CategoryItem } from '@/lib/categoryDefaults';

export default function ServicesPage() {
  const { content } = usePageContent('layanan', {
    hero_title: 'Layanan Fabrikasi Besi & Stainless Steel',
    hero_subtitle: 'Semua pengerjaan dapat disesuaikan (custom order) dengan ukuran lokasi dan desain selera Anda. Menggunakan material berkualitas SNI & SUS 304 asli.'
  });

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [services, setServices] = useState(SERVICES_DATA);
  const [categoryList, setCategoryList] = useState<CategoryItem[]>(DEFAULT_LAYANAN_CATEGORIES);

  useEffect(() => {
    fetch('/api/categories?scope=layanan', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategoryList(data.data);
        }
      })
      .catch((e) => console.error(e));

    fetch('/api/services', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setServices(data.data);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const categories = useMemo(
    () => [
      { id: 'all', label: 'Semua Layanan' },
      ...categoryList.map((c) => ({ id: c.slug, label: c.label })),
    ],
    [categoryList]
  );

  const categoryLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categoryList) {
      map.set(c.slug.toLowerCase(), c.label);
    }
    return map;
  }, [categoryList]);

  const filteredServices = selectedFilter === 'all'
    ? services
    : services.filter((s) => (s.category || '').toLowerCase() === selectedFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-white">
      {/* Subheader Banner Full-Width */}
      <SubheaderBanner breadcrumb="home // layanan" pageKey="layanan" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-16">
        {/* Header */}
        <div className="border-b border-sky-100 pb-8 text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-sky-600 font-bold bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
            Home // Katalog Layanan
          </span>
          <div className="pt-2">
            <BounceHeading
              text={content.hero_title || 'Layanan Fabrikasi Besi & Stainless Steel'}
              highlightWords={['Fabrikasi', 'Stainless', 'Besi']}
              shimmerColor="blue"
              className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
              as="h1"
            />
          </div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {content.hero_subtitle}
          </p>

        {/* Filter Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedFilter.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
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

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-sky-100 bg-sky-50/40 text-slate-600 text-sm font-medium">
          Belum ada layanan pada kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((srv, idx) => (
            <motion.div
              key={srv.id}
              id={srv.id}
              initial={{ opacity: 0.92, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.35, delay: Math.min(idx, 5) * 0.04 }}
              className="h-full min-w-0 flex flex-col bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-300 transition group"
            >
              {/* Image */}
              <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative flex-shrink-0">
                <img
                  src={srv.image}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] truncate px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-sky-100 text-sky-700 text-xs font-bold">
                  {categoryLabelMap.get((srv.category || '').toLowerCase()) || srv.category}
                </div>
                <div className="absolute bottom-3 right-3 max-w-[calc(100%-1.5rem)] truncate px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-mono font-bold shadow">
                  {srv.priceRange}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-6 min-w-0">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {srv.desc}
                  </p>

                  {/* Specs Checklist */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    {(Array.isArray(srv.specs) ? srv.specs : []).map((sp, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{sp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={`https://api.whatsapp.com/send?phone=${COMPANY_INFO.waNumber}&text=Halo%20Bengkel%20Las%20Bandung%20Barat,%20saya%20tertarik%20dengan%20layanan%20${encodeURIComponent(srv.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>Whatsapp Kami</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Kalkulator Biaya */}
      <section className="pt-8">
        <CostEstimator />
      </section>
    </div>
  </div>
  );
}
