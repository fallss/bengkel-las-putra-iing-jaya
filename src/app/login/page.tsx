'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Phone,
  Home,
  CheckCircle2,
  Database,
  ArrowLeft,
  KeyRound,
  ExternalLink
} from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');

  // Client form state
  const [clientPhone, setClientPhone] = useState('081223459728');
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState('');

  // Admin form state
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('adminbengkel123!');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Client Submit
  const handleClientSubmit = async (e?: React.FormEvent, isDemo = false) => {
    if (e) e.preventDefault();
    setClientLoading(true);
    setClientError('');

    try {
      const res = await fetch('/api/auth/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: clientPhone, isDemo }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setClientError(data.message || 'Data tidak ditemukan');
        setClientLoading(false);
      } else {
        router.push('/client/dashboard');
      }
    } catch {
      setClientError('Terjadi kesalahan jaringan');
      setClientLoading(false);
    }
  };

  // Admin Submit
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAdminError(data.message || 'Username atau password salah');
        setAdminLoading(false);
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setAdminError('Terjadi kesalahan jaringan');
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-sky-50 via-white to-sky-100/50 flex flex-col justify-between gap-6 py-4 sm:py-6 px-4 sm:px-6 overflow-x-clip">
      {/* Top Bar with Clear Direct Link to Website */}
      <div className="max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-sky-100">
        <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
          <img
            src="/assets/images/logo-bengkel-las-new.png"
            alt="Bengkel Las Besi Bandung Barat"
            className="h-9 sm:h-11 w-auto object-contain group-hover:scale-105 transition"
          />
        </Link>

        {/* The Direct Skip Option requested by user */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full bg-white hover:bg-sky-500 text-sky-700 hover:text-white border border-sky-200 hover:border-sky-500 text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 whitespace-nowrap flex-shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Langsung ke Web Utama</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-xl mx-auto w-full my-auto py-2">
        <div className="bg-white rounded-3xl shadow-xl shadow-sky-900/10 border border-sky-100 overflow-hidden">
          {/* Header Title */}
          <div className="bg-sky-500 text-white p-5 sm:p-6 text-center relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-1">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                Portal Akses Bengkel Las
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Pilih Akses Masuk</h1>
              <p className="text-xs text-sky-100 max-w-sm mx-auto">
                Khusus untuk Pelanggan (Cek Pesanan) & Administrator Bengkel
              </p>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="p-3 sm:p-4 bg-sky-50/50 border-b border-sky-100">
            <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('client')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 ${
                  activeTab === 'client'
                    ? 'bg-white text-sky-600 shadow-md shadow-sky-100 border border-sky-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-sky-500" />
                <span>Login Client</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 ${
                  activeTab === 'admin'
                    ? 'bg-white text-sky-600 shadow-md shadow-sky-100 border border-sky-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                <span>Login Admin</span>
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 sm:p-6">
            {/* TAB 1: CLIENT LOGIN */}
            {activeTab === 'client' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-sky-700 font-bold text-sm sm:text-base mb-0.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h2>Akses Pelanggan / Klien</h2>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Masukkan nomor WhatsApp atau telepon Anda untuk melihat progres pengerjaan kanopi, pagar, atau tangga putar Anda.
                  </p>
                </div>

                {clientError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{clientError}</span>
                  </div>
                )}

                <form onSubmit={(e) => handleClientSubmit(e, false)} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nomor WhatsApp / HP Klien
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition font-medium"
                        placeholder="Contoh: 081223459728"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={clientLoading}
                    className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm shadow-md shadow-sky-200 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {clientLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Masuk & Cek Progres Pesanan</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Instant Demo Client button */}
                <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-800">Uji Coba Cepat (Tanpa Perlu Daftar):</span>
                    <span className="text-[10px] bg-sky-200/60 text-sky-800 px-2 py-0.5 rounded-full font-bold">1-Klik</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Klik tombol di bawah untuk langsung mencoba akun demo proyek Bapak Hendra (Kanopi & Pagar Otomatis):
                  </p>
                  <button
                    type="button"
                    onClick={() => handleClientSubmit(undefined, true)}
                    className="w-full py-2 px-3 rounded-lg bg-white hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 transition flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Coba Masuk Sebagai Klien Demo</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: ADMIN LOGIN */}
            {activeTab === 'admin' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-sky-700 font-bold text-sm sm:text-base mb-0.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <h2>Akses Administrator Bengkel</h2>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Masuk ke panel kontrol untuk mengedit foto, teks halaman, layanan, dan sinkronisasi database SQLite DBeaver.
                  </p>
                </div>

                {adminError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Username Admin
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition font-medium"
                        placeholder="Username admin"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition font-medium"
                        placeholder="Password admin"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm shadow-md shadow-sky-200 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {adminLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Masuk ke Dashboard Admin</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs text-sky-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-sky-600" />
                    Kredensial Default (Terhubung DBeaver):
                  </p>
                  <p className="font-mono text-[11px] text-slate-600">Username: <strong>admin</strong> | Password: <strong>adminbengkel123!</strong></p>
                </div>
              </div>
            )}
          </div>

          {/* USER SPECIFICATION HIGHLIGHT:
              "jadi tampilan login ini tidak harus ketika saya klik wlin web saya tidak harus diisi dlu atau daftar dlu jadi langsung ke web aja sifatnya opsional langsung klik link di rect ke web aja"
          */}
          <div className="bg-sky-50 p-4 sm:p-5 border-t border-sky-100 text-center space-y-2.5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700">Hanya Ingin Melihat Website & Portofolio?</span>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                Login bersifat opsional. Anda tidak perlu mendaftar atau mengisi formulir untuk mengakses semua halaman kami.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center space-x-2 w-full py-3 px-5 rounded-2xl bg-white hover:bg-sky-50 text-sky-700 font-extrabold text-xs sm:text-sm border-2 border-sky-200 hover:border-sky-400 shadow-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Langsung Masuk ke Web Aja (Lewati Login)</span>
            </Link>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1">
              <Link href="/layanan" className="hover:text-sky-600 underline">Katalog Layanan</Link>
              <span>•</span>
              <Link href="/galeri" className="hover:text-sky-600 underline">Galeri Foto</Link>
              <span>•</span>
              <Link href="/kontak" className="hover:text-sky-600 underline">Hubungi Kami</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-xl mx-auto w-full text-center text-xs text-slate-500 space-y-0.5 pt-2">
        <p>© 2026 Bengkel Las Besi Bandung Barat. All Rights Reserved.</p>
        <p className="text-[11px] text-slate-400">Workshop: Padalarang, Kabupaten Bandung Barat • WA: +62 812-2345-9728</p>
      </div>
    </div>
  );
}
