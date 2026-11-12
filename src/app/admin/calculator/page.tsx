'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calculator,
  Plus,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Layers,
  Type,
  X,
} from 'lucide-react';
import {
  DEFAULT_ESTIMATOR_CONFIG,
  type EstimatorCategory,
  type EstimatorConfig,
  type EstimatorOption,
} from '@/lib/estimatorDefaults';

function formatRupiah(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(num) || 0);
}

function emptyNewCategoryDraft(): Omit<EstimatorCategory, 'id'> {
  return {
    title: '',
    calcMode: 'area',
    unitLabel: 'Luas (Panjang x Lebar)',
    resultUnit: 'm²',
    primaryLabel: 'Panjang',
    primaryMax: 30,
    secondaryLabel: 'Lebar',
    secondaryMax: 15,
    options: [
      {
        name: '',
        pricePerUnit: 350000,
        unit: 'm²',
        desc: '',
      },
    ],
  };
}

export default function AdminCalculatorPage() {
  const [categories, setCategories] = useState<EstimatorCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [draft, setDraft] = useState<EstimatorCategory | null>(null);
  const [config, setConfig] = useState<EstimatorConfig>(DEFAULT_ESTIMATOR_CONFIG);
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryDraft, setNewCategoryDraft] = useState(emptyNewCategoryDraft());
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotice = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadData = useCallback(async (preferredId?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/estimator', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat data kalkulator');

      const cats: EstimatorCategory[] = Array.isArray(data.categories) ? data.categories : [];
      setCategories(cats);
      if (data.config) {
        setConfig({ ...DEFAULT_ESTIMATOR_CONFIG, ...data.config });
      }

      if (cats.length > 0) {
        const targetId = preferredId && cats.some((c) => c.id === preferredId)
          ? preferredId
          : cats.some((c) => c.id === selectedId)
            ? selectedId
            : cats[0].id;
        setSelectedId(targetId);
        const found = cats.find((c) => c.id === targetId) || cats[0];
        setDraft(structuredClone(found));
      } else {
        setSelectedId('');
        setDraft(null);
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'Gagal memuat data kalkulator');
    } finally {
      setLoading(false);
    }
  }, [selectedId, showNotice]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectCategory = (cat: EstimatorCategory) => {
    setSelectedId(cat.id);
    setDraft(structuredClone(cat));
  };

  const handleMoveCategory = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= categories.length) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setCategories(reordered);

    try {
      const res = await fetch('/api/estimator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          orderedIds: reordered.map((c) => c.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah urutan kategori');
      if (Array.isArray(data.categories)) setCategories(data.categories);
      showNotice('success', 'Urutan kategori kalkulator diperbarui');
    } catch (err: any) {
      showNotice('error', err?.message || 'Gagal menyimpan urutan');
      loadData();
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    const cleanOptions = draft.options
      .map((opt) => ({
        ...opt,
        name: opt.name.trim(),
        pricePerUnit: Math.max(0, Number(opt.pricePerUnit) || 0),
        unit: opt.unit.trim() || draft.resultUnit || 'm²',
        desc: opt.desc.trim(),
      }))
      .filter((opt) => opt.name.length > 0);

    if (!draft.title.trim()) {
      showNotice('error', 'Nama kategori wajib diisi');
      return;
    }
    if (cleanOptions.length === 0) {
      showNotice('error', 'Minimal 1 jenis & harga bahan harus diisi');
      return;
    }

    setSavingCategory(true);
    try {
      const payload: EstimatorCategory = {
        ...draft,
        title: draft.title.trim(),
        unitLabel: draft.unitLabel.trim() || 'Ukuran',
        resultUnit: draft.resultUnit.trim() || (draft.calcMode === 'linear' ? 'm¹' : 'm²'),
        primaryLabel: draft.primaryLabel.trim() || 'Panjang',
        primaryMax: Math.max(1, Number(draft.primaryMax) || 30),
        secondaryLabel: draft.secondaryLabel?.trim() || 'Lebar',
        secondaryMax: Math.max(1, Number(draft.secondaryMax) || 15),
        options: cleanOptions,
      };

      const res = await fetch('/api/estimator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_category', category: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan kategori');

      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (data.category) setDraft(structuredClone(data.category));
      showNotice('success', `Kategori "${payload.title}" & daftar harga berhasil disimpan`);
    } catch (err: any) {
      showNotice('error', err?.message || 'Gagal menyimpan perubahan');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string, title: string) => {
    if (categories.length <= 1) {
      showNotice('error', 'Minimal 1 kategori kalkulator harus tetap tersedia');
      return;
    }
    if (!window.confirm(`Hapus kategori "${title}" beserta semua daftar bahannya dari kalkulator?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/estimator?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus kategori');

      const nextCats: EstimatorCategory[] = Array.isArray(data.categories) ? data.categories : [];
      setCategories(nextCats);
      if (nextCats.length > 0) {
        setSelectedId(nextCats[0].id);
        setDraft(structuredClone(nextCats[0]));
      }
      showNotice('success', `Kategori "${title}" berhasil dihapus`);
    } catch (err: any) {
      showNotice('error', err?.message || 'Gagal menghapus kategori');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const firstOpt = newCategoryDraft.options[0];
    if (!newCategoryDraft.title.trim()) {
      showNotice('error', 'Nama kategori baru wajib diisi');
      return;
    }
    if (!firstOpt?.name.trim()) {
      showNotice('error', 'Nama bahan pertama wajib diisi');
      return;
    }

    setCreatingCategory(true);
    try {
      const res = await fetch('/api/estimator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategoryDraft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambah kategori baru');

      setShowAddModal(false);
      setNewCategoryDraft(emptyNewCategoryDraft());
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (data.category) {
        setSelectedId(data.category.id);
        setDraft(structuredClone(data.category));
      }
      showNotice('success', `Kategori "${data.category?.title || newCategoryDraft.title}" berhasil ditambahkan`);
    } catch (err: any) {
      showNotice('error', err?.message || 'Gagal menambah kategori baru');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/estimator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_config', config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan teks kalkulator');
      if (data.config) setConfig({ ...DEFAULT_ESTIMATOR_CONFIG, ...data.config });
      showNotice('success', 'Teks header & catatan kalkulator berhasil diperbarui');
    } catch (err: any) {
      showNotice('error', err?.message || 'Gagal menyimpan teks kalkulator');
    } finally {
      setSavingConfig(false);
    }
  };

  const updateOption = (idx: number, patch: Partial<EstimatorOption>) => {
    if (!draft) return;
    const next = [...draft.options];
    next[idx] = { ...next[idx], ...patch };
    setDraft({ ...draft, options: next });
  };

  const addOption = () => {
    if (!draft) return;
    setDraft({
      ...draft,
      options: [
        ...draft.options,
        {
          name: 'Jenis Bahan Baru',
          pricePerUnit: 500000,
          unit: draft.resultUnit || (draft.calcMode === 'linear' ? 'm¹' : 'm²'),
          desc: 'Tuliskan detail ketebalan rangka, bahan finishing, atau garansi.',
        },
      ],
    });
  };

  const moveOption = (idx: number, direction: -1 | 1) => {
    if (!draft) return;
    const target = idx + direction;
    if (target < 0 || target >= draft.options.length) return;
    const next = [...draft.options];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setDraft({ ...draft, options: next });
  };

  const removeOption = (idx: number) => {
    if (!draft || draft.options.length <= 1) return;
    const next = draft.options.filter((_, i) => i !== idx);
    setDraft({ ...draft, options: next });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Sinkron Live: Beranda &amp; Halaman Layanan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            Kelola Kalkulator Estimasi Biaya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Tambah kategori pekerjaan baru, ubah spesifikasi &amp; harga bahan per m² / m¹, serta atur batas slider ukuran.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadData()}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Muat Ulang</span>
          </button>

          <a
            href="/#kalkulator-estimasi"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm shadow-sky-500/20 transition flex items-center space-x-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat di Website</span>
          </a>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-sm ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2.5 text-sm font-medium">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-black/5"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Split Grid: Left Category List + Right Category & Materials Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Categories */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <h2 className="font-bold text-sm text-slate-900">Daftar Kategori ({categories.length})</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewCategoryDraft(emptyNewCategoryDraft());
                setShowAddModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition flex items-center space-x-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kategori</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {categories.map((cat, idx) => {
                const isSelected = cat.id === selectedId;
                return (
                  <div
                    key={cat.id}
                    className={`rounded-xl border p-3 transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-400/40'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="font-bold text-sm text-slate-900 truncate">{cat.title}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-600">
                          {cat.calcMode === 'area' ? 'Luas (2 Slider)' : 'Linear (1 Slider)'}
                        </span>
                        <span>{cat.options.length} bahan</span>
                      </div>
                    </button>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(idx, -1)}
                        disabled={idx === 0}
                        title="Geser ke atas"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(idx, 1)}
                        disabled={idx === categories.length - 1}
                        title="Geser ke bawah"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel: Selected Category & Options Editor */}
        <div className="lg:col-span-8">
          {draft ? (
            <form
              onSubmit={handleSaveCategory}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6"
            >
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">ID: {draft.id}</span>
                  <h2 className="text-lg font-extrabold text-slate-900">{draft.title || 'Edit Kategori'}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(draft.id, draft.title)}
                    disabled={categories.length <= 1}
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40 text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Kategori</span>
                  </button>
                  <button
                    type="submit"
                    disabled={savingCategory}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingCategory ? 'Menyimpan...' : 'Simpan Kategori & Bahan'}</span>
                  </button>
                </div>
              </div>

              {/* Section 1: Category & Slider Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-sky-600" />
                  <span>1. Pengaturan Kategori &amp; Slider Ukuran</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Kategori (Tombol Tab)
                    </label>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                      placeholder="Contoh: Teralis Jendela & Pintu"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mode Perhitungan Slider
                    </label>
                    <select
                      value={draft.calcMode}
                      onChange={(e) => {
                        const mode = e.target.value === 'linear' ? 'linear' : 'area';
                        setDraft({
                          ...draft,
                          calcMode: mode,
                          resultUnit:
                            draft.resultUnit === 'm²' && mode === 'linear'
                              ? 'm¹'
                              : draft.resultUnit === 'm¹' && mode === 'area'
                                ? 'm²'
                                : draft.resultUnit,
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    >
                      <option value="area">Luas — 2 Slider (Panjang × Lebar/Tinggi)</option>
                      <option value="linear">Linear — 1 Slider (Panjang / Tinggi / Unit)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Label Judul Kotak Ukuran
                    </label>
                    <input
                      type="text"
                      value={draft.unitLabel}
                      onChange={(e) => setDraft({ ...draft, unitLabel: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                      placeholder="Contoh: Luas (Panjang x Lebar)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Satuan Total Ukuran
                    </label>
                    <input
                      type="text"
                      value={draft.resultUnit}
                      onChange={(e) => setDraft({ ...draft, resultUnit: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                      placeholder="Contoh: m² atau m¹ atau unit"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Label Slider 1
                    </label>
                    <input
                      type="text"
                      value={draft.primaryLabel}
                      onChange={(e) => setDraft({ ...draft, primaryLabel: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                      placeholder="Contoh: Panjang"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Batas Maksimal Slider 1
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={draft.primaryMax}
                      onChange={(e) =>
                        setDraft({ ...draft, primaryMax: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    />
                  </div>

                  {draft.calcMode === 'area' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Label Slider 2
                        </label>
                        <input
                          type="text"
                          value={draft.secondaryLabel || 'Lebar'}
                          onChange={(e) => setDraft({ ...draft, secondaryLabel: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                          placeholder="Contoh: Lebar Carport atau Tinggi Pagar"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Batas Maksimal Slider 2
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={draft.secondaryMax || 15}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              secondaryMax: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Section 2: Material Options */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Daftar Jenis &amp; Harga Bahan ({draft.options.length} Pilihan)
                  </div>
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Pilihan Bahan</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {draft.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-600">
                          Pilihan #{idx + 1} •{' '}
                          <span className="text-sky-600">
                            {formatRupiah(opt.pricePerUnit)} / {opt.unit || 'm²'}
                          </span>
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => moveOption(idx, -1)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-white disabled:opacity-30"
                            title="Pindah ke atas"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveOption(idx, 1)}
                            disabled={idx === draft.options.length - 1}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-white disabled:opacity-30"
                            title="Pindah ke bawah"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            disabled={draft.options.length <= 1}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                            title="Hapus pilihan bahan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Nama Jenis &amp; Material
                          </label>
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => updateOption(idx, { name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:border-sky-500 outline-none"
                            placeholder="Contoh: Kanopi Alderon Twinwall"
                            required
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Harga Satuan (Rp)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={5000}
                            value={opt.pricePerUnit}
                            onChange={(e) =>
                              updateOption(idx, {
                                pricePerUnit: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:border-sky-500 outline-none"
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Satuan
                          </label>
                          <input
                            type="text"
                            value={opt.unit}
                            onChange={(e) => updateOption(idx, { unit: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:border-sky-500 outline-none"
                            placeholder="m²"
                            required
                          />
                        </div>

                        <div className="sm:col-span-12">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Deskripsi Spesifikasi Bahan
                          </label>
                          <input
                            type="text"
                            value={opt.desc}
                            onChange={(e) => updateOption(idx, { desc: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:border-sky-500 outline-none"
                            placeholder="Spesifikasi ketebalan besi, atap, cat duco, dll."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingCategory}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingCategory ? 'Menyimpan...' : 'Simpan Kategori & Bahan'}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
              Pilih atau tambahkan kategori kalkulator di sebelah kiri untuk mulai mengedit.
            </div>
          )}
        </div>
      </div>

      {/* Global Header & Footnote Text Config Card */}
      <form
        onSubmit={handleSaveConfig}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Pengaturan Teks Header, Jaminan &amp; Catatan Kalkulator
              </h2>
              <p className="text-xs text-slate-500">
                Ubah judul, subjudul, label jaminan kanan atas, catatan kaki harga, dan teks tombol WhatsApp.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingConfig}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingConfig ? 'Menyimpan...' : 'Simpan Teks Kalkulator'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Teks Badge Atas</label>
            <input
              type="text"
              value={config.badgeText}
              onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Judul Utama Kalkulator</label>
            <input
              type="text"
              value={config.headingTitle}
              onChange={(e) => setConfig({ ...config, headingTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subjudul / Deskripsi Singkat</label>
            <input
              type="text"
              value={config.headingSubtitle}
              onChange={(e) => setConfig({ ...config, headingSubtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Label Kanan Atas</label>
            <input
              type="text"
              value={config.warrantyLabel}
              onChange={(e) => setConfig({ ...config, warrantyLabel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nilai Jaminan Kanan Atas</label>
            <input
              type="text"
              value={config.warrantyValue}
              onChange={(e) => setConfig({ ...config, warrantyValue: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catatan Kaki Harga</label>
            <input
              type="text"
              value={config.footnote}
              onChange={(e) => setConfig({ ...config, footnote: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Teks Tombol WhatsApp</label>
            <input
              type="text"
              value={config.ctaText}
              onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 outline-none"
            />
          </div>
        </div>
      </form>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Tambah Kategori Kalkulator Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  value={newCategoryDraft.title}
                  onChange={(e) =>
                    setNewCategoryDraft({ ...newCategoryDraft, title: e.target.value })
                  }
                  placeholder="Contoh: Teralis & Pengaman Jendela"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mode Hitung</label>
                  <select
                    value={newCategoryDraft.calcMode}
                    onChange={(e) => {
                      const mode = e.target.value === 'linear' ? 'linear' : 'area';
                      setNewCategoryDraft({
                        ...newCategoryDraft,
                        calcMode: mode,
                        resultUnit: mode === 'linear' ? 'm¹' : 'm²',
                        unitLabel:
                          mode === 'area' ? 'Luas (Panjang x Tinggi)' : 'Panjang / Jumlah',
                        options: [
                          {
                            ...newCategoryDraft.options[0],
                            unit: mode === 'linear' ? 'm¹' : 'm²',
                          },
                        ],
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white outline-none"
                  >
                    <option value="area">Luas — 2 Slider</option>
                    <option value="linear">Linear — 1 Slider</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan Total</label>
                  <input
                    type="text"
                    value={newCategoryDraft.resultUnit}
                    onChange={(e) =>
                      setNewCategoryDraft({
                        ...newCategoryDraft,
                        resultUnit: e.target.value,
                        options: [
                          {
                            ...newCategoryDraft.options[0],
                            unit: e.target.value || 'm²',
                          },
                        ],
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none"
                    placeholder="m²"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Label Ukuran
                </label>
                <input
                  type="text"
                  value={newCategoryDraft.unitLabel}
                  onChange={(e) =>
                    setNewCategoryDraft({ ...newCategoryDraft, unitLabel: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none"
                />
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="text-xs font-bold text-slate-700">Pilihan Bahan Pertama *</div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Bahan</label>
                  <input
                    type="text"
                    value={newCategoryDraft.options[0]?.name || ''}
                    onChange={(e) =>
                      setNewCategoryDraft({
                        ...newCategoryDraft,
                        options: [
                          { ...newCategoryDraft.options[0], name: e.target.value },
                        ],
                      })
                    }
                    placeholder="Contoh: Teralis Besi Tempa / Minimalis"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Harga Satuan (Rp)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={newCategoryDraft.options[0]?.pricePerUnit || 0}
                      onChange={(e) =>
                        setNewCategoryDraft({
                          ...newCategoryDraft,
                          options: [
                            {
                              ...newCategoryDraft.options[0],
                              pricePerUnit: Math.max(0, Number(e.target.value) || 0),
                            },
                          ],
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Satuan</label>
                    <input
                      type="text"
                      value={newCategoryDraft.options[0]?.unit || 'm²'}
                      onChange={(e) =>
                        setNewCategoryDraft({
                          ...newCategoryDraft,
                          options: [
                            { ...newCategoryDraft.options[0], unit: e.target.value },
                          ],
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Deskripsi Bahan</label>
                  <input
                    type="text"
                    value={newCategoryDraft.options[0]?.desc || ''}
                    onChange={(e) =>
                      setNewCategoryDraft({
                        ...newCategoryDraft,
                        options: [
                          { ...newCategoryDraft.options[0], desc: e.target.value },
                        ],
                      })
                    }
                    placeholder="Contoh: Besi nako 12mm SNI + Cat anti karat"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {creatingCategory ? 'Menambahkan...' : 'Simpan Kategori Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
