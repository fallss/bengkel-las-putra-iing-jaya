'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  Phone,
  MapPin,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Save,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { ClientDTO } from '@/lib/clientHelpers';

const STAGE_PRESETS = [
  { label: '15% • Survei Lokasi', pct: 15, status: 'Terdaftar - Menunggu Survey' },
  { label: '40% • Desain & RAB', pct: 40, status: 'Tahap Desain & Kesepakatan RAB' },
  { label: '65% • Fabrikasi Workshop', pct: 65, status: 'Tahap Fabrikasi & Pengelasan' },
  { label: '85% • Pemasangan Lapangan', pct: 85, status: 'Jadwal Pemasangan Lapangan' },
  { label: '100% • Selesai & Garansi', pct: 100, status: 'Selesai & Serah Terima' },
];

const CATEGORIES = [
  'Kanopi & Atap Carport',
  'Pintu Pagar Besi / Otomatis',
  'Teralis Jendela & Pintu',
  'Railing Tangga & Balkon',
  'Tangga Putar / Spiral',
  'Stainless Steel Custom',
  'Konstruksi Baja / Mezannine',
];

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'done'>('all');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Modal state (Edit or Add)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    projectCategory: CATEGORIES[0],
    projectName: '',
    projectStatus: 'Terdaftar - Menunggu Survey',
    progressPercentage: 15,
    projectEstimate: 'Menunggu Survey RAB',
    location: '',
    notes: '',
  });

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data?.success && Array.isArray(data.data)) {
        setClients(data.data);
      } else {
        setFeedback({ type: 'err', text: data?.message || 'Gagal memuat daftar client.' });
      }
    } catch {
      setFeedback({ type: 'err', text: 'Gagal terhubung ke server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (statusFilter === 'done' && c.progressPercentage < 100) return false;
      if (statusFilter === 'active' && c.progressPercentage >= 100) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.projectName.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    });
  }, [clients, search, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      phone: '',
      email: '',
      password: '',
      projectCategory: CATEGORIES[0],
      projectName: '',
      projectStatus: 'Terdaftar - Menunggu Survey',
      progressPercentage: 15,
      projectEstimate: 'Menunggu Survey RAB',
      location: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (c: ClientDTO) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email,
      password: '',
      projectCategory: c.projectCategory || CATEGORIES[0],
      projectName: c.projectName,
      projectStatus: c.projectStatus || 'Dalam Pengerjaan',
      progressPercentage: c.progressPercentage,
      projectEstimate: c.projectEstimate || '',
      location: c.location,
      notes: c.notes,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const method = editingId ? 'PUT' : 'POST';
      const payload = editingId ? { id: editingId, ...form } : form;

      const res = await fetch('/api/clients', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        setFeedback({ type: 'err', text: data?.message || 'Gagal menyimpan data client.' });
      } else {
        setModalOpen(false);
        setFeedback({
          type: 'ok',
          text: editingId ? 'Data client & progres proyek berhasil diperbarui.' : 'Client baru berhasil ditambahkan.',
        });
        await loadClients();
      }
    } catch {
      setFeedback({ type: 'err', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: ClientDTO) => {
    if (!window.confirm(`Hapus client "${c.name}" (${c.phone}) dari daftar member?`)) return;

    try {
      const res = await fetch(`/api/clients?id=${c.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setFeedback({ type: 'err', text: data?.message || 'Gagal menghapus client.' });
      } else {
        setFeedback({ type: 'ok', text: `Client "${c.name}" telah dihapus.` });
        setClients((prev) => prev.filter((item) => item.id !== c.id));
      }
    } catch {
      setFeedback({ type: 'err', text: 'Gagal menghubungi server.' });
    }
  };

  const doneCount = clients.filter((c) => c.progressPercentage >= 100).length;
  const activeCount = clients.length - doneCount;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sky-600 font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Manajemen Member & Pelanggan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Daftar Client / Member Terdaftar
          </h1>
          <p className="text-xs text-slate-500">
            Semua pelanggan yang mendaftar melalui <Link href="/login?mode=register" target="_blank" className="text-sky-600 font-semibold underline">/login</Link> otomatis masuk ke daftar ini & dapat mengakses halaman khusus <Link href="/member" target="_blank" className="text-sky-600 font-semibold underline">/member</Link>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={loadClients}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm shadow-sky-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Client</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Member Terdaftar</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{clients.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Proyek Berjalan</span>
            <p className="text-2xl font-black text-sky-600 mt-0.5">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Proyek Selesai (100%)</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{doneCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl p-3.5 text-xs font-semibold flex items-center gap-2 border ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {feedback.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama client, WhatsApp, judul proyek, atau lokasi..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
          {[
            { key: 'all', label: `Semua (${clients.length})` },
            { key: 'active', label: `Berjalan (${activeCount})` },
            { key: 'done', label: `Selesai (${doneCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === tab.key
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Memuat data member...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Belum ada client yang sesuai</p>
          <p className="text-xs text-slate-500">
            Tambahkan client secara manual atau minta pelanggan mendaftar via halaman /login.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => {
            const waClean = client.phone.replace(/\D/g, '').replace(/^0/, '62');
            return (
              <div
                key={client.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-sky-200 transition space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-0.5 rounded-full">
                        ID #{client.id}
                      </span>
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                        {client.projectCategory || 'Fabrikasi Besi'}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          client.progressPercentage >= 100
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {client.progressPercentage}% • {client.projectStatus || 'Dalam Pengerjaan'}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {client.name} — <span className="text-sky-700">{client.projectName}</span>
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
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
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-500" />
                        {client.location || '-'}
                      </span>
                      <span className="font-bold text-slate-700">
                        Estimasi RAB: {client.projectEstimate || 'Menunggu Survey RAB'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={`https://api.whatsapp.com/send?phone=${waClean}&text=${encodeURIComponent(
                        `Halo ${client.name}, kami dari Admin Bengkel Las ingin menginfokan update proyek: ${client.projectName} (${client.progressPercentage}% - ${client.projectStatus}).`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>WA Client</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => openEditModal(client)}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Progres</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(client)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold inline-flex items-center gap-1 transition"
                      title="Hapus client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Notes */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${client.progressPercentage}%` }}
                    />
                  </div>
                  {client.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <strong className="text-slate-700">Catatan Workshop:</strong> {client.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Client */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[90dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingId ? `Update Data & Progres Client #${editingId}` : 'Tambah Client / Member Baru'}
                </h2>
                <p className="text-xs text-slate-500">
                  Perubahan otomatis tersinkron ke Portal Member pelanggan (/member).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Client *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {editingId ? 'Reset Password (Opsional)' : 'Password Login'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder={editingId ? 'Kosongkan jika tidak diubah' : 'Password member'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Layanan</label>
                <select
                  value={form.projectCategory}
                  onChange={(e) => setForm((prev) => ({ ...prev, projectCategory: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-sky-500 outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {!CATEGORIES.includes(form.projectCategory) && form.projectCategory && (
                    <option value={form.projectCategory}>{form.projectCategory}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Pemasangan *</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Judul / Rencana Proyek *</label>
                <input
                  type="text"
                  required
                  value={form.projectName}
                  onChange={(e) => setForm((prev) => ({ ...prev, projectName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Pengerjaan</label>
                <input
                  type="text"
                  value={form.projectStatus}
                  onChange={(e) => setForm((prev) => ({ ...prev, projectStatus: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimasi Nilai RAB</label>
                <input
                  type="text"
                  value={form.projectEstimate}
                  onChange={(e) => setForm((prev) => ({ ...prev, projectEstimate: e.target.value }))}
                  placeholder="Contoh: Rp 14.500.000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Quick Stage Presets + Slider */}
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Progres Pengerjaan Proyek</span>
                <span className="font-extrabold text-sky-700 text-sm">{form.progressPercentage}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.progressPercentage}
                onChange={(e) => setForm((prev) => ({ ...prev, progressPercentage: Number(e.target.value) }))}
                className="w-full accent-sky-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {STAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.pct}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        progressPercentage: preset.pct,
                        projectStatus: preset.status,
                      }))
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                      form.progressPercentage === preset.pct
                        ? 'bg-sky-500 text-white border-sky-500'
                        : 'bg-white text-slate-600 border-sky-200 hover:bg-sky-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">Catatan Kepala Workshop</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan material, jadwal tukang, atau informasi untuk ditampilkan di Portal Member..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
                <span>{saving ? 'Menyimpan...' : 'Simpan Data Client'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

