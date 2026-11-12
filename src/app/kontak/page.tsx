'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { COMPANY_INFO, SERVICES_DATA } from '@/data/content';
import { usePageContent, useSiteSettings } from '@/lib/useDynamicData';
import { SubheaderBanner } from '@/components/SubheaderBanner';
import { BounceHeading } from '@/components/BounceHeading';

export default function ContactPage() {
  const { content } = usePageContent('kontak', {
    hero_title: 'Kontak & Alamat Workshop Bandung Barat',
    hero_subtitle: 'Silakan hubungi kami untuk survey lokasi, perhitungan estimasi biaya (RAB), atau konsultasi pemesanan produk las untuk Bandung Barat dan pengiriman ke seluruh Indonesia.',
    info_title: 'Informasi Workshop',
    info_desc: 'Anda dapat berkunjung langsung ke workshop kami di Cikalong Wetan, Bandung Barat atau menghubungi WhatsApp untuk pesanan & pengiriman ke seluruh Indonesia.',
    info_address_val: COMPANY_INFO.address,
    info_hours_val: COMPANY_INFO.hours,
    form_title: 'Kirim Pesan & Konsultasi'
  });

  const settings = useSiteSettings({
    phone: COMPANY_INFO.phoneFormatted,
    whatsapp: COMPANY_INFO.waNumber,
    address: COMPANY_INFO.address,
    hours: COMPANY_INFO.hours,
    maps_url: COMPANY_INFO.mapsUrl,
    service_area: COMPANY_INFO.serviceArea,
  });

  const waDigits = (settings.whatsapp || COMPANY_INFO.waNumber).replace(/\D/g, '') || COMPANY_INFO.waNumber;
  const mapsHref = /^https?:\/\//i.test(settings.maps_url || '') ? settings.maps_url : COMPANY_INFO.mapsUrl;

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    service: 'Kanopi Minimalis & Modern',
    district: 'Cikalong Wetan (Bandung Barat)',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const waUrl = `https://api.whatsapp.com/send?phone=${waDigits}&text=${encodeURIComponent(
      `Halo Bengkel Las Bandung Barat, nama saya ${form.name} (${form.phone}).\nSaya ingin konsultasi ${form.service} di wilayah ${form.district}: ${form.message}`
    )}`;
    window.open(waUrl, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Subheader Banner Full-Width */}
      <SubheaderBanner breadcrumb="home // kontak" pageKey="kontak" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">
        {/* Header Breadcrumb */}
        <div className="border-b border-sky-100 pb-8 text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-sky-600 font-bold bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
            Home // Hubungi Kami
          </span>
          <div className="pt-2">
            <BounceHeading
              text={content.hero_title || 'Kontak & Alamat Workshop Bandung Barat'}
              highlightWords={['Kontak', 'Workshop', 'Bandung']}
              shimmerColor="blue"
              className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
              as="h1"
            />
          </div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {content.hero_subtitle}
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
        {/* Info Card */}
        <div className="lg:col-span-5 min-w-0 space-y-6 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-sky-950">
          <h2 className="text-xl font-bold">{content.info_title || 'Informasi Workshop'}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {content.info_desc || 'Anda dapat berkunjung langsung ke workshop kami di Padalarang atau menghubungi tim kami melalui WhatsApp untuk respon cepat.'}
          </p>

          <div className="space-y-4 pt-4 text-xs">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Alamat Bengkel:</span>
                <span className="text-slate-300 leading-relaxed block">
                  {settings.address || content.info_address_val || COMPANY_INFO.address}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block mb-0.5">WhatsApp / Telepon:</span>
                <a
                  href={`https://api.whatsapp.com/send?phone=${waDigits}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 font-mono hover:underline font-bold"
                >
                  {settings.phone || COMPANY_INFO.phoneFormatted}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block mb-0.5">Jam Buka:</span>
                <span className="text-slate-300">{settings.hours || content.info_hours_val || COMPANY_INFO.hours}</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-start gap-2 rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-[11px] text-sky-200 font-medium leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                <span>{settings.service_area || COMPANY_INFO.serviceArea}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Buka Petunjuk Arah di Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 min-w-0 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Pesan Terkirim ke WhatsApp!</h3>
              <p className="text-xs text-slate-600">Tim kami akan segera membalas konsultasi Anda dalam hitungan menit.</p>
              <div className="pt-4">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">{content.form_title || 'Kirim Pesan & Konsultasi'}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Contoh: Pak Budi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Layanan yang Dibutuhkan</label>
                  <select
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-400"
                  >
                    {SERVICES_DATA.map((srv) => (
                      <option key={srv.id} value={srv.title}>{srv.title}</option>
                    ))}
                    <option value="Lainnya / Fabrikasi Custom">Lainnya / Fabrikasi Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Wilayah / Area Pengiriman</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-400"
                  >
                    <option value="Cikalong Wetan (Bandung Barat)">Cikalong Wetan (Bandung Barat)</option>
                    <option value="Padalarang">Padalarang</option>
                    <option value="Ngamprah">Ngamprah</option>
                    <option value="Lembang">Lembang</option>
                    <option value="Batujajar">Batujajar</option>
                    <option value="Parongpong">Parongpong</option>
                    <option value="Cisarua">Cisarua</option>
                    <option value="Cililin">Cililin</option>
                    <option value="Cipatat">Cipatat</option>
                    <option value="Kotabaru Parahyangan">Kotabaru Parahyangan</option>
                    <option value="Cimahi / Kota Bandung">Cimahi / Kota Bandung</option>
                    <option value="Jabodetabek & Luar Kota (Kirim / Pasang)">Jabodetabek & Luar Kota (Kirim / Pasang)</option>
                    <option value="Seluruh Indonesia (Pengiriman Ekspedisi)">Seluruh Indonesia (Pengiriman Ekspedisi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Catatan Kebutuhan</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tuliskan ukuran perkiraan atau model yang diinginkan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-200 transition active:scale-95"
              >
                <Send className="w-4 h-4 fill-current" />
                <span>Kirim Pesan ke WhatsApp</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
