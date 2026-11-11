'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Save,
  Check,
  ExternalLink,
  Home,
  Info,
  Wrench,
  Image as ImageIcon,
  Phone,
  BookOpen,
  AlertCircle,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  RefreshCw,
  Globe,
  Search,
  X,
  Copy,
  Sparkles,
} from 'lucide-react';
import { ArticleManagerPanel } from '@/components/admin/ArticleManagerPanel';

interface ContentItem {
  id: number;
  page_key: string;
  section_key: string;
  title: string;
  content: string;
  content_type: 'text' | 'textarea' | 'image' | 'carousel';
  dimension_hint?: string | null;
  updated_at?: string;
}

interface CarouselSlide {
  image: string;
  title?: string;
  subtitle?: string;
}

const PAGES = [
  { key: 'home', label: 'Beranda (Home)', icon: Home, liveUrl: '/' },
  { key: 'tentang-kami', label: 'Tentang Kami', icon: Info, liveUrl: '/tentang-kami' },
  { key: 'layanan', label: 'Layanan', icon: Wrench, liveUrl: '/layanan' },
  { key: 'galeri', label: 'Galeri Proyek', icon: ImageIcon, liveUrl: '/galeri' },
  { key: 'artikel', label: 'Artikel & Edukasi', icon: BookOpen, liveUrl: '/artikel' },
  { key: 'kontak', label: 'Kontak Workshop', icon: Phone, liveUrl: '/kontak' },
  { key: 'global', label: 'Header, Ticker & Footer', icon: Globe, liveUrl: '/' },
];

export default function AdminPagesEditor() {
  const [activePage, setActivePage] = useState('home');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [carouselState, setCarouselState] = useState<Record<string, CarouselSlide[]>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'media' | 'text'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSection, setNewSection] = useState({
    section_key: '',
    title: '',
    content: '',
    content_type: 'text' as 'text' | 'textarea',
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddNewSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSection.section_key || !newSection.title) return;
    setErrorMessage('');
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_key: activePage,
          section_key: newSection.section_key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          title: newSection.title.trim(),
          content: newSection.content,
          content_type: newSection.content_type,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewSection({ section_key: '', title: '', content: '', content_type: 'text' });
        loadContents(activePage);
      } else {
        setErrorMessage(data.message || 'Gagal menambahkan section');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat menambahkan section');
    }
  };

  const handleDeleteSection = async (item: ContentItem) => {
    if (!confirm(`Yakin ingin menghapus section "${item.title}" (${item.section_key})?`)) return;
    try {
      const res = await fetch(`/api/content?id=${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadContents(activePage);
      } else {
        setErrorMessage(data.message || 'Gagal menghapus section');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat menghapus');
    }
  };

  const handleSaveAllText = async () => {
    setIsSavingAll(true);
    setErrorMessage('');
    try {
      const textList = contents.filter((c) => c.content_type === 'text' || c.content_type === 'textarea');
      for (const item of textList) {
        const val = formData[item.section_key];
        if (val !== undefined) {
          await fetch('/api/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: item.id,
              page_key: item.page_key,
              section_key: item.section_key,
              title: item.title,
              content: val,
              content_type: item.content_type,
              dimension_hint: item.dimension_hint,
            }),
          });
        }
      }
      setSavedSuccess('ALL_SAVED');
      setTimeout(() => setSavedSuccess(null), 3000);
    } catch {
      setErrorMessage('Terjadi kesalahan saat menyimpan semua data');
    } finally {
      setIsSavingAll(false);
    }
  };

  const loadContents = (pageKey: string) => {
    setLoading(true);
    setErrorMessage('');
    fetch(`/api/content?page=${pageKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setContents(data.data);
          const initialForm: Record<string, string> = {};
          const initialCarousel: Record<string, CarouselSlide[]> = {};

          for (const item of data.data) {
            initialForm[item.section_key] = item.content;
            if (item.content_type === 'carousel') {
              try {
                const parsed = JSON.parse(item.content);
                initialCarousel[item.section_key] = Array.isArray(parsed) ? parsed : [];
              } catch {
                initialCarousel[item.section_key] = [];
              }
            }
          }
          setFormData(initialForm);
          setCarouselState(initialCarousel);
        }
      })
      .catch((err) => setErrorMessage(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadContents(activePage);
  }, [activePage]);

  // Handle direct file upload with immediate database auto-save
  const handleUploadImage = async (sectionKey: string, file: File, slideIndex?: number) => {
    const uploadId = slideIndex !== undefined ? `${sectionKey}_slide_${slideIndex}` : sectionKey;
    setUploadingKey(uploadId);
    setErrorMessage('');

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();

      if (data.success && (data.url || data.src)) {
        const fileUrl = data.url || data.src;

        if (slideIndex !== undefined) {
          const prevSlides = [...(carouselState[sectionKey] || [])];
          while (prevSlides.length <= slideIndex) {
            prevSlides.push({ image: '', title: '', subtitle: '' });
          }

          prevSlides[slideIndex] = {
            ...prevSlides[slideIndex],
            image: fileUrl,
          };
          const updatedSlides = [...prevSlides];

          setCarouselState((prev) => ({
            ...prev,
            [sectionKey]: updatedSlides,
          }));
          setFormData((prev) => ({
            ...prev,
            [sectionKey]: JSON.stringify(updatedSlides),
          }));

          const existingItem = contents.find((c) => c.section_key === sectionKey);

          // AUTO-SAVE IMMEDIATELY TO DATABASE
          const saveRes = await fetch('/api/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: existingItem?.id,
              page_key: activePage,
              section_key: sectionKey,
              title: existingItem?.title,
              content: JSON.stringify(updatedSlides),
              content_type: 'carousel',
              dimension_hint: existingItem?.dimension_hint,
            }),
          });
          const saveData = await saveRes.json();
          if (saveData.success) {
            setSavedSuccess(uploadId);
            setTimeout(() => setSavedSuccess(null), 3000);
          } else {
            setErrorMessage(saveData.message || 'Gagal menyimpan slide ke database');
          }
        } else {
          const existingItem = contents.find((c) => c.section_key === sectionKey);

          setFormData((prev) => ({
            ...prev,
            [sectionKey]: fileUrl,
          }));

          // AUTO-SAVE IMMEDIATELY TO DATABASE
          const saveRes = await fetch('/api/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: existingItem?.id,
              page_key: activePage,
              section_key: sectionKey,
              title: existingItem?.title,
              content: fileUrl,
              content_type: 'image',
              dimension_hint: existingItem?.dimension_hint,
            }),
          });
          const saveData = await saveRes.json();
          if (saveData.success) {
            setSavedSuccess(sectionKey);
            setTimeout(() => setSavedSuccess(null), 3000);
          } else {
            setErrorMessage(saveData.message || 'Gagal menyimpan gambar ke database');
          }
        }
      } else {
        setErrorMessage(data.message || 'Gagal mengunggah gambar');
      }
    } catch (err: any) {
      setErrorMessage(`Terjadi kesalahan saat mengunggah gambar: ${err.message || err}`);
    } finally {
      setUploadingKey(null);
    }
  };

  // Save single item
  const handleSave = async (item: ContentItem, overrideContent?: string) => {
    setSavingKey(item.section_key);
    setSavedSuccess(null);
    setErrorMessage('');

    const newContent = overrideContent !== undefined ? overrideContent : formData[item.section_key];

    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          page_key: item.page_key,
          section_key: item.section_key,
          title: item.title,
          content: newContent,
          content_type: item.content_type,
          dimension_hint: item.dimension_hint,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(item.section_key);
        setTimeout(() => setSavedSuccess(null), 3000);
      } else {
        setErrorMessage(data.message || 'Gagal menyimpan perubahan');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat menyimpan');
    } finally {
      setSavingKey(null);
    }
  };

  // Carousel helpers with auto-save
  const handleAddSlide = async (sectionKey: string) => {
    const currentSlides = [...(carouselState[sectionKey] || [])];
    const newSlide: CarouselSlide = {
      image: '/assets/images/asset_30_banner-2.jpg',
      title: `Slide Baru #${currentSlides.length + 1}`,
      subtitle: 'Keterangan atau subjudul slide banner',
    };
    const updated = [...currentSlides, newSlide];
    setCarouselState((prev) => ({ ...prev, [sectionKey]: updated }));
    setFormData((prev) => ({ ...prev, [sectionKey]: JSON.stringify(updated) }));

    try {
      await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_key: activePage,
          section_key: sectionKey,
          content: JSON.stringify(updated),
          content_type: 'carousel',
        }),
      });
      setSavedSuccess(sectionKey);
      setTimeout(() => setSavedSuccess(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveSlide = async (sectionKey: string, index: number) => {
    const currentSlides = [...(carouselState[sectionKey] || [])];
    if (currentSlides.length <= 1) {
      alert('Carousel harus memiliki minimal 1 slide.');
      return;
    }
    if (!confirm(`Hapus Slide #${index + 1}?`)) return;
    currentSlides.splice(index, 1);
    const updated = [...currentSlides];
    setCarouselState((prev) => ({ ...prev, [sectionKey]: updated }));
    setFormData((prev) => ({ ...prev, [sectionKey]: JSON.stringify(updated) }));

    try {
      await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_key: activePage,
          section_key: sectionKey,
          content: JSON.stringify(updated),
          content_type: 'carousel',
        }),
      });
      setSavedSuccess(sectionKey);
      setTimeout(() => setSavedSuccess(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveSlide = async (sectionKey: string, index: number, direction: 'up' | 'down') => {
    const currentSlides = [...(carouselState[sectionKey] || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSlides.length) return;

    const temp = currentSlides[index];
    currentSlides[index] = currentSlides[targetIndex];
    currentSlides[targetIndex] = temp;
    const updated = [...currentSlides];

    setCarouselState((prev) => ({ ...prev, [sectionKey]: updated }));
    setFormData((prev) => ({ ...prev, [sectionKey]: JSON.stringify(updated) }));

    try {
      await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_key: activePage,
          section_key: sectionKey,
          content: JSON.stringify(updated),
          content_type: 'carousel',
        }),
      });
      setSavedSuccess(sectionKey);
      setTimeout(() => setSavedSuccess(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSlideField = (
    sectionKey: string,
    index: number,
    field: 'image' | 'title' | 'subtitle',
    value: string
  ) => {
    const currentSlides = [...(carouselState[sectionKey] || [])];
    if (currentSlides[index]) {
      currentSlides[index] = {
        ...currentSlides[index],
        [field]: value,
      };
      setCarouselState({ ...carouselState, [sectionKey]: currentSlides });
      setFormData({ ...formData, [sectionKey]: JSON.stringify(currentSlides) });
    }
  };

  const currentTab = PAGES.find((p) => p.key === activePage)!;

  // Filter items by search and active filter
  const filteredContents = contents.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.section_key.toLowerCase().includes(q) ||
      (formData[c.section_key] || c.content || '').toLowerCase().includes(q)
    );
  });

  const mediaItems = filteredContents.filter((c) => c.content_type === 'image' || c.content_type === 'carousel');
  const textItems = filteredContents.filter((c) => c.content_type === 'text' || c.content_type === 'textarea');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <span>Kelola Banner, Gambar &amp; Teks Halaman</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Atur gambar banner, foto carousel hero slider tanpa batas, gambar section, serta seluruh teks secara spesifik dengan rekomendasi ukuran proporsional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadContents(activePage)}
            className="p-2.5 text-slate-500 hover:text-sky-600 hover:bg-slate-50 rounded-xl transition border border-slate-200"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href={currentTab.liveUrl}
            target="_blank"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition shadow-sm shadow-sky-500/20"
          >
            <span>Lihat {currentTab.label}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        {PAGES.map((page) => {
          const Icon = page.icon;
          const active = activePage === page.key;
          return (
            <button
              key={page.key}
              onClick={() => {
                setActivePage(page.key);
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-t-xl text-xs font-bold border-b-2 transition whitespace-nowrap ${
                active
                  ? 'border-sky-500 text-sky-600 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{page.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari teks atau section di ${currentTab.label}...`}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Buttons: Filter Tabs & Add Section & Save All */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({filteredContents.length})
            </button>
            <button
              onClick={() => setActiveFilter('media')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeFilter === 'media'
                  ? 'bg-white text-sky-600 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Gambar ({mediaItems.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeFilter === 'text'
                  ? 'bg-white text-indigo-600 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Teks ({textItems.length})</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Teks Baru</span>
          </button>

          <button
            onClick={handleSaveAllText}
            disabled={isSavingAll}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSavingAll ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : savedSuccess === 'ALL_SAVED' ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savedSuccess === 'ALL_SAVED' ? 'Tersimpan Semua!' : 'Simpan Semua Teks'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Content Editor */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium">Memuat data halaman {currentTab.label}...</p>
        </div>
      ) : contents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
          <p className="text-sm font-bold">Belum ada data untuk halaman {currentTab.label}.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* =========================================================
              BAGIAN 1: BANNER & MEDIA GAMBAR (DITAMPILKAN DI ATAS)
              ========================================================= */}
          {(activeFilter === 'all' || activeFilter === 'media') && mediaItems.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-200">
                <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Banner &amp; Media Gambar (Ukuran Spesifik)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Kelola foto banner, hero carousel tanpa batasan slide, dan gambar konten dengan panduan dimensi yang pas.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {mediaItems.map((item) => {
                  const isSaving = savingKey === item.section_key;
                  const isSuccess = savedSuccess === item.section_key;

                  // 1. CAROUSEL
                  if (item.content_type === 'carousel') {
                    const slides = carouselState[item.section_key] || [];

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-6 border-2 border-sky-300 shadow-sm space-y-6"
                      >
                        {/* Carousel Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-800">
                                Hero Slider Carousel
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs font-bold text-sky-600">
                                {slides.length} Slide Aktif (Tanpa Batasan Gambar)
                              </span>
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 mt-1">{item.title}</h3>
                            <p className="text-[11px] text-slate-400 font-mono">
                              section_key: <span className="text-sky-600 font-semibold">{item.section_key}</span>
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {isSuccess && (
                              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                Tersimpan!
                              </span>
                            )}
                            <button
                              onClick={() => handleSave(item, JSON.stringify(slides))}
                              disabled={isSaving}
                              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition flex items-center space-x-1.5 disabled:opacity-50"
                            >
                              {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              <span>Simpan Semua Slide</span>
                            </button>
                          </div>
                        </div>

                        {/* Dimension Guide Banner */}
                        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-sky-500 text-white rounded-lg flex-shrink-0 mt-0.5">
                              <Layers className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                                <span>Panduan Ukuran Spesifik Banner Carousel:</span>
                              </p>
                              <p className="text-xs text-sky-700 font-semibold">
                                {item.dimension_hint || '1920 x 1080 px (Rasio 16:9 Widescreen Standar) atau 2100 x 1080 px | Otomatis Full Cover Edge-to-Edge (Tanpa Space Hitam) | Maks 5MB'}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                💡 Banner otomatis tampil penuh (*full cover*) dari ujung ke ujung layar tanpa space kosong hitam. Bebas menambahkan slide sebanyak mungkin tanpa batasan gambar.
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddSlide(item.section_key)}
                            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm whitespace-nowrap"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Slide Baru</span>
                          </button>
                        </div>

                        {/* List of Carousel Slides */}
                        <div className="space-y-4">
                          {slides.map((slide, sIdx) => {
                            const uploadId = `${item.section_key}_slide_${sIdx}`;
                            const isUploading = uploadingKey === uploadId;

                            return (
                              <div
                                key={sIdx}
                                className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 hover:border-sky-300 transition space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-extrabold text-xs flex items-center justify-center">
                                      {sIdx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-slate-800">
                                      Slide #{sIdx + 1}
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => handleMoveSlide(item.section_key, sIdx, 'up')}
                                      disabled={sIdx === 0}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-30 transition border border-transparent hover:border-slate-200"
                                      title="Geser ke Atas"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleMoveSlide(item.section_key, sIdx, 'down')}
                                      disabled={sIdx === slides.length - 1}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-30 transition border border-transparent hover:border-slate-200"
                                      title="Geser ke Bawah"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveSlide(item.section_key, sIdx)}
                                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition border border-transparent hover:border-rose-200 ml-1"
                                      title="Hapus Slide Ini"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                  {/* Slide Preview */}
                                  <div className="md:col-span-4 aspect-[16/9] bg-slate-900 rounded-lg overflow-hidden border border-slate-200 relative group flex items-center justify-center">
                                    <img
                                      src={slide.image || '/assets/images/asset_30_banner-2.jpg'}
                                      alt={`Preview Slide ${sIdx + 1}`}
                                      className="w-full h-full object-contain"
                                    />

                                    {/* Uploading loading overlay */}
                                    {isUploading && (
                                      <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2 z-10">
                                        <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[11px] font-bold text-sky-200">Mengunggah &amp; Menyimpan...</span>
                                      </div>
                                    )}

                                    {/* Success badge overlay */}
                                    {savedSuccess === uploadId && !isUploading && (
                                      <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-300 space-y-1.5 z-10">
                                        <Check className="w-7 h-7 text-emerald-400" />
                                        <span className="text-xs font-bold">Slide Berhasil Disimpan!</span>
                                      </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-[11px] font-bold shadow hover:bg-white transition flex items-center gap-1">
                                        <Upload className="w-3 h-3" />
                                        <span>Ganti Foto</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          disabled={isUploading}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadImage(item.section_key, file, sIdx);
                                            e.target.value = '';
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </div>

                                  {/* Slide Inputs */}
                                  <div className="md:col-span-8 space-y-2.5">
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        File / URL Gambar Slide
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={slide.image || ''}
                                          onChange={(e) =>
                                            handleUpdateSlideField(
                                              item.section_key,
                                              sIdx,
                                              'image',
                                              e.target.value
                                            )
                                          }
                                          placeholder="/assets/images/nama-banner.jpg atau /uploads/..."
                                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        />
                                        <label className="cursor-pointer px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-sky-500/20 flex-shrink-0">
                                          {isUploading ? (
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <Upload className="w-3.5 h-3.5" />
                                          )}
                                          <span>{isUploading ? 'Mengunggah...' : 'Pilih & Upload Foto'}</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={isUploading}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleUploadImage(item.section_key, file, sIdx);
                                              e.target.value = '';
                                            }}
                                          />
                                        </label>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                          Judul Slide (Opsional)
                                        </label>
                                        <input
                                          type="text"
                                          value={slide.title || ''}
                                          onChange={(e) =>
                                            handleUpdateSlideField(
                                              item.section_key,
                                              sIdx,
                                              'title',
                                              e.target.value
                                            )
                                          }
                                          placeholder="Contoh: Bengkel Las Besi Bandung Barat"
                                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                          Subjudul / Keterangan (Opsional)
                                        </label>
                                        <input
                                          type="text"
                                          value={slide.subtitle || ''}
                                          onChange={(e) =>
                                            handleUpdateSlideField(
                                              item.section_key,
                                              sIdx,
                                              'subtitle',
                                              e.target.value
                                            )
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

                        {/* Add slide button bottom */}
                        <button
                          onClick={() => handleAddSlide(item.section_key)}
                          className="w-full py-3 rounded-xl border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 text-sky-700 font-bold text-xs transition flex items-center justify-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Slide Carousel Baru (Tanpa Batasan)</span>
                        </button>
                      </div>
                    );
                  }

                  // 2. SINGLE IMAGE / BANNER
                  const currentImageUrl = formData[item.section_key] || item.content;
                  const isUploading = uploadingKey === item.section_key;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-sky-300 transition"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800">
                              Banner / Media Gambar
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-slate-900 mt-1">{item.title}</h3>
                          <p className="text-[11px] text-slate-400 font-mono">
                            section_key: <span className="text-sky-600 font-semibold">{item.section_key}</span>
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isSuccess && (
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              Tersimpan!
                            </span>
                          )}
                          <button
                            onClick={() => handleSave(item)}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition flex items-center space-x-1.5 disabled:opacity-50"
                          >
                            {isSaving ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            <span>Simpan Gambar</span>
                          </button>
                        </div>
                      </div>

                      {/* Specific Dimension Requirement Badge */}
                      {item.dimension_hint && (
                        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center space-x-2.5 text-xs text-amber-900">
                          <span className="font-extrabold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md text-[11px] flex-shrink-0">
                            📐 Rekomendasi Ukuran
                          </span>
                          <span className="font-semibold">{item.dimension_hint}</span>
                        </div>
                      )}

                      {/* Image Preview & Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        {/* Live Image Box */}
                        <div className="md:col-span-5 bg-slate-950 rounded-xl overflow-hidden border border-slate-200 relative aspect-[16/7] flex items-center justify-center">
                          <img
                            src={currentImageUrl || '/assets/images/asset_12_subheader-oke.jpg'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />

                          {/* Uploading loading overlay */}
                          {isUploading && (
                            <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2 z-10">
                              <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs font-bold text-sky-200">Mengunggah &amp; Menyimpan...</span>
                            </div>
                          )}

                          {/* Success badge overlay */}
                          {isSuccess && !isUploading && (
                            <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-300 space-y-1.5 z-10">
                              <Check className="w-7 h-7 text-emerald-400" />
                              <span className="text-xs font-bold">Gambar Berhasil Disimpan!</span>
                            </div>
                          )}
                        </div>

                        {/* Upload & URL Controls */}
                        <div className="md:col-span-7 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Unggah File Baru dari Komputer / HP
                            </label>
                            <div className="flex items-center gap-2">
                              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-sky-500/20 flex-shrink-0">
                                {isUploading ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                                <span>{isUploading ? 'Sedang Mengunggah...' : 'Pilih & Upload Gambar'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={isUploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadImage(item.section_key, file);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                              <span className="text-[11px] text-slate-400">
                                Otomatis disimpan ke server &amp; database.
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Atau Tulis Path / URL Gambar Langsung:
                            </label>
                            <input
                              type="text"
                              value={currentImageUrl}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  [item.section_key]: e.target.value,
                                })
                              }
                              placeholder="/assets/images/... atau https://..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================
              BAGIAN 2: TEKS & KONTEN HALAMAN
              ========================================================= */}
          {(activeFilter === 'all' || activeFilter === 'text') && textItems.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-200">
                <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Teks &amp; Deskripsi Konten Halaman
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Ubah judul utama, subjudul, cerita perusahaan, dan deskripsi call-to-action secara langsung.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {textItems.map((item) => {
                  const isSaving = savingKey === item.section_key;
                  const isSuccess = savedSuccess === item.section_key;
                  const currentVal = formData[item.section_key] ?? item.content;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-sky-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                              item.content_type === 'textarea'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {item.content_type === 'textarea' ? 'Paragraf Panjang' : 'Teks Singkat'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyKey(item.section_key)}
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-sky-600 transition"
                              title="Salin kunci section_key"
                            >
                              <span>{item.section_key}</span>
                              {copiedKey === item.section_key ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isSuccess && (
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              Tersimpan!
                            </span>
                          )}
                          <button
                            onClick={() => handleSave(item)}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition flex items-center space-x-1.5 disabled:opacity-50"
                          >
                            {isSaving ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            <span>Simpan Teks</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSection(item)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Hapus section teks ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        {item.content_type === 'textarea' ? (
                          <textarea
                            rows={4}
                            value={currentVal}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [item.section_key]: e.target.value,
                              })
                            }
                            className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition font-normal leading-relaxed"
                          />
                        ) : (
                          <input
                            type="text"
                            value={currentVal}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [item.section_key]: e.target.value,
                              })
                            }
                            className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition font-normal"
                          />
                        )}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
                          <span>Ketik teks baru lalu klik &quot;Simpan Teks&quot; atau &quot;Simpan Semua Teks&quot; di atas</span>
                          <span>{currentVal.length} karakter</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activePage === 'artikel' && (
        <div className="pt-4 space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-200">
            <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Tambah &amp; Edit Kartu Artikel Website
              </h2>
              <p className="text-[11px] text-slate-500">
                Kelola daftar artikel edukasi. Maksimal 6 card ditampilkan per halaman lengkap dengan navigasi nomor.
              </p>
            </div>
          </div>
          <ArticleManagerPanel />
        </div>
      )}

      {/* Modal Tambah Section Teks Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Tambah Section Teks di {currentTab.label}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewSection} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama / Label Section (Untuk Tampilan Admin)
                </label>
                <input
                  type="text"
                  required
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="Contoh: Judul Promo Menarik, Subjudul Garansi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kunci Section (section_key, huruf kecil &amp; underscore)
                </label>
                <input
                  type="text"
                  required
                  value={newSection.section_key}
                  onChange={(e) =>
                    setNewSection({
                      ...newSection,
                      section_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                    })
                  }
                  placeholder="Contoh: promo_title, promo_desc, sub_heading_custom"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Kunci unik untuk dipanggil di kode atau dibaca dinamis.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipe Input Teks</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSection({ ...newSection, content_type: 'text' })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                      newSection.content_type === 'text'
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Teks Singkat (Input)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSection({ ...newSection, content_type: 'textarea' })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                      newSection.content_type === 'textarea'
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Paragraf Panjang (Textarea)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Isi Teks Awal</label>
                {newSection.content_type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={newSection.content}
                    onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                    placeholder="Tuliskan isi teks atau deskripsi..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={newSection.content}
                    onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                    placeholder="Tuliskan teks singkat..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-md shadow-sky-500/20"
                >
                  Simpan Section Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
