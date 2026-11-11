'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  PlusCircle,
  Edit3,
  Trash2,
  Check,
  AlertCircle,
  Search,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react';
import { ArticleItem } from '@/data/content';
import { ArticleEditorForm } from '@/components/ArticleEditorForm';

export const ArticleManagerPanel: React.FC = () => {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const loadArticles = () => {
    setLoading(true);
    fetch('/api/articles', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setArticles(data.data);
        }
      })
      .catch((err) => console.error('Failed loading articles:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleSaved = (_saved: ArticleItem, mode: 'create' | 'edit') => {
    setNotification({
      type: 'success',
      message:
        mode === 'edit'
          ? 'Perubahan artikel berhasil diperbarui dan langsung tampil di website!'
          : 'Artikel baru berhasil diterbitkan! Maksimal 6 card per halaman di website dengan navigasi nomor.',
    });
    setEditingArticle(null);
    loadArticles();
  };

  const handleSelectEdit = (art: ArticleItem) => {
    setEditingArticle(art);
    setNotification(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (art: ArticleItem) => {
    if (!confirm(`Yakin ingin menghapus artikel "${art.title}"?`)) return;
    setNotification(null);
    try {
      const res = await fetch(`/api/articles?slug=${encodeURIComponent(art.slug)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus artikel');
      }
      if (editingArticle?.slug === art.slug) {
        setEditingArticle(null);
      }
      setNotification({ type: 'success', message: `Artikel "${art.title}" berhasil dihapus.` });
      loadArticles();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Terjadi kesalahan saat menghapus' });
    }
  };

  const filtered = articles.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q)
    );
  });

  const totalPagesOnWeb = Math.max(1, Math.ceil(articles.length / 6));

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

      {/* Add / Edit Article Form Card */}
      <div
        ref={formRef}
        className={`bg-white rounded-3xl p-5 sm:p-7 border shadow-sm space-y-5 transition ${
          editingArticle ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl flex-shrink-0 ${
                editingArticle ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'
              }`}
            >
              {editingArticle ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {editingArticle ? 'Edit Artikel Terpilih' : 'Tambah & Terbitkan Artikel Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                {editingArticle
                  ? `Sedang mengedit "${editingArticle.title}" (slug: ${editingArticle.slug})`
                  : 'Tambahkan artikel edukasi & portofolio baru. Website menampilkan maksimal 6 card per halaman.'}
              </p>
            </div>
          </div>

          <Link
            href="/artikel"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition self-start sm:self-auto whitespace-nowrap flex-shrink-0"
          >
            <span>Lihat Page Artikel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ArticleEditorForm
          editingArticle={editingArticle}
          onSaved={handleSaved}
          onCancel={editingArticle ? () => setEditingArticle(null) : undefined}
        />
      </div>

      {/* Saved Articles List */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-600" />
              <span>Daftar Artikel di Database ({articles.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Terbagi otomatis menjadi <strong>{totalPagesOnWeb} halaman</strong> di website (6 card per halaman). Klik <strong>Edit</strong> untuk mengubah konten atau foto cover.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau penulis..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-xs text-slate-500">Memuat daftar artikel...</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            {articles.length === 0 ? 'Belum ada artikel di database.' : 'Tidak ada artikel yang cocok dengan pencarian.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((art) => {
              const isBeingEdited = editingArticle?.slug === art.slug;
              return (
                <div
                  key={art.slug}
                  className={`flex flex-col justify-between rounded-2xl border overflow-hidden transition bg-white min-w-0 ${
                    isBeingEdited
                      ? 'border-amber-400 ring-2 ring-amber-100 shadow-md'
                      : 'border-slate-200 hover:border-sky-300 shadow-sm'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                      <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <Calendar className="w-3 h-3 text-sky-500" />
                          {art.date}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
                          <User className="w-3 h-3 text-slate-400" />
                          {art.author}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 break-words">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 break-words">{art.excerpt}</p>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectEdit(art)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Artikel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(art)}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      aria-label={`Hapus ${art.title}`}
                      title="Hapus Artikel"
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

