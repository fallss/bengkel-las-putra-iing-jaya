'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Plus,
  RefreshCw,
  Globe,
  Search,
  X,
  ArrowRight,
  ChevronDown,
  LayoutList,
} from 'lucide-react';
import { ArticleManagerPanel } from '@/components/admin/ArticleManagerPanel';
import {
  CarouselEditorCard,
  CarouselSlide,
  ContentItem,
  ImageEditorCard,
  TextFieldCard,
} from '@/components/admin/PageSectionEditors';
import {
  groupContentsByWebsiteOrder,
  PageSectionSchema,
} from '@/lib/pageSectionSchemas';

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
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);
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

  const loadContents = (pageKey: string) => {
    setLoading(true);
    setErrorMessage('');
    fetch(`/api/content?page=${pageKey}`, { cache: 'no-store' })
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

  const putContentItem = async (item: ContentItem, value: string) => {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: item.id,
        page_key: item.page_key,
        section_key: item.section_key,
        title: item.title,
        content: value,
        content_type: item.content_type,
        dimension_hint: item.dimension_hint,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || `Gagal menyimpan ${item.title}`);
    }
    return data;
  };

  const handleSave = async (item: ContentItem, overrideContent?: string) => {
    setSavingKey(item.section_key);
    setSavedSuccess(null);
    setErrorMessage('');

    const newContent =
      overrideContent !== undefined ? overrideContent : formData[item.section_key] ?? item.content;

    try {
      await putContentItem(item, newContent);
      setSavedSuccess(item.section_key);
      setTimeout(() => setSavedSuccess(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveSectionTexts = async (sectionId: string, sectionItems: ContentItem[]) => {
    const textTargets = sectionItems.filter(
      (i) => i.content_type === 'text' || i.content_type === 'textarea'
    );
    if (textTargets.length === 0) return;

    setSavingSectionId(sectionId);
    setErrorMessage('');
    try {
      for (const item of textTargets) {
        const val = formData[item.section_key] ?? item.content;
        await putContentItem(item, val);
      }
      setSavedSuccess(`SECTION_${sectionId}`);
      setTimeout(() => setSavedSuccess(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan teks di bagian ini');
    } finally {
      setSavingSectionId(null);
    }
  };

  const handleSaveAllText = async () => {
    setIsSavingAll(true);
    setErrorMessage('');
    try {
      const textList = contents.filter(
        (c) => c.content_type === 'text' || c.content_type === 'textarea'
      );
      for (const item of textList) {
        const val = formData[item.section_key];
        if (val !== undefined) {
          await putContentItem(item, val);
        }
      }
      setSavedSuccess('ALL_SAVED');
      setTimeout(() => setSavedSuccess(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan semua data');
    } finally {
      setIsSavingAll(false);
    }
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
      if (res.ok && data.success) {
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
    if (!confirm(`Yakin ingin menghapus section kustom "${item.title}" (${item.section_key})?`)) return;
    try {
      const res = await fetch(`/api/content?id=${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        loadContents(activePage);
      } else {
        setErrorMessage(data.message || 'Gagal menghapus section');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat menghapus');
    }
  };

  const persistCarouselSlides = async (sectionKey: string, slides: CarouselSlide[], badgeKey: string) => {
    const existingItem = contents.find((c) => c.section_key === sectionKey);
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: existingItem?.id,
        page_key: activePage,
        section_key: sectionKey,
        title: existingItem?.title,
        content: JSON.stringify(slides),
        content_type: 'carousel',
        dimension_hint: existingItem?.dimension_hint,
      }),
    });
    const saveData = await res.json();
    if (!res.ok || !saveData.success) {
      setErrorMessage(saveData.message || 'Gagal menyimpan slide carousel');
      return;
    }
    setSavedSuccess(badgeKey);
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  const handleUploadImage = async (sectionKey: string, file: File, slideIndex?: number) => {
    const uploadId = slideIndex !== undefined ? `${sectionKey}_slide_${slideIndex}` : sectionKey;
    setUploadingKey(uploadId);
    setErrorMessage('');

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.success && (data.url || data.src)) {
        const fileUrl = data.url || data.src;

        if (slideIndex !== undefined) {
          const prevSlides = [...(carouselState[sectionKey] || [])];
          while (prevSlides.length <= slideIndex) {
            prevSlides.push({ image: '', title: '', subtitle: '' });
          }
          prevSlides[slideIndex] = { ...prevSlides[slideIndex], image: fileUrl };
          const updatedSlides = [...prevSlides];

          setCarouselState((prev) => ({ ...prev, [sectionKey]: updatedSlides }));
          setFormData((prev) => ({ ...prev, [sectionKey]: JSON.stringify(updatedSlides) }));
          await persistCarouselSlides(sectionKey, updatedSlides, uploadId);
        } else {
          const existingItem = contents.find((c) => c.section_key === sectionKey);
          setFormData((prev) => ({ ...prev, [sectionKey]: fileUrl }));
          if (existingItem) {
            await putContentItem(existingItem, fileUrl);
          }
          setSavedSuccess(sectionKey);
          setTimeout(() => setSavedSuccess(null), 3000);
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
    await persistCarouselSlides(sectionKey, updated, sectionKey);
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
    await persistCarouselSlides(sectionKey, updated, sectionKey);
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
    await persistCarouselSlides(sectionKey, updated, sectionKey);
  };

  const handleUpdateSlideField = (
    sectionKey: string,
    index: number,
    field: 'image' | 'title' | 'subtitle',
    value: string
  ) => {
    const currentSlides = [...(carouselState[sectionKey] || [])];
    if (currentSlides[index]) {
      currentSlides[index] = { ...currentSlides[index], [field]: value };
      setCarouselState((prev) => ({ ...prev, [sectionKey]: currentSlides }));
      setFormData((prev) => ({ ...prev, [sectionKey]: JSON.stringify(currentSlides) }));
    }
  };

  const currentTab = PAGES.find((p) => p.key === activePage)!;

  const isMediaType = (item: ContentItem) =>
    item.content_type === 'image' || item.content_type === 'carousel';

  const matchesSearchAndType = (item: ContentItem) => {
    if (activeFilter === 'media' && !isMediaType(item)) return false;
    if (activeFilter === 'text' && isMediaType(item)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.section_key.toLowerCase().includes(q) ||
      (formData[item.section_key] || item.content || '').toLowerCase().includes(q)
    );
  };

  const mediaCount = useMemo(
    () => contents.filter((c) => isMediaType(c)).length,
    [contents]
  );
  const textCount = useMemo(
    () => contents.filter((c) => !isMediaType(c)).length,
    [contents]
  );

  const grouped = useMemo(
    () => groupContentsByWebsiteOrder(activePage, contents),
    [activePage, contents]
  );

  const visibleSections = useMemo(() => {
    return grouped.sections
      .map((grp) => {
        const filteredPrimary = grp.items.filter(matchesSearchAndType);
        const filteredSecondary = grp.secondaryItems.filter(matchesSearchAndType);
        const queryMatchMeta =
          !searchQuery.trim() ||
          grp.schema.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          grp.schema.description.toLowerCase().includes(searchQuery.toLowerCase());
        const showExternalOnly =
          activeFilter === 'all' &&
          filteredPrimary.length === 0 &&
          filteredSecondary.length === 0 &&
          Boolean(grp.schema.externalModule) &&
          queryMatchMeta;

        return {
          ...grp,
          filteredPrimary,
          filteredSecondary,
          visible:
            filteredPrimary.length > 0 || filteredSecondary.length > 0 || showExternalOnly,
        };
      })
      .filter((grp) => grp.visible);
  }, [grouped, activeFilter, searchQuery, formData]);

  const visibleCustomItems = useMemo(
    () => grouped.customItems.filter(matchesSearchAndType),
    [grouped, activeFilter, searchQuery, formData]
  );

  const renderField = (item: ContentItem, options?: { allowDelete?: boolean; compact?: boolean }) => {
    if (item.content_type === 'carousel') {
      return (
        <CarouselEditorCard
          key={item.id}
          item={item}
          slides={carouselState[item.section_key] || []}
          isSaving={savingKey === item.section_key}
          savedSuccessKey={savedSuccess}
          uploadingKey={uploadingKey}
          onSaveCarousel={(it, serialized) => handleSave(it, serialized)}
          onAddSlide={handleAddSlide}
          onRemoveSlide={handleRemoveSlide}
          onMoveSlide={handleMoveSlide}
          onUpdateSlideField={handleUpdateSlideField}
          onUploadImage={handleUploadImage}
        />
      );
    }

    if (item.content_type === 'image') {
      return (
        <ImageEditorCard
          key={item.id}
          item={item}
          currentImageUrl={formData[item.section_key] ?? item.content}
          isSaving={savingKey === item.section_key}
          isSuccess={savedSuccess === item.section_key}
          isUploading={uploadingKey === item.section_key}
          onChangeUrl={(key, val) => setFormData((prev) => ({ ...prev, [key]: val }))}
          onSave={(it) => handleSave(it)}
          onUploadImage={(key, file) => handleUploadImage(key, file)}
        />
      );
    }

    return (
      <TextFieldCard
        key={item.id}
        item={item}
        value={formData[item.section_key] ?? item.content}
        isSaving={savingKey === item.section_key}
        isSuccess={savedSuccess === item.section_key}
        copiedKey={copiedKey}
        allowDelete={options?.allowDelete}
        compact={options?.compact}
        onChange={(key, val) => setFormData((prev) => ({ ...prev, [key]: val }))}
        onSave={(it) => handleSave(it)}
        onCopyKey={handleCopyKey}
        onDelete={handleDeleteSection}
      />
    );
  };

  const renderSectionItems = (schema: PageSectionSchema, items: ContentItem[]) => {
    if (schema.layoutHint === 'stats-grid') {
      const mediaAndTab = items.filter(
        (i) => i.content_type === 'image' || i.section_key === 'stat_tab_text'
      );
      const statIndexes = [1, 2, 3, 4];
      const byKey = new Map(items.map((i) => [i.section_key, i]));
      const pairs = statIndexes
        .map((n) => ({
          num: n,
          val: byKey.get(`stat_val_${n}`),
          lbl: byKey.get(`stat_lbl_${n}`),
        }))
        .filter((p) => p.val || p.lbl);

      return (
        <div className="space-y-4">
          {mediaAndTab.map((it) => renderField(it))}
          {pairs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {pairs.map((pair) => (
                <div
                  key={pair.num}
                  className="rounded-xl border border-sky-100 bg-sky-50/30 p-3.5 space-y-2.5"
                >
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700">
                    Kotak Statistik #{pair.num}
                  </div>
                  {pair.val && renderField(pair.val, { compact: true })}
                  {pair.lbl && renderField(pair.lbl, { compact: true })}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (schema.layoutHint === 'advantage-grid') {
      const headerItems = items.filter(
        (i) => !i.section_key.startsWith('adv_title_') && !i.section_key.startsWith('adv_desc_')
      );
      const byKey = new Map(items.map((i) => [i.section_key, i]));
      const cards = [1, 2, 3, 4]
        .map((n) => ({
          num: n,
          title: byKey.get(`adv_title_${n}`),
          desc: byKey.get(`adv_desc_${n}`),
        }))
        .filter((c) => c.title || c.desc);

      return (
        <div className="space-y-4">
          {headerItems.length > 0 && (
            <div className="space-y-3">{headerItems.map((it) => renderField(it))}</div>
          )}
          {cards.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cards.map((c) => (
                <div
                  key={c.num}
                  className="rounded-xl border border-sky-100 bg-sky-50/30 p-3.5 space-y-2.5"
                >
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700">
                    Kartu Keunggulan 0{c.num}
                  </div>
                  {c.title && renderField(c.title, { compact: true })}
                  {c.desc && renderField(c.desc, { compact: true })}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <div className="space-y-3.5">{items.map((it) => renderField(it))}</div>;
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>Kelola Banner, Gambar &amp; Teks Halaman</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Disusun berurutan dari bagian paling atas website (Carousel / Banner) hingga bagian paling bawah, dengan gambar dan teks dikelompokkan per seksi sesuai tampilan web.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
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
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2.5">
        {PAGES.map((page) => {
          const Icon = page.icon;
          const active = activePage === page.key;
          return (
            <button
              key={page.key}
              type="button"
              onClick={() => {
                setActivePage(page.key);
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border transition whitespace-nowrap ${
                active
                  ? 'border-sky-300 text-sky-600 bg-white shadow-sm ring-1 ring-sky-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{page.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Bulk Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 max-w-md min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari teks atau seksi di ${currentTab.label}...`}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({contents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('media')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeFilter === 'media'
                  ? 'bg-white text-sky-600 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Gambar ({mediaCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeFilter === 'text'
                  ? 'bg-white text-indigo-600 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Teks ({textCount})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Teks Baru</span>
          </button>

          <button
            type="button"
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

      {/* Quick Top-to-Bottom Section Navigator */}
      {!loading && visibleSections.length > 1 && (
        <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-sky-800">
            <LayoutList className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>Urutan Tampilan Web {currentTab.label} (Atas ke Bawah) — Klik untuk Lompat Cepat:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {visibleSections.map(({ schema }) => (
              <button
                key={schema.id}
                type="button"
                onClick={() =>
                  document.getElementById(schema.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-sky-500 hover:text-white text-slate-700 border border-sky-200/80 text-[11px] font-bold transition shadow-2xs"
              >
                <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                  {schema.step}
                </span>
                <span className="truncate max-w-[200px]">{schema.title}</span>
              </button>
            ))}
            {activePage === 'artikel' && (
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('artikel-manager-section')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-sky-500 hover:text-white text-slate-700 border border-sky-200/80 text-[11px] font-bold transition shadow-2xs"
              >
                <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                  3
                </span>
                <span>Daftar Kartu Artikel</span>
              </button>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Ordered Website Sections */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium">Memuat struktur halaman {currentTab.label}...</p>
        </div>
      ) : visibleSections.length === 0 && visibleCustomItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200 space-y-2">
          <p className="text-sm font-bold text-slate-700">
            Tidak ada seksi atau konten yang cocok dengan filter / pencarian Anda.
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              Reset Pencarian &amp; Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {visibleSections.map(({ schema, filteredPrimary, filteredSecondary }) => {
            const sectionHasTexts = filteredPrimary.some(
              (i) => i.content_type === 'text' || i.content_type === 'textarea'
            );
            const isSectionSaving = savingSectionId === schema.id;
            const isSectionSaved = savedSuccess === `SECTION_${schema.id}`;
            const openSecondaryByDefault =
              activeFilter === 'text' || Boolean(searchQuery.trim());

            return (
              <section
                key={schema.id}
                id={schema.id}
                className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Section Header */}
                <div className="bg-gradient-to-r from-slate-50 via-white to-sky-50/40 px-4 sm:px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/20 mt-0.5">
                      {schema.step}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-800">
                          {schema.positionLabel}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                        {schema.step}. {schema.title}
                      </h2>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                        {schema.description}
                      </p>
                    </div>
                  </div>

                  {sectionHasTexts && (
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      {isSectionSaved && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Tersimpan!
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSaveSectionTexts(schema.id, filteredPrimary)}
                        disabled={isSectionSaving}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                      >
                        {isSectionSaving ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Simpan Seksi Ini</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Section Body: Paired Images + Texts in Exact Website Flow */}
                <div className="p-4 sm:p-6 space-y-4">
                  {filteredPrimary.length > 0 && renderSectionItems(schema, filteredPrimary)}

                  {filteredSecondary.length > 0 && (
                    <details
                      open={openSecondaryByDefault}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
                    >
                      <summary className="cursor-pointer flex items-center justify-between text-xs font-bold text-slate-600 select-none list-none">
                        <span>{schema.secondaryTitle || 'Opsi Tambahan / Cadangan'}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </summary>
                      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3">
                        {filteredSecondary.map((it) => renderField(it, { compact: true }))}
                      </div>
                    </details>
                  )}

                  {schema.externalModule && (
                    <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-extrabold uppercase tracking-wider">
                          {schema.externalModule.badge}
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {schema.externalModule.description}
                        </p>
                      </div>
                      <Link
                        href={schema.externalModule.href}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-xs shrink-0 whitespace-nowrap"
                      >
                        <span>{schema.externalModule.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {schema.note && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200/70 rounded-xl px-3.5 py-2.5">
                      <strong className="text-slate-700">Catatan:</strong> {schema.note}
                    </p>
                  )}
                </div>
              </section>
            );
          })}

          {/* Custom / Dynamically Added Sections */}
          {visibleCustomItems.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200/80">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-200 text-slate-700">
                  Seksi Kustom Tambahan
                </span>
                <h2 className="text-base font-extrabold text-slate-900 mt-1">
                  Konten Tambahan ({visibleCustomItems.length})
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-3.5">
                {visibleCustomItems.map((it) => renderField(it, { allowDelete: true }))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Position #3 on Artikel Page: Integrated Article Manager */}
      {activePage === 'artikel' && (
        <section
          id="artikel-manager-section"
          className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-slate-50 via-white to-sky-50/40 px-4 sm:px-6 py-4 border-b border-slate-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/20">
              3
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-800">
                Posisi #3 • Grid Kartu Artikel Website
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                3. Tambah &amp; Edit Kartu Artikel Website
              </h2>
              <p className="text-xs text-slate-500">
                Kelola daftar artikel edukasi di bawah judul halaman Artikel (maksimal 6 card per halaman lengkap dengan paginasi angka).
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <ArticleManagerPanel />
          </div>
        </section>
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
                  Tambah Teks Baru di {currentTab.label}
                </h3>
              </div>
              <button
                type="button"
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
                  placeholder="Contoh: Judul Promo Menarik"
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
                  placeholder="Contoh: promo_title"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
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
