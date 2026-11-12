'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Check,
  AlertCircle,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Mail,
  Compass,
  Instagram,
  Facebook,
  Youtube,
  Share2,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: '',
    company_full_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    hours: '',
    maps_url: '',
    instagram_url: 'https://www.instagram.com/',
    facebook_url: 'https://www.facebook.com/',
    youtube_url: 'https://www.youtube.com/',
    topbar_tagline: 'Bengkel Las Stainless Steel Terbaik',
    ticker_text_1: 'Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel',
    ticker_text_2: 'Pengerjaan Cepat, Rapi & Bergaransi Resmi di Bandung Barat',
    ticker_phone: 'WhatsApp: 0812 2345 9728',
    ticker_btn_label: 'Whatsapp',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings((prev) => ({ ...prev, ...data.data }));
        }
      })
      .catch((e) => setErrorMessage(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrorMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan pengaturan');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-sky-500" />
            <span>Pengaturan Kontak &amp; Media Sosial</span>
          </h1>
          <p className="text-xs text-slate-500">
            Perbarui nomor telepon, WhatsApp, alamat workshop, dan link Instagram / Facebook / YouTube pada header website. Tersimpan di database SQLite (tabel <code>site_settings</code>).
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 font-bold">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan berhasil disimpan ke database!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Singkat Usaha
            </label>
            <input
              type="text"
              value={settings.site_name || ''}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap Perusahaan
            </label>
            <input
              type="text"
              value={settings.company_full_name || ''}
              onChange={(e) => setSettings({ ...settings, company_full_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:col-span-2 rounded-2xl bg-sky-50/70 border border-sky-200/80 p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                <span>Topbar Kiri Website (Teks &amp; Nomor Telepon Header Atas)</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tampil berdampingan di bagian paling kiri atas seluruh halaman website bersama link media sosial.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                  <span>Teks Tagline Topbar Kiri</span>
                </label>
                <input
                  type="text"
                  value={settings.topbar_tagline ?? ''}
                  onChange={(e) => setSettings({ ...settings, topbar_tagline: e.target.value })}
                  placeholder="Bengkel Las Stainless Steel Terbaik"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Teks di samping ikon perisai biru pojok kiri atas</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-500" />
                  <span>Nomor Telepon Topbar &amp; Kontak</span>
                </label>
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+62 812-2345-9728"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Format: +62 812-2345-9728 (tampil di topbar &amp; halaman Kontak)</p>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Nomor WhatsApp (Angka Murni)</span>
              </label>
              <input
                type="text"
                value={settings.whatsapp || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Format: 6281223459728 (tanpa + / spasi)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-500" />
                <span>Email Resmi</span>
              </label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>Jam Buka Workshop</span>
              </label>
              <input
                type="text"
                value={settings.hours || ''}
                onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              <span>Alamat Lengkap Workshop</span>
            </label>
            <textarea
              rows={2}
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-500" />
              <span>URL Google Maps</span>
            </label>
            <input
              type="text"
              value={settings.maps_url || ''}
              onChange={(e) => setSettings({ ...settings, maps_url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Teks Berjalan (Running Text Marquee di Semua Halaman) */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-sky-500" />
                <span>Teks Berjalan (Running Text di Setiap Halaman)</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Teks marquee bergerak di bawah banner pada halaman Home, Tentang Kami, Layanan, Galeri, Artikel, dan Kontak beserta label tombol kanan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teks Berjalan 1
                </label>
                <input
                  type="text"
                  value={settings.ticker_text_1 ?? ''}
                  onChange={(e) => setSettings({ ...settings, ticker_text_1: e.target.value })}
                  placeholder="Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teks Berjalan 2
                </label>
                <input
                  type="text"
                  value={settings.ticker_text_2 ?? ''}
                  onChange={(e) => setSettings({ ...settings, ticker_text_2: e.target.value })}
                  placeholder="Pengerjaan Cepat, Rapi & Bergaransi Resmi di Bandung Barat"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teks Nomor WhatsApp di Ticker
                </label>
                <input
                  type="text"
                  value={settings.ticker_phone ?? ''}
                  onChange={(e) => setSettings({ ...settings, ticker_phone: e.target.value })}
                  placeholder="WhatsApp: 0812 2345 9728"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teks Tombol Kanan Ticker
                </label>
                <input
                  type="text"
                  value={settings.ticker_btn_label ?? ''}
                  onChange={(e) => setSettings({ ...settings, ticker_btn_label: e.target.value })}
                  placeholder="Whatsapp"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Media Sosial Section */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-sky-500" />
              <span>Link Media Sosial (Topbar Website)</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Link ini terhubung langsung ke ikon Instagram, Facebook, dan Youtube di header atas seluruh halaman website. Kosongkan URL bila ingin menyembunyikan salah satu ikon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span>Link Instagram</span>
              </label>
              <input
                type="text"
                value={settings.instagram_url ?? ''}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://www.instagram.com/akun_bengkel"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>Link Facebook</span>
              </label>
              <input
                type="text"
                value={settings.facebook_url ?? ''}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://www.facebook.com/halaman_bengkel"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-rose-600" />
                <span>Link YouTube</span>
              </label>
              <input
                type="text"
                value={settings.youtube_url ?? ''}
                onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/@channel_bengkel"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 transition flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
}

