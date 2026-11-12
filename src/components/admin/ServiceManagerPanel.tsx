'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Wrench,
  PlusCircle,
  Edit3,
  Trash2,
  Check,
  AlertCircle,
  Search,
  Tag,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import type { ServiceItem } from '@/data/content';
import { DEFAULT_LAYANAN_CATEGORIES, type CategoryItem } from '@/lib/categoryDefaults';
import { ServiceEditorForm } from '@/components/ServiceEditorForm';
import CategoryManager from '@/components/admin/CategoryManager';

/** Admin services manager panel styled identically to ArticleManagerPanel with full CRUD + category sync. */
export const ServiceManagerPanel: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_LAYANAN_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories?scope=layanan', { cache: 'no-store' });
      const data = await res.json();
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed loading service categories:', err);
    }
  };

  const loadServices = () => {
    setLoading(true);
    fetch('/api/services', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setServices(data.data);
        }
      })
      .catch((err) => console.error('Failed loading services:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
    loadServices();
  }, []);

  const categoryLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) {
      map.set(c.slug.toLowerCase(), c.label);
    }
    return map;
  }, [categories]);

  const handleSaved = (_saved: ServiceItem, mode: 'create' | 'edit') => {
    setNotification({
      type: 'success',
      message:
        mode === 'edit'
          ? 'Perubahan layanan berhasil disimpan dan langsung tampil di halaman Layanan!'
          : 'Layanan baru berhasil ditambahkan ke database dan tampil di halaman Layanan!',
    });
    setEditingService(null);
    loadServices();
  };

  const handleSelectEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setNotification(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (srv: ServiceItem) => {
    if (!confirm(`Yakin ingin menghapus layanan "${srv.title}"?`)) return;
    setNotification(null);
    try {
      const res = await fetch(`/api/services?id=${encodeURIComponent(srv.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus layanan');
      }
      if (editingService?.id === srv.id) {
        setEditingService(null);
      }
      setNotification({ type: 'success', message: `Layanan "${srv.title}" berhasil dihapus.` });
      loadServices();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Terjadi kesalahan saat menghapus' });
    }
  };

  const filtered = services.filter((srv) => {
    const matchesCat =
      categoryFilter === 'all' ||
      String(srv.category || '').toLowerCase() === categoryFilter.toLowerCase();
    if (!matchesCat) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const catLabel = categoryLabelMap.get(String(srv.category || '').toLowerCase()) || srv.category || '';
    return (
      srv.title.toLowerCase().includes(q) ||
      srv.desc.toLowerCase().includes(q) ||
      catLabel.toLowerCase().includes(q) ||
      (srv.priceRange || '').toLowerCase().includes(q) ||
      srv.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Add / Edit Service Form Card */}
      <div
        ref={formRef}
        className={`bg-white rounded-3xl p-5 sm:p-7 border shadow-sm space-y-5 transition ${
          editingService ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl flex-shrink-0 ${
                editingService ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'
              }`}
            >
              {editingService ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {editingService ? 'Edit Layanan Terpilih' : 'Tambah & Terbitkan Layanan Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                {editingService
                  ? `Sedang mengedit "${editingService.title}" (id: ${editingService.id})`
                  : 'Tambahkan layanan fabrikasi las baru untuk ditampilkan pada halaman Layanan.'}
              </p>
            </div>
          </div>

          <Link
            href="/layanan"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition self-start sm:self-auto whitespace-nowrap flex-shrink-0"
          >
            <span>Lihat Page Layanan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ServiceEditorForm
          editingService={editingService}
          categories={categories}
          onSaved={handleSaved}
          onCancel={editingService ? () => setEditingService(null) : undefined}
        />
      </div>

      {/* Category Management */}
      <CategoryManager scope="layanan" categories={categories} onChanged={loadCategories} />

      {/* Saved Services Card Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-sky-600" />
              <span>Daftar Layanan di Database ({services.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik <strong>Edit Layanan</strong> untuk mengubah judul, kategori, harga, deskripsi, poin spesifikasi, atau foto card layanan.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan, kategori, harga..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              categoryFilter === 'all'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({services.length})
          </button>
          {categories.map((cat) => {
            const count = services.filter(
              (s) => String(s.category || '').toLowerCase() === cat.slug.toLowerCase()
            ).length;
            const active = categoryFilter.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategoryFilter(cat.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  active
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-10 text-center text-xs text-slate-500">Memuat daftar layanan...</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            {services.length === 0
              ? 'Belum ada layanan di database.'
              : 'Tidak ada layanan yang cocok dengan filter atau pencarian.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((srv) => {
              const isBeingEdited = editingService?.id === srv.id;
              const catLabel =
                categoryLabelMap.get(String(srv.category || '').toLowerCase()) ||
                srv.category ||
                'Lainnya';
              const specsCount = Array.isArray(srv.specs) ? srv.specs.length : 0;

              return (
                <div
                  key={srv.id}
                  className={`flex flex-col justify-between rounded-2xl border overflow-hidden transition bg-white min-w-0 ${
                    isBeingEdited
                      ? 'border-amber-400 ring-2 ring-amber-100 shadow-md'
                      : 'border-slate-200 hover:border-sky-300 shadow-sm'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                      <img src={srv.image} alt={srv.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm border border-sky-100 text-sky-700 text-[11px] font-bold">
                        {catLabel}
                      </div>
                      {srv.priceRange && (
                        <div className="absolute bottom-2.5 right-2.5 max-w-[calc(100%-1.25rem)] truncate px-2.5 py-0.5 rounded-lg bg-emerald-600/95 text-white text-[11px] font-mono font-bold shadow">
                          {srv.priceRange}
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {specsCount} spesifikasi
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 truncate max-w-[140px] font-mono">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {srv.id}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 break-words">
                        {srv.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 break-words">{srv.desc}</p>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectEdit(srv)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Layanan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(srv)}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      aria-label={`Hapus ${srv.title}`}
                      title="Hapus Layanan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
