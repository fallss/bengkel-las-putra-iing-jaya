'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  User,
  Clock,
  MapPin,
  FileText,
  Phone,
  CheckCircle2,
  ArrowRight,
  LogOut,
  Sparkles,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/client-login')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.client) {
          setClient(data.client);
        } else {
          // If not logged in, auto-fetch demo client
          fetch('/api/auth/client-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDemo: true })
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success && d.client) setClient(d.client);
            });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/client-logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50/40 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Memuat Portal Klien...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { title: 'Survei & Pengukuran Lokasi', status: 'done', desc: 'Selesai diukur tim teknisi lapangan' },
    { title: 'Desain 3D & Kesepakatan RAB', status: 'done', desc: 'Disetujui spesifikasi bahan & harga' },
    { title: 'Fabrikasi & Pengelasan Las', status: 'active', desc: 'Sedang pengerjaan perakitan di workshop Padalarang' },
    { title: 'Pemasangan Lapangan (Instalasi)', status: 'pending', desc: 'Jadwal instalasi di lokasi' },
    { title: 'Serah Terima & Garansi Resmi', status: 'pending', desc: 'Pengecekan akhir bersama pemilik rumah' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-100 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full w-max mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal Pelanggan Bengkel Las</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {client?.name || 'Pelanggan Terhormat'}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 mt-1">
              Pantau progres pengerjaan pesanan dan estimasi proyek Anda secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-white text-sky-700 font-bold text-xs hover:bg-sky-50 transition shadow-sm"
            >
              ← Kembali ke Website
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4 sm:-mt-3 space-y-6">
        {/* Main Status Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 border border-sky-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-100">
            <div className="min-w-0">
              <span className="inline-block text-[11px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase">
                {client?.projectCategory || 'Fabrikasi Besi & Stainless'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 break-words">
                {client?.projectName || 'Proyek Pesanan Bengkel Las'}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  {client?.location || 'Kabupaten Bandung Barat'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  {client?.phone || '+62 812-2345-9728'}
                </span>
              </div>
            </div>

            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 text-left lg:text-right w-full lg:w-auto sm:min-w-[200px]">
              <span className="text-[11px] text-slate-500 font-semibold block">Estimasi Nilai Kontrak</span>
              <span className="text-xl font-extrabold text-sky-700">{client?.projectEstimate || 'Rp 15.000.000'}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Termasuk Pemasangan & Garansi</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="py-6 border-b border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-500" />
                Status Pengerjaan: <span className="text-sky-600">{client?.projectStatus || 'Dalam Pengerjaan'}</span>
              </span>
              <span className="font-extrabold text-sky-600 text-sm">{client?.progressPercentage || 80}%</span>
            </div>

            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-sky-400 to-blue-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${client?.progressPercentage || 80}%` }}
              />
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Tahapan Pengerjaan Proyek:</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {steps.map((step, idx) => {
                const isDone = step.status === 'done';
                const isActive = step.status === 'active';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border text-xs space-y-1.5 transition ${
                      isActive
                        ? 'bg-sky-50/80 border-sky-300 ring-2 ring-sky-400/20 shadow-md'
                        : isDone
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] text-slate-400">0{idx + 1}</span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isActive ? (
                        <div className="w-3 h-3 rounded-full bg-sky-500 animate-ping" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <div className="font-bold text-slate-900 leading-snug">{step.title}</div>
                    <div className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workshop Notes */}
          {client?.notes && (
            <div className="mt-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Catatan dari Kepala Workshop:</strong>
                <p className="mt-0.5 text-amber-800 leading-relaxed">{client.notes}</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Ada pertanyaan terkait spesifikasi atau perubahan jadwal pasang?
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`https://api.whatsapp.com/send?phone=6281223459728&text=${encodeURIComponent(
                  `Halo Bengkel Las Putra Iing Jaya, saya klien ${client?.name || ''}. Ingin konfirmasi update pengerjaan pesanan: ${client?.projectName || ''}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 transition"
              >
                <Phone className="w-4 h-4" />
                <span>Chat WhatsApp Workshop</span>
              </a>

              <Link
                href="/galeri"
                className="inline-flex items-center space-x-1.5 px-4 py-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-100 transition"
              >
                <span>Lihat Portofolio Lain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

