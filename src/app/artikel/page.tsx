'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ArrowRight, X } from 'lucide-react';
import { ARTICLES_DATA, ArticleItem } from '@/data/content';
import { SubheaderBanner } from '@/components/SubheaderBanner';
import { BounceHeading } from '@/components/BounceHeading';
import { Pagination } from '@/components/Pagination';
import { usePageContent } from '@/lib/useDynamicData';

const CARDS_PER_PAGE = 6;

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>(ARTICLES_DATA);
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const gridTopRef = useRef<HTMLDivElement>(null);

  const { content } = usePageContent('artikel', {
    hero_title: 'Artikel, Edukasi & Tips Fabrikasi Logam',
    hero_subtitle: 'Informasi seputar pemilihan material besi, perawatan stainless steel, dan tips renovasi kanopi rumah.',
  });

  useEffect(() => {
    const slugFromQuery =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('slug') : null;

    fetch('/api/articles', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const list: ArticleItem[] = data.data;
          setArticles(list);
          if (slugFromQuery) {
            const idx = list.findIndex((a) => a.slug === slugFromQuery);
            if (idx >= 0) {
              setCurrentPage(Math.floor(idx / CARDS_PER_PAGE) + 1);
              setActiveArticle(list[idx]);
            }
          }
        }
      })
      .catch((err) => console.error('Failed loading articles:', err));
  }, []);

  const totalPages = Math.max(1, Math.ceil(articles.length / CARDS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedArticles = articles.slice(
    (safePage - 1) * CARDS_PER_PAGE,
    safePage * CARDS_PER_PAGE
  );

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Subheader Banner Full-Width */}
      <SubheaderBanner breadcrumb="home // artikel" pageKey="artikel" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-10 sm:space-y-12">
        {/* Header Breadcrumb */}
        <div className="border-b border-sky-100 pb-8 text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-sky-600 font-bold bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
            Home // Artikel &amp; Tips
          </span>
          <div className="pt-2">
            <BounceHeading
              text={content.hero_title || 'Artikel, Edukasi & Tips Fabrikasi Logam'}
              highlightWords={['Artikel', 'Edukasi', 'Tips']}
              shimmerColor="blue"
              className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
              as="h1"
            />
          </div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {content.hero_subtitle}
          </p>
        </div>

        {/* Anchor for smooth scroll when switching pages */}
        <div ref={gridTopRef} className="scroll-mt-24 space-y-10">
          {/* Articles Grid (max 6 cards per page) */}
          <div id="artikel-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {paginatedArticles.map((art) => (
              <div
                key={art.slug}
                className="h-full min-w-0 flex flex-col bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-300 transition group"
              >
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden flex-shrink-0">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 min-w-0">
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        {art.date}
                      </span>
                      <span aria-hidden="true">•</span>
                      <span className="break-words min-w-0">{art.author}</span>
                    </div>

                    <h3
                      onClick={() => setActiveArticle(art)}
                      className="text-base font-bold text-slate-900 hover:text-sky-600 transition cursor-pointer break-words"
                    >
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 break-words">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveArticle(art)}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Numbered Pagination (renders whenever articles > 6) */}
          <Pagination
            currentPage={safePage}
            totalItems={articles.length}
            pageSize={CARDS_PER_PAGE}
            onPageChange={handlePageChange}
            itemLabel="artikel"
          />
        </div>

        {/* Article Detail Modal */}
        <AnimatePresence>
          {activeArticle && (
            <div
              onClick={() => setActiveArticle(null)}
              className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 space-y-4 max-h-[88dvh] overflow-y-auto shadow-2xl relative my-auto border border-sky-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        {activeArticle.date}
                      </span>
                      <span aria-hidden="true">•</span>
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        {activeArticle.readTime}
                      </span>
                      <span aria-hidden="true">•</span>
                      <span className="break-words">{activeArticle.author}</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug break-words">
                      {activeArticle.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveArticle(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition flex-shrink-0"
                    aria-label="Tutup Artikel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="w-full aspect-[16/9] max-h-64 rounded-2xl object-cover flex-shrink-0"
                />

                {activeArticle.tags && activeArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {activeArticle.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                  {activeArticle.content.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
