'use client';

import React from 'react';
import {
  Save,
  Check,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Copy,
} from 'lucide-react';

export interface ContentItem {
  id: number;
  page_key: string;
  section_key: string;
  title: string;
  content: string;
  content_type: 'text' | 'textarea' | 'image' | 'carousel';
  dimension_hint?: string | null;
  updated_at?: string;
}

export interface CarouselSlide {
  image: string;
  title?: string;
  subtitle?: string;
}

interface CarouselEditorProps {
  item: ContentItem;
  slides: CarouselSlide[];
  isSaving: boolean;
  savedSuccessKey: string | null;
  uploadingKey: string | null;
  onSaveCarousel: (item: ContentItem, serialized: string) => void;
  onAddSlide: (sectionKey: string) => void;
  onRemoveSlide: (sectionKey: string, index: number) => void;
  onMoveSlide: (sectionKey: string, index: number, direction: 'up' | 'down') => void;
  onUpdateSlideField: (
    sectionKey: string,
    index: number,
    field: 'image' | 'title' | 'subtitle',
    value: string
  ) => void;
  onUploadImage: (sectionKey: string, file: File, slideIndex?: number) => void;
}

export function CarouselEditorCard({
  item,
  slides,
  isSaving,
  savedSuccessKey,
  uploadingKey,
  onSaveCarousel,
  onAddSlide,
  onRemoveSlide,
  onMoveSlide,
  onUpdateSlideField,
  onUploadImage,
}: CarouselEditorProps) {
  const isSuccess = savedSuccessKey === item.section_key;

  return (
    <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border-2 border-sky-200 space-y-5">
      {/* Carousel Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-800">
              Hero Slider Carousel
            </span>
            <span className="text-xs font-bold text-sky-600">
              {slides.length} Slide Aktif (Tanpa Batasan Gambar)
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">{item.title}</h4>
          <p className="text-[11px] text-slate-400 font-mono truncate">
            section_key: <span className="text-sky-600 font-semibold">{item.section_key}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              Tersimpan!
            </span>
          )}
          <button
            type="button"
            onClick={() => onSaveCarousel(item, JSON.stringify(slides))}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm shadow-sky-500/20 transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Simpan Semua Slide</span>
          </button>
        </div>
      </div>

      {/* Dimension Guide */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/70 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0">
          <div className="p-2 bg-sky-500 text-white rounded-lg flex-shrink-0 mt-0.5">
            <Layers className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-bold text-sky-950">Panduan Ukuran Banner Carousel:</p>
            <p className="text-xs text-sky-700 font-semibold break-words">
              {item.dimension_hint ||
                '1920 x 1080 px (Rasio 16:9 Standar) atau 2100 x 1080 px | Full Cover Edge-to-Edge | Maks 5MB'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddSlide(item.section_key)}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Slide Baru</span>
        </button>
      </div>

      {/* Slides */}
      <div className="space-y-4">
        {slides.map((slide, sIdx) => {
          const uploadId = `${item.section_key}_slide_${sIdx}`;
          const isUploading = uploadingKey === uploadId;

          return (
            <div
              key={sIdx}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-sky-300 transition space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {sIdx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800">Slide #{sIdx + 1}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => onMoveSlide(item.section_key, sIdx, 'up')}
                    disabled={sIdx === 0}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 transition border border-transparent hover:border-slate-200"
                    title="Geser ke Atas"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSlide(item.section_key, sIdx, 'down')}
                    disabled={sIdx === slides.length - 1}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 transition border border-transparent hover:border-slate-200"
                    title="Geser ke Bawah"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveSlide(item.section_key, sIdx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition border border-transparent hover:border-rose-200 ml-1"
                    title="Hapus Slide Ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4 aspect-[16/9] bg-slate-900 rounded-lg overflow-hidden border border-slate-200 relative group flex items-center justify-center">
                  <img
                    src={slide.image || '/assets/images/asset_30_banner-2.jpg'}
                    alt={`Preview Slide ${sIdx + 1}`}
                    className="w-full h-full object-contain"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2 z-10">
                      <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-bold text-sky-200">Mengunggah...</span>
                    </div>
                  )}
                  {savedSuccessKey === uploadId && !isUploading && (
                    <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-300 space-y-1.5 z-10">
                      <Check className="w-7 h-7 text-emerald-400" />
                      <span className="text-xs font-bold">Slide Tersimpan!</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-8 space-y-2.5 min-w-0">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      File / URL Gambar Slide
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <input
                        type="text"
                        value={slide.image || ''}
                        onChange={(e) =>
                          onUpdateSlideField(item.section_key, sIdx, 'image', e.target.value)
                        }
                        placeholder="/assets/images/... atau /uploads/..."
                        className="flex-1 min-w-0 w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <label className="cursor-pointer px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0">
                        {isUploading ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploading ? 'Mengunggah...' : 'Pilih & Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUploadImage(item.section_key, file, sIdx);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Judul Slide (Opsional / Alt Text)
                      </label>
                      <input
                        type="text"
                        value={slide.title || ''}
                        onChange={(e) =>
                          onUpdateSlideField(item.section_key, sIdx, 'title', e.target.value)
                        }
                        placeholder="Contoh: Bengkel Las Besi Bandung Barat"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Keterangan Slide (Opsional)
                      </label>
                      <input
                        type="text"
                        value={slide.subtitle || ''}
                        onChange={(e) =>
                          onUpdateSlideField(item.section_key, sIdx, 'subtitle', e.target.value)
                        }
                        placeholder="Contoh: Pusat Fabrikasi Kanopi & Pagar"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onAddSlide(item.section_key)}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-sky-300 hover:border-sky-500 bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs transition flex items-center justify-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Tambah Slide Carousel Baru</span>
      </button>
    </div>
  );
}

interface ImageEditorProps {
  item: ContentItem;
  currentImageUrl: string;
  isSaving: boolean;
  isSuccess: boolean;
  isUploading: boolean;
  onChangeUrl: (sectionKey: string, value: string) => void;
  onSave: (item: ContentItem) => void;
  onUploadImage: (sectionKey: string, file: File) => void;
}

export function ImageEditorCard({
  item,
  currentImageUrl,
  isSaving,
  isSuccess,
  isUploading,
  onChangeUrl,
  onSave,
  onUploadImage,
}: ImageEditorProps) {
  return (
    <div className="bg-amber-50/35 rounded-xl p-4 sm:p-5 border border-amber-200/80 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
              Media Gambar Section
            </span>
            <span className="text-[11px] font-mono text-slate-400 truncate">
              {item.section_key}
            </span>
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 mt-1">{item.title}</h4>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {isSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              Tersimpan!
            </span>
          )}
          <button
            type="button"
            onClick={() => onSave(item)}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Simpan Gambar</span>
          </button>
        </div>
      </div>

      {item.dimension_hint && (
        <div className="p-2.5 bg-amber-50 border border-amber-200/90 rounded-xl flex flex-wrap items-center gap-2 text-xs text-amber-900">
          <span className="font-extrabold bg-amber-200/70 text-amber-950 px-2 py-0.5 rounded-md text-[10px] shrink-0">
            Rekomendasi Ukuran
          </span>
          <span className="font-semibold text-[11px]">{item.dimension_hint}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 bg-slate-950 rounded-xl overflow-hidden border border-slate-200 relative aspect-[16/8] flex items-center justify-center">
          <img
            src={currentImageUrl || '/assets/images/asset_12_subheader-oke.jpg'}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2 z-10">
              <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-sky-200">Mengunggah...</span>
            </div>
          )}
          {isSuccess && !isUploading && (
            <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-300 space-y-1 z-10">
              <Check className="w-6 h-6 text-emerald-400" />
              <span className="text-xs font-bold">Gambar Tersimpan!</span>
            </div>
          )}
        </div>

        <div className="md:col-span-7 space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm shrink-0">
              {isUploading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{isUploading ? 'Mengunggah...' : 'Pilih & Upload Gambar'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadImage(item.section_key, file);
                  e.target.value = '';
                }}
              />
            </label>
            <span className="text-[11px] text-slate-500">Otomatis tersimpan ke database</span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Path / URL Gambar:
            </label>
            <input
              type="text"
              value={currentImageUrl}
              onChange={(e) => onChangeUrl(item.section_key, e.target.value)}
              placeholder="/assets/images/... atau https://..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface TextFieldCardProps {
  item: ContentItem;
  value: string;
  isSaving: boolean;
  isSuccess: boolean;
  copiedKey: string | null;
  allowDelete?: boolean;
  compact?: boolean;
  onChange: (sectionKey: string, value: string) => void;
  onSave: (item: ContentItem) => void;
  onCopyKey: (key: string) => void;
  onDelete?: (item: ContentItem) => void;
}

export function TextFieldCard({
  item,
  value,
  isSaving,
  isSuccess,
  copiedKey,
  allowDelete = false,
  compact = false,
  onChange,
  onSave,
  onCopyKey,
  onDelete,
}: TextFieldCardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50/50 hover:border-sky-300 transition space-y-2.5 ${
        compact ? 'p-3.5' : 'p-4'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                item.content_type === 'textarea'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {item.content_type === 'textarea' ? 'Paragraf' : 'Teks'}
            </span>
            <button
              type="button"
              onClick={() => onCopyKey(item.section_key)}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-sky-600 transition"
              title="Salin section_key"
            >
              <span>{item.section_key}</span>
              {copiedKey === item.section_key ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {isSuccess && (
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Tersimpan
            </span>
          )}
          <button
            type="button"
            onClick={() => onSave(item)}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] shadow-xs transition flex items-center space-x-1 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            <span>Simpan</span>
          </button>
          {allowDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Hapus section kustom ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        {item.content_type === 'textarea' ? (
          <textarea
            rows={compact ? 3 : 3}
            value={value}
            onChange={(e) => onChange(item.section_key, e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(item.section_key, e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        )}
      </div>
    </div>
  );
}

