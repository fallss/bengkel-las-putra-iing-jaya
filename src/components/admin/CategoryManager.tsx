'use client';

import React, { useState } from 'react';
import { Tags, Plus, Pencil, Check, X, Trash2 } from 'lucide-react';
import type { CategoryItem, CategoryScope } from '@/lib/categoryDefaults';

interface CategoryManagerProps {
  scope: CategoryScope;
  categories: CategoryItem[];
  onChanged: () => void | Promise<void>;
}

export default function CategoryManager({
  scope,
  categories,
  onChanged,
}: CategoryManagerProps) {
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const scopeTitle = scope === 'galeri' ? 'Kategori Galeri' : 'Kategori Layanan';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label || submitting) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, label }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: 'error', text: json.message || 'Gagal menambah kategori' });
        return;
      }
      setNewLabel('');
      setFeedback({ type: 'success', text: `Kategori "${label}" berhasil ditambahkan.` });
      await onChanged();
    } catch {
      setFeedback({ type: 'error', text: 'Terjadi kesalahan saat menambah kategori' });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (cat: CategoryItem) => {
    if (!cat.id) return;
    setEditingId(cat.id);
    setEditingLabel(cat.label);
    setConfirmDeleteId(null);
    setFeedback(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingLabel('');
  };

  const handleSaveEdit = async (id: number) => {
    const label = editingLabel.trim();
    if (!label || submitting) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, label }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: 'error', text: json.message || 'Gagal mengubah nama kategori' });
        return;
      }
      setEditingId(null);
      setEditingLabel('');
      setFeedback({ type: 'success', text: `Nama kategori diperbarui menjadi "${label}".` });
      await onChanged();
    } catch {
      setFeedback({ type: 'error', text: 'Terjadi kesalahan saat memperbarui kategori' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, label: string) => {
    if (submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: 'error', text: json.message || 'Gagal menghapus kategori' });
        return;
      }
      setConfirmDeleteId(null);
      setFeedback({ type: 'success', text: `Kategori "${label}" dihapus.` });
      await onChanged();
    } catch {
      setFeedback({ type: 'error', text: 'Terjadi kesalahan saat menghapus kategori' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Tags className="w-5 h-5 text-sky-500 shrink-0" />
            <span>Kelola {scopeTitle}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {categories.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tambahkan kategori baru atau ubah nama kategori yang tampil di halaman publik &amp; form input.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-4 px-3.5 py-2.5 rounded-xl text-xs font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Add Category Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder={`Nama kategori baru (misal: Balkon Minimalis)`}
          aria-label={`Tambah ${scopeTitle}`}
          className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="submit"
          disabled={submitting || !newLabel.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold shadow-sm transition-colors disabled:opacity-50 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </form>

      {/* Categories List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const isEditing = cat.id != null && editingId === cat.id;
          const isConfirmDelete = cat.id != null && confirmDeleteId === cat.id;

          return (
            <div
              key={cat.id ?? cat.slug}
              className="flex flex-col justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && cat.id) {
                        e.preventDefault();
                        handleSaveEdit(cat.id);
                      } else if (e.key === 'Escape') {
                        cancelEdit();
                      }
                    }}
                    aria-label="Edit nama kategori"
                    className="w-full px-3 py-1.5 rounded-lg border border-sky-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={submitting}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => cat.id && handleSaveEdit(cat.id)}
                      disabled={submitting || !editingLabel.trim()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{cat.label}</p>
                    <p className="text-[11px] font-mono text-slate-400 truncate">slug: {cat.slug}</p>
                  </div>

                  {cat.id != null && (
                    <div className="flex items-center gap-1 shrink-0">
                      {isConfirmDelete ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id!, cat.label)}
                            disabled={submitting}
                            className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold"
                          >
                            Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={submitting}
                            className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            title={`Edit nama kategori ${cat.label}`}
                            aria-label={`Edit nama kategori ${cat.label}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {categories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteId(cat.id!);
                                setEditingId(null);
                              }}
                              title={`Hapus kategori ${cat.label}`}
                              aria-label={`Hapus kategori ${cat.label}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

