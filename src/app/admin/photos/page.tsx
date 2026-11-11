'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  ExternalLink,
  MapPin,
  Tag,
  Copy,
} from 'lucide-react';
import CategoryManager from '@/components/admin/CategoryManager';
import { DEFAULT_GALERI_CATEGORIES, type CategoryItem } from '@/lib/categoryDefaults';

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_GALERI_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // Form Upload state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('kanopi');
  const [location, setLocation] = useState('Bandung Barat');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories?scope=galeri', { cache: 'no-store' });
      const data = await res.json();
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        setCategories(data.data);
        setCategory((prev) =>
          data.data.some((c: CategoryItem) => c.slug.toLowerCase() === prev.toLowerCase())
            ? prev
            : data.data[0].slug
        );
        setActiveCategory((prev) =>
          prev === 'all' ||
          data.data.some((c: CategoryItem) => c.slug.toLowerCase() === prev.toLowerCase())
            ? prev
            : 'all'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPhotos = () => {
    setLoading(true);
    fetch('/api/photos', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPhotos(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
    loadPhotos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setNotification({ type: 'error', message: 'Harap pilih file foto dan isi judul' });
      return;
    }

    setUploading(true);
    setNotification(null);

    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Gagal mengunggah foto');
      }

      // 2. Save record to DB
      const catObj = categories.find(
        (c) => c.slug.toLowerCase() === category.toLowerCase()
      );
      const photoRes = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          category_label: catObj?.label || category,
          src: uploadData.url,
          location,
        }),
      });

      const photoData = await photoRes.json();
      if (!photoRes.ok || !photoData.success) {
        throw new Error(photoData.message || 'Gagal menyimpan ke database');
      }

      // Success!
      setNotification({ type: 'success', message: 'Foto berhasil diunggah dan disimpan ke database!' });
      setTitle('');
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadPhotos();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Terjadi kesalahan' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini dari database?')) return;

    try {
      const res = await fetch(`/api/photos?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Foto berhasil dihapus!' });
        loadPhotos();
      } else {
        alert(data.message || 'Gagal menghapus');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus');
    }
  };

  const filteredPhotos =
    activeCategory === 'all'
      ? photos
      : photos.filter(
          (p) => String(p.category || '').toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-sky-500" />
            <span>Kelola Foto & Galeri Portofolio</span>
          </h1>
          <p className="text-xs text-slate-500">
            Unggah foto baru untuk ditampilkan di galeri dan katalog proyek. Tersimpan di database SQLite (tabel <code>gallery_photos</code>).
          </p>
        </div>

        <Link
          href="/galeri"
          target="_blank"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition w-fit"
        >
          <span>Lihat Galeri di Website</span>
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
      <CategoryManager
        scope="galeri"
        categories={categories}
        onChanged={() => {
          loadCategories();
          loadPhotos();
        }}
      />

      {/* Upload Form Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-sky-500" />
            <span>Tambah & Unggah Foto Baru</span>
          </h2>
          <p className="text-xs text-slate-500">Foto akan disimpan ke folder <code>public/uploads/</code> dan didaftarkan ke SQLite</p>
        </div>

        <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Image file selector & Preview */}
          <div className="lg:col-span-1 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Berkas Foto
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition aspect-[4/3] bg-slate-50 relative overflow-hidden group"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                    Ganti Foto
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2 text-slate-400">
                  <Upload className="w-8 h-8 mx-auto text-sky-500" />
                  <p className="text-xs font-bold text-slate-700">Klik untuk upload foto</p>
                  <p className="text-[10px] text-slate-400">JPG, PNG, atau WEBP</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Right: Meta Fields */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Foto / Proyek *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Kanopi Alderon Carport Rumah Minimalis"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
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
                  Lokasi Pengerjaan
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Padalarang, Bandung Barat"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Simpan & Terbitkan Foto</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Existing Photos List */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Foto di Database ({photos.length})
            </h2>
            <p className="text-xs text-slate-500">Foto yang sudah ada dapat dihapus atau dilihat URL-nya</p>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({photos.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeCategory.toLowerCase() === cat.slug.toLowerCase()
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Memuat galeri foto...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm font-bold">Tidak ada foto pada kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 max-w-[calc(100%-1rem)] truncate bg-sky-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {photo.category_label ||
                      categories.find(
                        (c) => c.slug.toLowerCase() === String(photo.category || '').toLowerCase()
                      )?.label ||
                      photo.category}
                  </div>
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{photo.title}</h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-500 flex-shrink-0" />
                      <span className="truncate">{photo.location || 'Bandung Barat'}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">ID: {photo.id}</span>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                      title="Hapus foto dari database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

