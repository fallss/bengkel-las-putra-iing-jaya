'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  Phone,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Star,
  Award,
  Sparkles,
  Layers,
  Wrench,
  Camera
} from 'lucide-react';
import { COMPANY_INFO, GALLERY_ITEMS, ARTICLES_DATA, SERVICES_DATA, ArticleItem, GalleryPhoto, ServiceItem } from '@/data/content';
import { CostEstimator } from '@/components/CostEstimator';
import { usePageContent } from '@/lib/useDynamicData';
import { BounceHeading } from '@/components/BounceHeading';
import { Pagination } from '@/components/Pagination';

const HERO_SLIDES = [
  {
    image: '/assets/images/asset_30_banner-2.jpg',
    title: 'Bengkel Las Besi Bandung Barat',
    subtitle: 'Pusat Fabrikasi Kanopi, Pagar, Railing, Tangga & Teralis di Bandung Barat'
  },
  {
    image: '/assets/images/asset_24_Banner-1-revisi.jpg',
    title: 'Bengkel Las Putra Iing Jaya Bandung Barat',
    subtitle: 'Layanan Pengerjaan Stainless & Besi Terbaik di Bandung Barat'
  }
];

const HOME_MAX_SERVICES = 9;
const HOME_MAX_GALLERY = 8;

export default function HomePage() {
  const [[page, direction], setPage] = useState([0, 0]);
  const [services, setServices] = useState<ServiceItem[]>(SERVICES_DATA.slice(0, HOME_MAX_SERVICES));
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(
    [...GALLERY_ITEMS].reverse().slice(0, HOME_MAX_GALLERY)
  );
  const [articles, setArticles] = useState<ArticleItem[]>(ARTICLES_DATA);
  const [articlesPage, setArticlesPage] = useState(1);
  const articlesSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch('/api/services', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setServices(data.data.slice(0, HOME_MAX_SERVICES));
        }
      })
      .catch((err) => console.error('Failed loading home services:', err));

    fetch('/api/photos', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setGalleryPhotos(data.data.slice(0, HOME_MAX_GALLERY));
        }
      })
      .catch((err) => console.error('Failed loading home gallery photos:', err));

    fetch('/api/articles', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setArticles(data.data);
        }
      })
      .catch((err) => console.error('Failed loading home articles:', err));
  }, []);

  const { content } = usePageContent('home', {
    about_intro_badge: 'BENGKEL LAS BESI JOGJA',
    about_intro_phone: '0812 2345 9728',
    about_intro_title: 'Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel',
    about_intro_desc: 'Kami melayani pembuatan berbagai jenis konstruksi besi, seperti pagar, kanopi, dan struktur lainnya yang membutuhkan ketahanan dan kekuatan tinggi.',
    banner_split_image: '/assets/images/banner-kanopi-real.jpg',
    subheader_banner_image: '/assets/images/asset_12_subheader-oke.jpg',
    about_section_image: '/assets/images/asset_12_tentang-kami-1.jpg',
    cta_headline: 'Wujudkan Pagar, Kanopi & Railing Impian Hunian Anda Sekarang',
    cta_desc: 'Konsultasikan desain, ukuran, dan estimasi biaya (RAB) bersama tim ahli Bengkel Las Putra Iing Jaya. Survey lokasi dan konsultasi 100% Gratis di seluruh area Bandung Barat.',
  });

  const heroSlides = React.useMemo(() => {
    if (content?.hero_slides) {
      try {
        const parsed = JSON.parse(content.hero_slides);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing hero_slides:', e);
      }
    }
    return HERO_SLIDES;
  }, [content?.hero_slides]);

  // Scroll Progress indicator at very top
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const paginate = useCallback((newDirection: number) => {
    setPage(([prevPage]) => {
      const nextIndex = (prevPage + newDirection + heroSlides.length) % heroSlides.length;
      return [nextIndex, newDirection];
    });
  }, [heroSlides.length]);

  const safePage = page % heroSlides.length;

  // Auto-play timer (5 seconds per slide) - always runs continuously, never freezes
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [page, paginate]);

  // Luxury Easing curve: Custom cubic bezier for buttery smooth motion
  const LUXURY_EASE = [0.22, 1, 0.36, 1] as const;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : dir < 0 ? '-100%' : 0,
      opacity: 0,
      scale: 1.08,
      filter: 'blur(3px)',
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        x: { duration: 0.85, ease: LUXURY_EASE },
        opacity: { duration: 0.65, ease: 'easeOut' },
        scale: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
        filter: { duration: 0.55, ease: 'easeOut' }
      }
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? '25%' : '-25%', // Cinematic parallax depth shift
      opacity: 0,
      scale: 0.94, // Soft 3D depth recession
      filter: 'blur(3px)',
      transition: {
        x: { duration: 0.8, ease: LUXURY_EASE },
        opacity: { duration: 0.5, ease: 'easeIn' },
        scale: { duration: 0.8, ease: LUXURY_EASE },
        filter: { duration: 0.45 }
      }
    })
  };

  return (
    <div className="pb-24 relative">
      {/* Top Reading Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 origin-left z-[1000] shadow-sm shadow-sky-400/50 pointer-events-none"
        style={{ scaleX }}
      />

      {/* 1. Hero Banner Slider (Directly flush with navbar, 0px gap!) */}
      <section
        className="relative w-full overflow-hidden bg-slate-950 shadow-md select-none m-0 p-0"
      >
        <div className="w-full relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden cursor-grab active:cursor-grabbing">
          {/* Subtle Ambient Vignette & Contrast Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20 z-[5] pointer-events-none" />

          {/* Shimmer Light Flare on Slide Change (Aksen Kilatan Cahaya Las Presisi) */}
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={`shimmer-${page}`}
              initial={{ x: direction >= 0 ? '-100%' : '100%', opacity: 0 }}
              animate={{ x: direction >= 0 ? '200%' : '-200%', opacity: [0, 0.35, 0] }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-300/30 to-transparent -skew-x-12 pointer-events-none z-10"
            />
          </AnimatePresence>

          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -8000 || offset.x < -80) {
                  paginate(1);
                } else if (swipe > 8000 || offset.x > 80) {
                  paginate(-1);
                }
              }}
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              {/* Ken Burns Subtle Ambient Breathing/Glide */}
              <motion.div
                className="w-full h-full"
                animate={{ scale: [1, 1.03] }}
                transition={{ duration: 5, ease: 'easeInOut' }}
              >
                <img
                  src={heroSlides[safePage]?.image || '/assets/images/asset_30_banner-2.jpg'}
                  alt={heroSlides[safePage]?.title || 'Banner Bengkel Las'}
                  className="w-full h-full object-cover object-center pointer-events-none will-change-transform"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls: Elegant Glassmorphism */}
          <motion.button
            whileHover={{ scale: 1.08, backgroundColor: 'rgba(15, 23, 42, 0.75)' }}
            whileTap={{ scale: 0.92 }}
            onClick={() => paginate(-1)}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-slate-950/45 hover:bg-slate-950/75 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-md z-20 shadow-2xl border border-white/20 hover:border-sky-400/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.35)]"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08, backgroundColor: 'rgba(15, 23, 42, 0.75)' }}
            whileTap={{ scale: 0.92 }}
            onClick={() => paginate(1)}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-slate-950/45 hover:bg-slate-950/75 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-md z-20 shadow-2xl border border-white/20 hover:border-sky-400/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.35)]"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5" />
          </motion.button>

          {/* Floating Slide Counter Pill (Top-Right / Minimalist Luxury) */}
          <div className="absolute top-2.5 sm:top-6 right-2.5 sm:right-6 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white/90 text-[10px] sm:text-sm font-mono tracking-widest z-20 shadow-lg pointer-events-none">
            <span className="text-sky-400 font-bold">{String(safePage + 1).padStart(2, '0')}</span>
            <span className="mx-1 text-white/40">/</span>
            <span>{String(heroSlides.length).padStart(2, '0')}</span>
          </div>

          {/* Animated Indicators with Live Glowing Progress Bar */}
          <div className="absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 sm:space-x-2.5 bg-black/45 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full z-20 shadow-xl border border-white/15">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const newDir = i > safePage ? 1 : -1;
                  setPage([i, newDir]);
                }}
                className="relative flex items-center justify-center py-1 px-0.5 group/dot"
                aria-label={`Slide ${i + 1}`}
              >
                {safePage === i ? (
                  <div className="relative w-12 sm:w-16 h-2 rounded-full bg-white/20 overflow-hidden shadow-inner">
                    <motion.div
                      key={safePage}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                      className="h-full bg-gradient-to-r from-sky-400 via-sky-300 to-blue-500 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                    />
                  </div>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40 group-hover/dot:bg-white group-hover/dot:scale-125 transition-all duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content wrapper with generous spacing between sections */}
      <div className="space-y-16 sm:space-y-24 lg:space-y-32 mt-10 sm:mt-20">
        {/* 2. Headline Intro (Format Sesuai Gambar Kiri - Tema Biru Muda & Logo WA) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 space-y-4 sm:space-y-5">
          {/* Top Badge: BENGKEL LAS BESI JOGJA - Warna Biru Muda */}
          <div>
            <span className="inline-block bg-sky-500 text-white text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wide px-4 py-1.5 rounded-lg shadow-sm shadow-sky-200">
              {content.about_intro_badge || 'BENGKEL LAS BESI JOGJA'}
            </span>
          </div>

          {/* Phone Number: 0812 2345 9728 - Warna Biru Muda */}
          <div>
            <a
              href="https://api.whatsapp.com/send?phone=6281223459728"
              target="_blank"
              rel="noreferrer"
              className="inline-block text-2xl sm:text-3xl lg:text-[32px] font-bold text-sky-500 hover:text-sky-600 tracking-wide transition font-mono"
            >
              {content.about_intro_phone || '0812 2345 9728'}
            </a>
          </div>

          {/* Big Heading: Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black text-[#13192f] tracking-tight leading-snug sm:leading-tight max-w-4xl">
            {content.about_intro_title || 'Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel'}
          </h2>

          {/* Split Row: Left Paragraph & Right Free Konsultasi dengan Logo WA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl">
              {content.about_intro_desc || 'Kami melayani pembuatan berbagai jenis konstruksi besi, seperti pagar, kanopi, dan struktur lainnya yang membutuhkan ketahanan dan kekuatan tinggi.'}
            </p>

            <a
              href="https://api.whatsapp.com/send?phone=6281223459728"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2.5 text-sky-600 hover:text-sky-700 font-bold text-sm sm:text-base flex-shrink-0 transition group cursor-pointer"
            >
              {/* Logo WhatsApp Resmi */}
              <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-500/30 flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.585 1.961.94 2.791.94 3.182 0 5.768-2.587 5.768-5.766.001-3.187-2.575-5.77-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.107.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.155.57 4.177 1.564 5.927l-1.564 5.901 6.041-1.585c1.71 1.002 3.693 1.577 5.959 1.577 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <span>{content.about_intro_wa_btn || 'Free Konsultasi'}</span>
            </a>
          </div>

          {/* Action Button: Layanan Kami */}
          <div className="pt-2">
            <Link
              href="/layanan"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#11162b] hover:bg-[#1a223f] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-slate-900/10 transition active:scale-95"
            >
              {content.about_intro_btn || 'Layanan Kami'}
            </Link>
          </div>
        </section>

        {/* Banner Sesuai Gambar 2 (Kiri Foto Netral Ber-opacity + Tombol Hitam, Kanan Biru Muda) */}
        <section className="w-full shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row w-full min-h-[220px] sm:min-h-[250px]">
            {/* Bagian Kiri: Fokus ke Foto Kanopi Asli (Tanpa Warna Biru) dengan Opacity & Tombol Hitam */}
            <div className="relative lg:w-5/12 min-h-[240px] sm:min-h-[260px] bg-slate-950 flex items-center p-8 sm:p-12 lg:p-14 overflow-hidden">
              <img
                src={content.banner_split_image || '/assets/images/banner-kanopi-real.jpg'}
                alt="Pengerjaan Kanopi Carport"
                className="absolute inset-0 w-full h-full object-cover object-[center_35%] opacity-65"
              />
              {/* Overlay Netral Gelap untuk Mempertajam Teks (Tanpa Warna Biru) */}
              <div className="absolute inset-0 bg-black/45 pointer-events-none" />

              <div className="relative z-10 space-y-2.5 max-w-md">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {content.banner_split_title || 'Jasa Bengkel Las Pengerjaan Stainless dan Besi Terbaik'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {content.banner_split_subtitle || 'Bengkel Las Putra Iing Jaya Stainless & Besi'}
                </p>
                <div className="pt-2">
                  <a
                    href={COMPANY_INFO.waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm shadow-lg border border-neutral-700/60 transition active:scale-95"
                  >
                    <span>{content.banner_split_btn || 'Free Konsultasi'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bagian Kanan: Warna Biru Muda dengan Teks Putih Terang */}
            <div className="lg:w-7/12 bg-sky-500 flex items-center p-8 sm:p-12 lg:p-16">
              <p className="text-sm sm:text-base lg:text-[17px] text-white leading-relaxed max-w-2xl font-medium">
                {content.banner_split_desc || 'Kami menyediakan berbagai layanan pengerjaan stainless steel dan besi berkualitas, termasuk kanopi, railing, pintu pagar otomatis, tangga, dan lainnya.'}
              </p>
            </div>
          </div>
        </section>

        {/* 3. 9 Featured Services Grid (Staggered Scroll Entrance & Card Hover Lift) */}
        <section id="layanan-kami" className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
              {content.services_badge || 'Katalog Unggulan'}
            </span>
            <div>
              <BounceHeading
                text={content.services_title || 'Layanan Fabrikasi Kami Meliputi:'}
                highlightWords={['Fabrikasi', 'Layanan']}
                shimmerColor="blue"
                className="text-2xl sm:text-3xl font-bold text-slate-900 pt-2"
                as="h2"
              />
            </div>
          </div>

          <div id="home-services-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {services.slice(0, HOME_MAX_SERVICES).map((srv, idx) => (
              <motion.div
                key={srv.id || idx}
                initial={{ opacity: 0.92, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.4, delay: (idx % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="h-full min-w-0 flex flex-col bg-white rounded-2xl border border-sky-100/90 overflow-hidden shadow-sm hover:shadow-2xl hover:border-sky-300 transition-all duration-300 group"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden flex-shrink-0">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition duration-700"
                  />
                </div>

                <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-6 min-w-0">
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition break-words">
                      {srv.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                    <Link
                      href={srv.id ? `/layanan#${encodeURIComponent(srv.id)}` : '/layanan'}
                      className="flex-1 min-w-[110px] text-center px-4 py-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition whitespace-nowrap"
                    >
                      Detail Layanan
                    </Link>

                    <a
                      href={`https://api.whatsapp.com/send?phone=${COMPANY_INFO.waNumber}&text=Halo%20Bengkel%20Las%20Bandung%20Barat,%20saya%20tertarik%20dengan%20${encodeURIComponent(srv.title)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[110px] text-center px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition shadow-sm shadow-sky-200 whitespace-nowrap"
                    >
                      Whatsapp Kami
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. Subheader Banner & Breadcrumb Ticker Sesuai Gambar Kanan */}
        <div className="w-full">
          <div className="relative w-full aspect-[21/5.2] sm:aspect-[21/4.75] min-h-[88px] sm:min-h-[130px] lg:min-h-[160px] bg-slate-950 overflow-hidden shadow-sm">
            <img
              src={content.subheader_banner_image || '/assets/images/asset_12_subheader-oke.jpg'}
              alt="Bengkel Las Besi Bandung Barat Subheader"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Subheader Breadcrumb & Running Text Ticker Sesuai Gambar Kanan */}
          <div className="w-full bg-white border-b border-slate-200/80 shadow-[0_15px_30px_0_rgba(0,0,0,0.03)] py-3 sm:py-4 px-3 sm:px-8 lg:px-16">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-6">
              {/* Bagian Kiri: Icon Hamburger Biru Muda + Teks home // profil + Pembatas Vertikal */}
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
                  <span className="text-[11px] sm:text-xs text-slate-600 font-normal whitespace-nowrap">
                    home // profil
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-300 ml-2 sm:ml-5 mr-1.5 sm:mr-4 flex-shrink-0" />
              </div>

              {/* Bagian Tengah: Teks Bergerak (Running Text Marquee) dengan Bintang Warna Biru */}
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="running-marquee items-center gap-10 text-xs text-slate-700 font-normal select-none">
                  {/* Loop 1 */}
                  <div className="flex items-center gap-10 flex-shrink-0">
                    <span>Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel</span>
                    <span className="text-sky-500 font-bold text-xs">★</span>
                    <span>Pengerjaan Cepat, Rapi &amp; Bergaransi Resmi di Bandung Barat</span>
                    <span className="text-slate-300">•</span>
                    <span>WhatsApp: 0812 2345 9728</span>
                    <span className="text-sky-500 font-bold text-xs">★</span>
                  </div>
                  {/* Loop 2 (Seamless loop) */}
                  <div className="flex items-center gap-10 flex-shrink-0">
                    <span>Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel</span>
                    <span className="text-sky-500 font-bold text-xs">★</span>
                    <span>Pengerjaan Cepat, Rapi &amp; Bergaransi Resmi di Bandung Barat</span>
                    <span className="text-slate-300">•</span>
                    <span>WhatsApp: 0812 2345 9728</span>
                    <span className="text-sky-500 font-bold text-xs">★</span>
                  </div>
                </div>
              </div>

              {/* Bagian Kanan: Tombol Pill Whatsapp Navy Blue dengan Panah */}
              <div className="flex-shrink-0">
                <a
                  href="https://api.whatsapp.com/send?phone=6281223459728"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-[#0c1145] hover:bg-sky-500 text-white font-medium text-[11px] sm:text-xs transition-colors duration-200 shadow-sm group whitespace-nowrap"
                >
                  <span>Whatsapp</span>
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

        {/* 5. Tentang Kami Section (Horizontal Split Scroll Reveal) */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0.9, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 space-y-6 text-sm text-slate-700 leading-relaxed min-w-0"
            >
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
                {content.about_section_badge || 'Bengkel Las Besi Bandung Barat'}
              </span>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {content.about_section_title || 'Bengkel Las Putra Iing Jaya Stainless & Besi'}
              </h2>

              <p className="text-sm sm:text-base leading-relaxed">
                {content.about_section_p1 || 'Kami spesialis dalam pengerjaan stainless steel dan besi untuk berbagai kebutuhan arsitektural dan residensial di Kabupaten Bandung Barat, mulai dari pembuatan kanopi modern, railing, tangga, hingga pintu pagar otomatis dan manual.'}
              </p>

              <p className="text-sm sm:text-base leading-relaxed">
                {content.about_section_p2 || 'Berdiri dengan tujuan memberikan solusi konstruksi yang kokoh, tahan lama, dan estetik, kami selalu mengutamakan kualitas setiap proyek. Dengan pengalaman yang kami miliki, tim ahli kami siap memberikan hasil pengerjaan yang sesuai dengan keinginan anda.'}
              </p>

              <div className="pt-3">
                <motion.div whileHover={{ x: 4 }}>
                  <Link
                    href="/layanan"
                    className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-200 transition"
                  >
                    <span>{content.about_section_btn || 'Semua Layanan'}</span>
                    <ArrowRight className="w-4 h-4 text-sky-200" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0.9, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 min-w-0"
            >
              <div className="rounded-3xl overflow-hidden shadow-xl border border-sky-100 aspect-[4/3] group">
                <img
                  src={content.about_section_image || '/assets/images/asset_12_tentang-kami-1.jpg'}
                  alt="Tentang Bengkel Las Putra Iing Jaya Bandung Barat"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 6. Stats Counter Bar (Format Sesuai Gambar Kanan dengan 4 Statistik Lengkap) */}
        <section className="w-full bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="flex flex-col lg:flex-row w-full h-auto lg:h-[135px]">
            {/* Bagian Kiri: Tab Konsultasi + 4 Kolom Statistik Sesuai Gambar Kanan */}
            <div className="lg:w-7/12 flex items-stretch bg-white">
              {/* Tab Vertikal 'Konsultasi' */}
              <a
                href="https://api.whatsapp.com/send?phone=6281223459728"
                target="_blank"
                rel="noreferrer"
                title="Konsultasi WhatsApp"
                className="w-10 sm:w-12 bg-[#000434] hover:bg-sky-600 transition-colors duration-200 flex items-center justify-center flex-shrink-0 cursor-pointer group py-4"
              >
                <span className="text-white text-[11px] font-semibold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180 group-hover:scale-105 transition-transform select-none">
                  {content.stat_tab_text || 'Konsultasi'}
                </span>
              </a>

              {/* 4 Kolom Statistik dalam 1 Baris Elegan dengan Font Biru */}
              <div className="flex-1 flex items-center px-4 sm:px-10 lg:px-12 py-5 lg:py-0 min-w-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 lg:gap-10 w-full">
                  {/* Item 1 */}
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-[26px] font-medium text-sky-500 tracking-tight leading-none">
                      {content.stat_val_1 || '1550+'}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal leading-tight">
                      {content.stat_lbl_1 || 'Proyek Selesai.'}
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-[26px] font-medium text-sky-500 tracking-tight leading-none">
                      {content.stat_val_2 || '99%'}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal leading-tight">
                      {content.stat_lbl_2 || 'Hasil Memuaskan.'}
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-[26px] font-medium text-sky-500 tracking-tight leading-none">
                      {content.stat_val_3 || '15+'}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal leading-tight">
                      {content.stat_lbl_3 || 'Tahun Jam Terbang'}
                    </p>
                  </div>

                  {/* Item 4 */}
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-[26px] font-medium text-sky-500 tracking-tight leading-none">
                      {content.stat_val_4 || '100%'}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal leading-tight">
                      {content.stat_lbl_4 || 'Jaminan Garansi Resmi'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian Kanan: Foto Pengelasan Sesuai Gambar Kanan */}
            <div className="lg:w-5/12 relative h-[140px] lg:h-[135px] bg-slate-900 overflow-hidden">
              <img
                src={content.welder_stats_image || "/assets/images/welder-stats.jpg"}
                alt="Pengelasan Proyek Bengkel Las"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </section>

        {/* 7. Interactive Cost Estimator (Smooth scroll reveal) */}
        <motion.section
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.9  }}
          className="max-w-7xl mx-auto px-6 sm:px-8"
        >
          <CostEstimator />
        </motion.section>

        {/* 8. Layanan Terbaik & Portofolio Proyek */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3 max-w-3xl mx-auto"
          >
            <div>
              <BounceHeading
                text={content.gallery_title || 'Layanan Terbaik & Portofolio Proyek'}
                highlightWords={['Terbaik', 'Portofolio']}
                shimmerColor="blue"
                className="text-2xl sm:text-3xl font-extrabold text-slate-900"
                as="h2"
              />
            </div>
            <h5 className="text-base sm:text-lg font-bold text-sky-600">
              {content.gallery_subtitle || 'Pengerjaan Nyata di Bandung Barat'}
            </h5>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {content.gallery_desc || 'Kami siap menangani berbagai jenis proyek di Padalarang, Lembang, Ngamprah, Kotabaru Parahyangan, dari yang kecil hingga besar, dengan kualitas pengerjaan terbaik.'}
            </p>
          </motion.div>

          <div id="home-gallery-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {galleryPhotos.slice(0, HOME_MAX_GALLERY).map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0.92, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="min-w-0"
              >
                <Link
                  href="/galeri"
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-sky-100 shadow-sm hover:border-sky-300 block hover:shadow-lg transition duration-300"
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-end p-4 text-white">
                    <span className="text-xs font-bold line-clamp-1">{photo.title}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center pt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link
                href="/galeri"
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition"
              >
                <span>{content.gallery_btn || 'Galeri Lainnya'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* 9. 4 Keunggulan (Why Us) - Desain Elegan dengan SVG & Dasar Biru Muda-Putih */}
        <section className="bg-gradient-to-b from-sky-50/70 via-white to-sky-50/50 border-y border-sky-100 pt-16 sm:pt-20 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
            {/* Header Section */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-sky-700 bg-sky-100/80 px-4 py-1.5 rounded-full border border-sky-200/70 shadow-sm">
                {content.advantages_badge || 'Mengapa Memilih Kami'}
              </span>
              <div>
                <BounceHeading
                  text={content.advantages_title || 'Keunggulan Layanan Kami'}
                  highlightWords={['Keunggulan', 'Layanan']}
                  shimmerColor="blue"
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
                  as="h2"
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {content.advantages_desc || 'Komitmen mutu terbaik dan pelayanan prima untuk setiap proyek pengelasan & fabrikasi di Bandung Barat.'}
              </p>
            </div>

            {/* 4 Cards Grid dengan SVG Icon Elegan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  num: '01',
                  title: content.adv_title_1 || 'Material Berkualitas',
                  desc: content.adv_desc_1 || 'Menggunakan bahan terbaik untuk memastikan ketahanan cuaca Bandung Barat.',
                  icon: (
                    <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  )
                },
                {
                  num: '02',
                  title: content.adv_title_2 || 'Profesional & Berpengalaman',
                  desc: content.adv_desc_2 || 'Memiliki tim berpengalaman dibidang pengelasan lebih dari 10 Tahun.',
                  icon: (
                    <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6" />
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                    </svg>
                  )
                },
                {
                  num: '03',
                  title: content.adv_title_3 || 'Harga Kompetitif',
                  desc: content.adv_desc_3 || 'Memberikan solusi terbaik tanpa membebani anggaran Anda.',
                  icon: (
                    <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                  )
                },
                {
                  num: '04',
                  title: content.adv_title_4 || 'Gratis Konsultasi',
                  desc: content.adv_desc_4 || 'Konsultasi dan survey lokasi di Bandung Barat tanpa dipungut biaya apapun.',
                  icon: (
                    <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M8 9h8" />
                      <path d="M8 13h6" />
                    </svg>
                  )
                }
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="min-w-0 h-full relative p-6 sm:p-7 rounded-2xl bg-white border border-sky-100 shadow-[0_10px_30px_rgba(14,165,233,0.06)] hover:shadow-[0_20px_45px_rgba(14,165,233,0.16)] hover:border-sky-300 transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between overflow-hidden"
                >
                  {/* Subtle decorative background light blue glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-100/50 to-transparent rounded-bl-full pointer-events-none group-hover:from-sky-200/50 transition-colors" />

                  <div className="space-y-5 relative z-10">
                    {/* Header: Icon Box + Number */}
                    <div className="flex items-center justify-between">
                      <div className="w-13 h-13 p-3.5 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 text-white shadow-md shadow-sky-400/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        {card.icon}
                      </div>
                      <span className="text-xs font-black font-mono text-sky-300 group-hover:text-sky-500 transition-colors tracking-wider">
                        {card.num}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                        {card.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Accent Line */}
                  <div className="pt-6 relative z-10">
                    <div className="w-8 h-1 rounded-full bg-sky-200 group-hover:w-full group-hover:bg-sky-500 transition-all duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. CTA Section dengan Fixed Background Image (Parallax pada layar tablet/desktop) + Overlay Opacity */}
        <section className="cta-fabrikasi relative w-full !mt-3 sm:!mt-4 min-h-[300px] sm:min-h-[400px] flex items-center justify-center text-center py-12 sm:py-16 px-4 sm:px-8 overflow-hidden [clip-path:inset(0)]">
          {/* Background Image - Absolute di mobile Android agar stabil saat URL bar scroll, Fixed di layar md+ */}
          <div
            className="absolute md:fixed inset-0 w-full h-full pointer-events-none bg-center bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url('${content.cta_bg_image || '/assets/images/cta-fabrikasi-bg.jpg'}')`,
            }}
          />

          {/* Overlay Warna Gelap rgba(0, 0, 0, 0.65) */}
          <div
            className="absolute inset-0 z-10"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
          />

          {/* Konten Teks & Tombol (z-index: 20 - bergerak mengikuti scroll) */}
          <div className="cta-fabrikasi__content relative z-20 max-w-[850px] mx-auto text-center space-y-4 px-4">
            <div>
              <BounceHeading
                text={content.cta_headline || 'Jasa Fabrikasi Las Terbaik'}
                highlightWords={['Fabrikasi', 'Las', 'Terbaik']}
                shimmerColor="gold"
                className="text-[26px] sm:text-[32px] font-[800] tracking-[0.5px] leading-[1.3] text-[#ffb400]"
                as="h2"
              />
            </div>
            <p
              className="text-[17px] font-[400] leading-[1.8] text-[#f3f4f6] max-w-2xl mx-auto"
              style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif" }}
            >
              {content.cta_desc || 'Butuh solusi terbaik untuk kebutuhan kanopi, railing, pagar, atau konstruksi lainnya? Jangan ragu untuk berkonsultasi langsung dengan kami secara gratis!'}
            </p>
            <div className="pt-2">
              <a
                href={COMPANY_INFO.waLink}
                target="_blank"
                rel="noreferrer"
                className="cta-fabrikasi__btn inline-block bg-[#0e1738] hover:bg-[#ffb400] text-white hover:text-slate-900 text-[16px] font-[700] leading-[1.4] tracking-[0.5px] px-8 py-3.5 rounded-full border border-blue-900/60 hover:border-[#ffb400] shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif" }}
              >
                {content.cta_btn_text || 'Hubungi Kami'}
              </a>
            </div>
          </div>
        </section>

        {/* 11. Informasi Terbaru (Articles - Max 6 Cards Per Page + Numbered Pagination) */}
        <section
          id="informasi-terbaru"
          ref={articlesSectionRef}
          className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10 !mt-6 sm:!mt-8 scroll-mt-24"
        >
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div>
              <BounceHeading
                text={content.articles_section_title || 'Informasi & Edukasi Terbaru'}
                highlightWords={['Informasi', 'Terbaru']}
                shimmerColor="blue"
                className="text-2xl sm:text-3xl font-extrabold text-slate-900"
                as="h2"
              />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {content.articles_section_desc || 'Berikut adalah beberapa artikel informatif dan inspiratif yang dapat membantu Anda memahami layanan kami lebih dalam'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {articles
              .slice((articlesPage - 1) * 6, articlesPage * 6)
              .map((art, idx) => (
                <motion.div
                  key={art.slug || idx}
                  initial={{ opacity: 0.92, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="h-full min-w-0 flex flex-col bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-2xl hover:border-sky-300 transition group"
                >
                  <div className="aspect-[16/10] bg-slate-100 overflow-hidden flex-shrink-0">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                    />
                  </div>

                  <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-5 min-w-0">
                    <div className="space-y-2.5 min-w-0">
                      <span className="inline-block text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md">Post</span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-600 transition leading-snug break-words">
                        <Link href={`/artikel?slug=${encodeURIComponent(art.slug)}`}>{art.title}</Link>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 break-words">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <Link
                        href={`/artikel?slug=${encodeURIComponent(art.slug)}`}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-600 hover:text-sky-700"
                      >
                        <span>Selengkapnya</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          <Pagination
            currentPage={articlesPage}
            totalItems={articles.length}
            pageSize={6}
            onPageChange={(next) => {
              setArticlesPage(next);
              articlesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            itemLabel="artikel"
          />
        </section>
      </div>
    </div>
  );
}
