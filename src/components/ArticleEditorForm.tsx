'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Save, Plus, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ArticleItem } from '@/data/content';
import { getTodayIndonesianDate, slugifyArticleTitle } from '@/lib/articleHelpers';

interface ArticleEditorFormProps {
  editingArticle: ArticleItem | null;
  onSaved: (saved: ArticleItem, mode: 'create' | 'edit') => void;
  onCancel?: () => void;
}

const DEFAULT_COVER = '/assets/images/asset_24_Bengkel-Las-Stainless-Steel-Te.jpg';

export const ArticleEditorForm: React.FC<ArticleEditorFormProps> = ({
  editingArticle,
  onSaved,
  onCancel,
}) => {
  const isEdit = Boolean(editingArticle);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [date, setDate] = useState(getTodayIndonesianDate());
  const [readTime, setReadTime] = useState('4 Menit Baca');
  const [author, setAuthor] = useState('Tim Ahli Las Putra Iing Jaya');
  const [image, setImage] = useState(DEFAULT_COVER);
  const [tagsText, setTagsText] = useState('Tips Material, Fabrikasi Besi');
  const [excerpt, setExcerpt] = useState('');
  const [contentText, setContentText] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    if (editingArticle) {
      setTitle(editingArticle.title);
      setSlug(editingArticle.slug);
      setSlugTouched(true);
      setDate(editingArticle.date || getTodayIndonesianDate());
      setReadTime(editingArticle.readTime || '4 Menit Baca');
      setAuthor(editingArticle.author || 'Tim Ahli Las Putra Iing Jaya');
      setImage(editingArticle.image || DEFAULT_COVER);
      setTagsText((editingArticle.tags || []).join(', '));
      setExcerpt(editingArticle.excerpt || '');
      setContentText((editingArticle.content || []).join('\n\n'));
    } else {
      setTitle('');
      setSlug('');
      setSlugTouched(false);
      setDate(getTodayIndonesianDate());
      setReadTime('4 Menit Baca');
      setAuthor('Tim Ahli Las Putra Iing Jaya');
      setImage(DEFAULT_COVER);
      setTagsText('Tips Material, Bandung Barat');
      setExcerpt('');
      setContentText('');
    }
  }, [editingArticle]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && !slugTouched) {
      setSlug(val.trim() ? slugifyArticleTitle(val) : '');
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setError(data.message || 'Gagal mengunggah gambar cover');
      }
    } catch {
      setError('Terjadi kesalahan saat mengunggah gambar cover');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/articles', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalSlug: editingArticle?.slug,
          slug: slug.trim() || undefined,
          title: title.trim(),
          date: date.trim(),
          readTime: readTime.trim(),
          author: author.trim(),
          image: image.trim(),
          tags: tagsText,
          excerpt: excerpt.trim(),
          content: contentText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan artikel');
      }

      if (!isEdit) {
        setTitle('');
        setSlug('');
        setSlugTouched(false);
        setDate(getTodayIndonesianDate());
        setExcerpt('');
        setContentText('');
      }
      onSaved(data.data, isEdit ? 'edit' : 'create');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan artikel');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Foto Cover Column */}
        <div className="lg:col-span-5 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Foto Cover Artikel *
          </label>
          <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
            {image ? (
              <img src={image} alt={title || 'Cover Artikel'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-xs">Belum ada gambar</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-slate-900/75 flex flex-col items-center justify-center text-white gap-2">
                <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Mengunggah cover...</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Mengunggah...' : 'Upload Foto Cover'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCover}
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
              Atau Path / URL Gambar Cover:
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
              Judul Artikel *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Contoh: Tips Memilih Kanopi Alderon Anti Panas di Bandung Barat"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Slug URL (Opsional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="otomatis-dari-judul"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Penulis / Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Tim Ahli Las Putra Iing Jaya"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Terbit
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="11 November 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimasi Baca
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="4 Menit Baca"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tag (Pisah Koma)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Kanopi, SUS 304, Tips"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ringkasan Card (Excerpt) *
            </label>
            <textarea
              required
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat artikel yang ditampilkan pada card depan..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Isi Lengkap Artikel *
              </label>
              <span className="text-[11px] text-slate-400">
                Pisahkan paragraf dengan 1 baris kosong (Enter 2x)
              </span>
            </div>
            <textarea
              required
              rows={6}
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder={'Paragraf pembuka artikel...\n\nParagraf kedua penjelasan material dan tips...\n\nParagraf penutup / ajakan konsultasi...'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                ? 'Simpan Perubahan Artikel'
                : 'Tambah & Terbitkan Artikel'}
          </span>
        </button>
      </div>
    </form>
  );
};

