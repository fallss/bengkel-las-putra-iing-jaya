'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Save, Plus, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import type { ServiceItem } from '@/data/content';
import { slugifyCategory, type CategoryItem } from '@/lib/categoryDefaults';

interface ServiceEditorFormProps {
  editingService: ServiceItem | null;
  categories: CategoryItem[];
  onSaved: (saved: ServiceItem, mode: 'create' | 'edit') => void;
  onCancel?: () => void;
}

const DEFAULT_SERVICE_COVER = '/assets/images/asset_24_Jasa-pembuatan-kanopi.jpg';

/** Editor form for creating or updating fabrication service cards shown on /layanan. */
export const ServiceEditorForm: React.FC<ServiceEditorFormProps> = ({
  editingService,
  categories,
  onSaved,
  onCancel,
}) => {
  const isEdit = Boolean(editingService);

  const [title, setTitle] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [idTouched, setIdTouched] = useState(false);
  const [category, setCategory] = useState(categories[0]?.slug || 'Kanopi');
  const [priceRange, setPriceRange] = useState('');
  const [tagline, setTagline] = useState('');
  const [image, setImage] = useState(DEFAULT_SERVICE_COVER);
  const [desc, setDesc] = useState('');
  const [specsText, setSpecsText] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    if (editingService) {
      setTitle(editingService.title || '');
      setServiceId(editingService.id || '');
      setIdTouched(true);
      setCategory(editingService.category || categories[0]?.slug || 'Lainnya');
      setPriceRange(editingService.priceRange || '');
      setTagline(editingService.tagline || '');
      setImage(editingService.image || DEFAULT_SERVICE_COVER);
      setDesc(editingService.desc || '');
      setSpecsText((editingService.specs || []).join('\n'));
    } else {
      setTitle('');
      setServiceId('');
      setIdTouched(false);
      setCategory(categories[0]?.slug || 'Kanopi');
      setPriceRange('');
      setTagline('');
      setImage(DEFAULT_SERVICE_COVER);
      setDesc('');
      setSpecsText('');
    }
  }, [editingService]);

  useEffect(() => {
    if (!editingService && categories.length > 0) {
      setCategory((prev) =>
        categories.some((c) => c.slug.toLowerCase() === prev.toLowerCase()) ? prev : categories[0].slug
      );
    }
  }, [categories, editingService]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && !idTouched) {
      setServiceId(val.trim() ? slugifyCategory(val) : '');
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success && (data.url || data.src)) {
        setImage(data.url || data.src);
      } else {
        setError(data.message || 'Gagal mengunggah foto layanan');
      }
    } catch {
      setError('Terjadi kesalahan saat mengunggah foto layanan');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const specsList = specsText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/services', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalId: editingService?.id,
          id: serviceId.trim() || undefined,
          title: title.trim(),
          category: category || 'Lainnya',
          tagline: tagline.trim(),
          desc: desc.trim(),
          priceRange: priceRange.trim(),
          image: image.trim(),
          specs: specsList,
          materials: editingService?.materials ?? [],
          features: editingService?.features ?? [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan layanan');
      }

      if (!isEdit) {
        setTitle('');
        setServiceId('');
        setIdTouched(false);
        setPriceRange('');
        setTagline('');
        setImage(DEFAULT_SERVICE_COVER);
        setDesc('');
        setSpecsText('');
      }
      onSaved(data.data, isEdit ? 'edit' : 'create');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan layanan');
    } finally {
      setSubmitting(false);
    }
  };

  const hasCurrentCategory = categories.some(
    (c) => c.slug.toLowerCase() === (category || '').toLowerCase()
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Foto Layanan Column */}
        <div className="lg:col-span-5 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Foto Banner Layanan *
          </label>
          <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
            {image ? (
              <img src={image} alt={title || 'Foto Layanan'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-xs">Belum ada gambar</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-slate-900/75 flex flex-col items-center justify-center text-white gap-2">
                <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Mengunggah foto...</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Mengunggah...' : 'Upload Foto Layanan'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <span className="text-[11px] text-slate-500">
              Rekomendasi: 1200 x 750 px (16:10)
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Atau Path / URL Foto Layanan:
            </label>
            <input
              type="text"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/uploads/... atau /assets/images/..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Metadata & Content Fields */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Judul Layanan *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Contoh: Kanopi Kaca Tempered Minimalis"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                ID Slug Unik (Opsional)
              </label>
              <input
                type="text"
                value={serviceId}
                onChange={(e) => {
                  setIdTouched(true);
                  setServiceId(e.target.value);
                }}
                placeholder="otomatis-dari-judul"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kategori Layanan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {!hasCurrentCategory && category && (
                  <option value={category}>{category}</option>
                )}
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimasi Harga
              </label>
              <input
                type="text"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="Mulai Rp 450.000 / m²"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tagline Singkat (Opsional)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Perlindungan Maksimal & Estetika Modern"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi Layanan *
            </label>
            <textarea
              required
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Jelaskan deskripsi singkat dan keunggulan pengerjaan layanan ini pada card website..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Poin Spesifikasi / Checklist Card
              </label>
              <span className="text-[11px] text-slate-400">
                Pisahkan tiap poin dengan Enter (1 baris = 1 poin centang)
              </span>
            </div>
            <textarea
              rows={4}
              value={specsText}
              onChange={(e) => setSpecsText(e.target.value)}
              placeholder={
                'Rangka Besi Hollow Galvanis SNI tebal 1.4mm - 2.0mm\nPengecatan 3 Lapis Primer Epoxy anti karat\nGaransi struktur & pengerjaan rapi hingga 12 bulan'
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
          >
            <X className="w-4 h-4" />
            <span>Batal Edit</span>
          </button>
        )}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 transition disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isEdit ? (
            <Save className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>
            {submitting
              ? 'Menyimpan...'
              : isEdit
                ? 'Simpan Perubahan Layanan'
                : 'Tambah & Simpan Layanan'}
          </span>
        </button>
      </div>
    </form>
  );
};
