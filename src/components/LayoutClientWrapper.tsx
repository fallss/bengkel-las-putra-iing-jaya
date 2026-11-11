'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SearchModal } from './SearchModal';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { BackToTop } from './BackToTop';

export const LayoutClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const isIsolated = pathname?.startsWith('/admin') || pathname === '/login' || pathname?.startsWith('/client');

  if (isIsolated) {
    return <div className="min-h-dvh bg-slate-50 font-sans overflow-x-clip">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#28231d]">
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <BackToTop />
    </div>
  );
};
