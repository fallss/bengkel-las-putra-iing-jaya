'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Plus,
  Save,
  Trash2,
  Check,
  AlertCircle,
  ExternalLink,
  Tag,
  DollarSign,
  Upload,
} from 'lucide-react';
import CategoryManager from '@/components/admin/CategoryManager';
import { DEFAULT_LAYANAN_CATEGORIES, type CategoryItem } from '@/lib/categoryDefaults';

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_LAYANAN_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New service form
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Kanopi');
  const [tagline, setTagline] = useState('');
  const [desc, setDesc] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUploadServiceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setNotification(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success && (data.url || data.src)) {
        setImage(data.url || data.src);
        setNotification({ type: 'success', message: 'Foto layanan berhasil diunggah!' });
      } else {
        setNotification({ type: 'error', message: data.message || 'Gagal mengunggah foto' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Terjadi kesalahan saat mengunggah foto' });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories?scope=layanan', { cache: 'no-store' });
      const data = await res.json();
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        setCategories(data.data);
        setCategory((prev) =>
          data.data.some((c: CategoryItem) => c.slug.toLowerCase() === prev.toLowerCase())
            ? prev
            : data.data[0].slug
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadServices = () => {
    setLoading(true);
    fetch('/api/services', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setServices(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
    loadServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id.toLowerCase().replace(/\s+/g, '-'),
          title,
          category,
          tagline,
          desc,
          priceRange,
          image,
          specs: [],
          materials: [],
          features: [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan layanan');
      }

      setNotification({ type: 'success', message: 'Layanan berhasil disimpan ke database!' });
      setId('');
      setTitle('');
      setTagline('');
      setDesc('');
      setPriceRange('');
      setImage('');
      loadServices();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm(`Hapus layanan "${serviceId}" dari database?`)) return;

    try {
      const res = await fetch(`/api/services?id=${serviceId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Layanan berhasil dihapus!' });
        loadServices();
      } else {
        alert(data.message || 'Gagal menghapus');
      }
    } catch {
      alert('Terjadi kesalahan');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-sky-500" />
            <span>Kelola Layanan Fabrikasi & Las</span>
          </h1>
          <p className="text-xs text-slate-500">
            Daftar jenis layanan yang muncul di halaman Layanan & Home. Tersimpan di database SQLite (tabel <code>services</code>).
          </p>
        </div>

        <Link
          href="/layanan"
          target="_blank"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition w-fit"
        >
          <span>Lihat Halaman Layanan</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Category Management */}
      <CategoryManager scope="layanan" categories={categories} onChanged={loadCategories} />

      {/* Add Service Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-500" />
            <span>Tambah Layanan Baru</span>
          </h2>
          <p className="text-xs text-slate-500">Isi data layanan las untuk didaftarkan ke database</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ID Slug Unik *
            </label>
            <input
              type="text"
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="contoh: kanopi-kaca-tempered"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Layanan *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="contoh: Kanopi Kaca Tempered Mewah"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Estimasi Harga
            </label>
            <input
              type="text"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              placeholder="contoh: Mulai Rp 450.000 / m²"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tagline Singkat
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="contoh: Perlindungan Maksimal & Estetika Modern Rumah Idaman"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              URL Gambar Banner / Foto *
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="contoh: /assets/images/... atau /uploads/..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 font-mono"
              />
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-sky-500/20 flex-shrink-0">
                {uploadingImage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{uploadingImage ? 'Mengunggah...' : 'Pilih & Upload Foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={handleUploadServiceImage}
                />
              </label>
            </div>
            {image && (
              <div className="mt-2.5 flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 max-w-md">
                <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-200">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="text-xs text-slate-600 truncate flex-1 font-mono">
                  {image}
                </div>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Lengkap *
            </label>
            <textarea
              rows={3}
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Jelaskan keunggulan dan detail pengerjaan layanan ini..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Layanan Baru</span>
            </button>
          </div>
        </form>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Daftar Layanan Tersimpan ({services.length})
        </h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Memuat layanan...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {services.map((srv) => (
              <div key={srv.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <img src={srv.image} alt={srv.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{srv.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{srv.desc}</p>
                    <div className="flex items-center space-x-3 pt-1 text-[11px] text-slate-400 font-mono">
                      <span className="text-sky-600 font-bold">{srv.priceRange || 'Konsultasi'}</span>
                      <span>•</span>
                      <span>
                        {categories.find(
                          (c) => c.slug.toLowerCase() === String(srv.category || '').toLowerCase()
                        )?.label || srv.category}
                      </span>
                      <span>•</span>
                      <span>id: {srv.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(srv.id)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                    title="Hapus layanan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

