'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Wrench,
  Settings,
  Database,
  ExternalLink,
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        router.push('/admin/login');
      })
      .finally(() => setLoading(false));
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Memuat Admin Panel...</p>
        </div>
      </div>
    );
  }

  const NAV_ITEMS = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Halaman & Banner', href: '/admin/pages', icon: FileText },
    { label: 'Kelola Foto & Galeri', href: '/admin/photos', icon: ImageIcon },
    { label: 'Kelola Layanan', href: '/admin/services', icon: Wrench },
    { label: 'Kelola Artikel', href: '/admin/articles', icon: BookOpen },
    { label: 'Pengaturan Kontak', href: '/admin/settings', icon: Settings },
    { label: 'Koneksi DBeaver', href: '/admin/database', icon: Database },
  ];

  return (
    <div className="min-h-dvh md:h-dvh md:overflow-hidden bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="sticky top-0 z-30 md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-sky-400" />
          <span className="font-bold text-sm tracking-wide">ADMIN BENGKEL LAS</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
          aria-label="Toggle Menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 md:static md:z-auto w-64 shrink-0 h-dvh md:h-full bg-slate-900 text-white flex flex-col overflow-hidden transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-sm text-white tracking-wide truncate">PANEL ADMIN</h1>
              <p className="text-[11px] text-sky-400 font-mono truncate">bengkel.db (SQLite)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links (scrollable on short screens) */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3 shrink-0 bg-slate-900">
          <div className="bg-slate-800/80 rounded-xl p-3 flex items-center space-x-3">
            <div className="w-8 h-8 shrink-0 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Admin'}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DBeaver Ready
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Web</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-medium transition flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (independent scroll on desktop) */}
      <main className="flex-1 min-w-0 md:h-full md:overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto pb-6">{children}</div>
      </main>
    </div>
  );
}

