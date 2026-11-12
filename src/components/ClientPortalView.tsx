'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowRight,
  LogOut,
  Sparkles,
  AlertCircle,
  Edit3,
  Save,
  X,
  Mail,
  Calculator,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { buildProjectSteps, ClientDTO } from '@/lib/clientHelpers';
import { useSiteSettings } from '@/lib/useDynamicData';

interface ClientPortalViewProps {
  isolated?: boolean;
}

const PROJECT_CATEGORIES = [
  'Kanopi & Atap Carport',
  'Pintu Pagar Besi / Otomatis',
  'Teralis Jendela & Pintu',
  'Railing Tangga & Balkon',
  'Tangga Putar / Spiral',
  'Stainless Steel Custom',
  'Konstruksi Baja / Mezannine',
];

export default function ClientPortalView({ isolated = false }: ClientPortalViewProps) {
  const router = useRouter();
  const [client, setClient] = useState<ClientDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);

  // Member profile self-edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    location: '',
    projectCategory: '',
    projectName: '',
  });

  const settings = useSiteSettings({
    whatsapp: '6281223459728',
    phone: '+62 812-2345-9728',
  });
  const waDigits = (settings.whatsapp || '6281223459728').replace(/\D/g, '') || '6281223459728';

  const syncForm = (c: ClientDTO) => {
    setForm({
      name: c.name,
      email: c.email || '',
      location: c.location || '',
      projectCategory: c.projectCategory || PROJECT_CATEGORIES[0],
      projectName: c.projectName || '',
    });
  };

  useEffect(() => {
    let active = true;
    fetch('/api/auth/client-login', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.authenticated && data?.client) {
          setClient(data.client);
          syncForm(data.client);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const notifyAuthChanged = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('client-auth-changed'));
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch('/api/auth/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemo: true }),
      });
      const data = await res.json();
      if (data?.success && data?.client) {
        setClient(data.client);
        syncForm(data.client);
        notifyAuthChanged();
        router.refresh();
      }
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/auth/client-login', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setSaveMessage({ type: 'err', text: data?.message || 'Gagal menyimpan perubahan' });
      } else {
        setClient(data.client);
        syncForm(data.client);
        setEditing(false);
        setSaveMessage({ type: 'ok', text: 'Data proyek & profil member berhasil diperbarui.' });
        notifyAuthChanged();
      }
    } catch {
      setSaveMessage({ type: 'err', text: 'Terjadi kesalahan jaringan saat menyimpan.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/client-logout', { method: 'POST' });
    setClient(null);
    notifyAuthChanged();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-sky-50/40 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Memuat Portal Member...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-sky-50/70 to-white py-14 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-sky-900/10 border border-sky-100 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
              Area Khusus Member & Pelanggan
            </span>
            <h1 className="text-2xl font-black text-slate-900">Portal Pelanggan Belum Aktif</h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Silakan masuk atau daftar akun member baru untuk memantau progres pengelasan, rincian RAB,
              serta jadwal survey & instalasi proyek Anda secara real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/login?tab=client&mode=register"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Member Baru</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Akun Member</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200 transition disabled:opacity-50"
            >
              {demoLoading ? 'Memuat Akun Demo...' : 'Lihat Preview Menggunakan Akun Demo Klien'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = buildProjectSteps(client.progressPercentage, client.location);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-100 uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full w-max mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal Member Bengkel Las</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {client.name}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 mt-1">
              Pantau progres pengerjaan pesanan, RAB, dan jadwal instalasi Anda secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isolated ? (
              <Link
                href="/"
                className="px-4 py-2.5 rounded-xl bg-white text-sky-700 font-bold text-xs hover:bg-sky-50 transition shadow-sm"
              >
                ← Kembali ke Website
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditing(!editing);
                  setSaveMessage(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-white text-sky-700 font-bold text-xs hover:bg-sky-50 transition shadow-sm inline-flex items-center gap-1.5"
              >
                {editing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>{editing ? 'Tutup Form Edit' : 'Edit Kebutuhan Proyek'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-5 sm:-mt-4 space-y-6">
        {saveMessage && (
          <div
            className={`rounded-2xl p-3.5 text-xs font-semibold flex items-center gap-2 shadow-sm border ${
              saveMessage.type === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {saveMessage.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Editable Project Request Card */}
        {editing && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-sky-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Perbarui Profil & Kebutuhan Proyek
                </h3>
                <p className="text-xs text-slate-500">
                  Perubahan akan langsung terlihat oleh tim admin bengkel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Tutup form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 outline-none text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 outline-none text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Pekerjaan</label>
                <select
                  value={form.projectCategory}
                  onChange={(e) => setForm({ ...form, projectCategory: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 outline-none text-slate-800 font-medium bg-white"
                >
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {!PROJECT_CATEGORIES.includes(form.projectCategory) && form.projectCategory && (
                    <option value={form.projectCategory}>{form.projectCategory}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Pemasangan</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 outline-none text-slate-800 font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Judul / Rencana Proyek</label>
                <input
                  type="text"
                  required
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 outline-none text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Main Status Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 border border-sky-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-100">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block text-[11px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase">
                  {client.projectCategory || 'Fabrikasi Besi & Stainless'}
                </span>
                <span className="inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  ID Member #{client.id}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 break-words">
                {client.projectName || 'Proyek Pesanan Bengkel Las'}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  {client.location || 'Bandung Barat'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  {client.phone}
                </span>
                {client.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-sky-500" />
                    {client.email}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 text-left lg:text-right w-full lg:w-auto sm:min-w-[220px]">
              <span className="text-[11px] text-slate-500 font-semibold block">Estimasi Nilai Proyek / RAB</span>
              <span className="text-xl font-extrabold text-sky-700">
                {client.projectEstimate || 'Menunggu Survey RAB'}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                Termasuk Pemasangan & Garansi
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="py-6 border-b border-slate-100 space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-500" />
                Status Pengerjaan:{' '}
                <span className="text-sky-600">{client.projectStatus || 'Terdaftar - Menunggu Survey'}</span>
              </span>
              <span className="font-extrabold text-sky-600 text-sm">{client.progressPercentage}%</span>
            </div>

            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-sky-400 to-blue-600 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${client.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              Tahapan Pengerjaan Proyek:
            </h3>
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
                        : 'bg-slate-50 border-slate-200 opacity-65'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] text-slate-400">0{idx + 1}</span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isActive ? (
                        <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse" />
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
          {client.notes && (
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
              Ada pertanyaan terkait spesifikasi, pengukuran survey, atau jadwal pemasangan?
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`https://api.whatsapp.com/send?phone=${waDigits}&text=${encodeURIComponent(
                  `Halo Bengkel Las, saya member ${client.name} (${client.phone}). Ingin konfirmasi proyek: ${client.projectName}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 transition"
              >
                <Phone className="w-4 h-4" />
                <span>Chat WhatsApp Workshop</span>
              </a>

              <Link
                href="/#kalkulator"
                className="inline-flex items-center space-x-1.5 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
              >
                <Calculator className="w-3.5 h-3.5 text-sky-600" />
                <span>Hitung Ulang Estimasi</span>
              </Link>

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

