'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  Phone,
  ShieldCheck,
  Instagram,
  Facebook,
  Youtube,
  User,
  ArrowRight,
  UserCheck,
  Home,
  Building2,
  Wrench,
  Camera,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageContent } from '@/lib/useDynamicData';

interface NavbarProps {
  onOpenSearch: () => void;
}

const NAV_LINKS = [
  { text: 'Home', href: '/', icon: Home },
  { text: 'Tentang Kami', href: '/tentang-kami', icon: Building2 },
  { text: 'Layanan', href: '/layanan', icon: Wrench },
  { text: 'Galeri', href: '/galeri', icon: Camera },
  { text: 'Artikel', href: '/artikel', icon: BookOpen },
  { text: 'Kontak', href: '/kontak', icon: Phone },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isShrink, setIsShrink] = useState(false);

  const { content } = usePageContent('global', {
    topbar_tagline: 'Bengkel Las Stainless Steel Terbaik',
    topbar_phone: '+62 812-2345-9728',
    topbar_login_text: 'Portal Masuk',
    nav_login_text: 'Masuk'
  });

  useEffect(() => {
    const scrollThreshold = 60;
    let ticking = false;

    const updateHeader = () => {
      const scrolled = window.scrollY > scrollThreshold;
      setIsShrink(scrolled);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateHeader();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* 1. Top Bar matching user screenshot with crisp Light Blue accents */}
      <div className="w-full bg-sky-50/70 border-b border-sky-100/80 text-[11px] sm:text-[12px] text-slate-600 py-2 px-3 sm:px-8">
        <div className="pagewidth max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          {/* Left: Tagline & Phone */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <div className="flex items-center space-x-1.5 text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span className="font-medium text-center">{content.topbar_tagline || 'Bengkel Las Stainless Steel Terbaik'}</span>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <a
                href="https://api.whatsapp.com/send?phone=6281223459728"
                target="_blank"
                rel="noreferrer"
                className="hover:text-sky-600 transition font-medium whitespace-nowrap"
              >
                {content.topbar_phone || '+62 812-2345-9728'}
              </a>
            </div>
          </div>

          {/* Right: Social Media */}
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 sm:gap-x-5 gap-y-1 text-slate-500 text-[11px]">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 hover:text-sky-600 transition"
            >
              <Instagram className="w-3 h-3 text-sky-500" />
              <span className="hidden md:inline">Instagram</span>
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 hover:text-sky-600 transition"
            >
              <Facebook className="w-3 h-3 text-sky-500" />
              <span className="hidden md:inline">Facebook</span>
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 hover:text-sky-600 transition"
            >
              <Youtube className="w-3 h-3 text-sky-500" />
              <span className="hidden md:inline">Youtube</span>
            </a>

            <span className="text-slate-300">|</span>

            <Link
              href="/login"
              className="flex items-center space-x-1 font-bold text-sky-600 hover:text-sky-700 transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-500" />
              <span>{content.topbar_login_text || 'Portal Masuk'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Shrinking Header (#headerwrap) - Sesuai Spesifikasi WebRecon */}
      <header
        id="headerwrap"
        className={`tf_box w-full select-none ${isShrink ? 'is-shrink' : ''}`}
      >
        <div className="pagewidth max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Logo - Ukuran pas & menyusut halus saat discroll (0.3s ease-in-out) */}
          <Link href="/" className="site-logo flex items-center group py-0.5 shrink-0">
            <img
              src="/assets/images/logo-bengkel-las-new.png"
              alt="Bengkel Las Besi Bandung Barat"
              width={180}
              height={78}
              style={{
                maxHeight: isShrink ? '52px' : '72px',
                width: 'auto',
                transition: 'max-height 0.3s ease-in-out, transform 0.3s ease-in-out',
              }}
              className="h-12 sm:h-16 lg:h-auto w-auto object-contain group-hover:scale-105"
            />
          </Link>

          {/* Desktop/Laptop Nav Items (lg+ so 768px tablets never wrap links vertically) */}
          <nav className="main-nav hidden lg:flex items-center space-x-2 xl:space-x-5 text-[13.5px] font-['Plus_Jakarta_Sans',sans-serif]">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative group inline-flex items-center space-x-1.5 py-1.5 px-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-sky-600 font-semibold'
                      : 'text-slate-700 hover:text-sky-600 font-medium hover:bg-sky-50/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${
                      isActive
                        ? 'text-sky-600 stroke-[2.2]'
                        : 'text-slate-400 group-hover:text-sky-500 stroke-[1.8]'
                    }`}
                  />
                  <span className="tracking-tight">{link.text}</span>

                  {/* Minimalist Active Underline Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute -bottom-1 left-2 right-2 h-[2.5px] bg-sky-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Search Button with subtle hover circle */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full text-slate-600 hover:text-sky-600 hover:bg-sky-50/80 transition-all duration-200 ml-1"
              aria-label="Cari"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Login / Portal Pill Button */}
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-sky-50/80 hover:bg-sky-500 text-sky-700 hover:text-white border border-sky-200 hover:border-sky-500 text-xs font-semibold font-['Plus_Jakarta_Sans',sans-serif] tracking-tight transition-all duration-200 shadow-sm hover:shadow ml-1"
              title="Portal Login Client & Admin"
            >
              <User className="w-3.5 h-3.5 stroke-[2]" />
              <span>{content.nav_login_text || 'Masuk'}</span>
            </Link>
          </nav>

          {/* Mobile & Tablet Right Controls */}
          <div className="flex lg:hidden items-center space-x-1.5 sm:space-x-2">
            <Link
              href="/login"
              className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200"
              aria-label="Login"
              title="Portal Masuk"
            >
              <User className="w-4 h-4" />
            </Link>

            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-700 hover:text-sky-500"
              aria-label="Cari"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-sky-500"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mobile-menu lg:hidden border-t border-sky-100 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-4 space-y-2 shadow-lg max-h-[calc(100dvh-5rem)] overflow-y-auto"
            >
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-['Plus_Jakarta_Sans',sans-serif] transition ${
                      isActive
                        ? 'text-sky-600 bg-sky-50 font-semibold'
                        : 'text-slate-700 hover:bg-sky-50/50 hover:text-sky-600 font-medium'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-sky-600 stroke-[2.2]'
                          : 'text-slate-400 stroke-[1.8]'
                      }`}
                    />
                    <span className="tracking-tight">{link.text}</span>
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-sky-100">
                <Link
                  href="/login"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm transition"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Masuk Portal (Client & Admin)</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
