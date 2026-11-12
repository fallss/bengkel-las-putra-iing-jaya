'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, MessageSquare, Check, Sparkles } from 'lucide-react';
import { COMPANY_INFO } from '@/data/content';
import { useSiteSettings } from '@/lib/useDynamicData';
import {
  DEFAULT_ESTIMATOR_CATEGORIES,
  DEFAULT_ESTIMATOR_CONFIG,
  type EstimatorCategory,
  type EstimatorConfig,
} from '@/lib/estimatorDefaults';

export function CostEstimator() {
  const settings = useSiteSettings({ whatsapp: COMPANY_INFO.waNumber });
  const [categories, setCategories] = useState<EstimatorCategory[]>(
    DEFAULT_ESTIMATOR_CATEGORIES
  );
  const [config, setConfig] = useState<EstimatorConfig>(DEFAULT_ESTIMATOR_CONFIG);
  const [selectedCat, setSelectedCat] = useState<string>(
    DEFAULT_ESTIMATOR_CATEGORIES[0].id
  );
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number>(0);
  const [length, setLength] = useState<number>(5);
  const [width, setWidth] = useState<number>(3);

  useEffect(() => {
    let active = true;
    fetch('/api/estimator', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          setSelectedCat((prev) =>
            data.categories.some((c: EstimatorCategory) => c.id === prev)
              ? prev
              : data.categories[0].id
          );
        }
        if (data.config) {
          setConfig({ ...DEFAULT_ESTIMATOR_CONFIG, ...data.config });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const currentCategory =
    categories.find((c) => c.id === selectedCat) ||
    categories[0] ||
    DEFAULT_ESTIMATOR_CATEGORIES[0];

  const safeOptions =
    currentCategory.options && currentCategory.options.length > 0
      ? currentCategory.options
      : DEFAULT_ESTIMATOR_CATEGORIES[0].options;

  const currentOption = safeOptions[selectedOptionIdx] || safeOptions[0];
  const isArea = currentCategory.calcMode === 'area';

  const primaryMax = Math.max(1, Number(currentCategory.primaryMax) || 30);
  const secondaryMax = Math.max(1, Number(currentCategory.secondaryMax) || 15);
  const safeLength = Math.min(length, primaryMax);
  const safeWidth = Math.min(width, secondaryMax);

  const areaOrLength = isArea ? safeLength * safeWidth : safeLength;
  const estimatedPrice = areaOrLength * (currentOption?.pricePerUnit || 0);

  const sliderUnitWord = currentCategory.resultUnit?.startsWith('m')
    ? 'Meter'
    : currentCategory.resultUnit || 'Unit';

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCategoryChange = (catId: string) => {
    const nextCat = categories.find((c) => c.id === catId);
    setSelectedCat(catId);
    setSelectedOptionIdx(0);
    if (nextCat) {
      setLength((prev) => Math.min(prev, Math.max(1, Number(nextCat.primaryMax) || 30)));
      setWidth((prev) => Math.min(prev, Math.max(1, Number(nextCat.secondaryMax) || 15)));
    }
  };

  const waDigits = (settings.whatsapp || COMPANY_INFO.waNumber || '').replace(/[^0-9]/g, '');
  const waText = encodeURIComponent(
    `Halo ${COMPANY_INFO.name}, saya baru saja menggunakan Kalkulator Estimasi Website:\n\n` +
      `- Layanan: ${currentCategory.title}\n` +
      `- Pilihan Bahan: ${currentOption?.name || '-'}\n` +
      `- Ukuran: ${
        isArea
          ? `${safeLength}m x ${safeWidth}m (${areaOrLength} ${currentCategory.resultUnit})`
          : `${safeLength} ${currentCategory.resultUnit}`
      }\n` +
      `- Perkiraan Estimasi: ${formatRupiah(estimatedPrice)}\n\n` +
      `Mohon info lanjut dan jadwal survey pengukuran ke lokasi saya.`
  );

  return (
    <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-medium">
              <Calculator className="w-3.5 h-3.5" />
              <span>{config.badgeText}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading">
              {config.headingTitle}
            </h3>
            <p className="text-slate-400 text-sm">{config.headingSubtitle}</p>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-xs text-slate-400 block">{config.warrantyLabel}</span>
            <span className="text-sm font-semibold text-sky-400">{config.warrantyValue}</span>
          </div>
        </div>

        {/* Step 1: Select Category */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                currentCategory.id === cat.id
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 font-semibold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Step 2: Select Material / Specification */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            Pilih Jenis & Spesifikasi Bahan:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {safeOptions.map((opt, idx) => {
              const isSelected = selectedOptionIdx === idx;
              return (
                <button
                  key={`${currentCategory.id}-${idx}-${opt.name}`}
                  type="button"
                  onClick={() => setSelectedOptionIdx(idx)}
                  className={`p-4 rounded-xl text-left border transition-all duration-200 flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400 ring-1 ring-sky-400/50'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/90 hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      isSelected ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-500'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-white leading-tight break-words">
                        {opt.name}
                      </h4>
                      <span className="text-xs font-bold text-sky-400 whitespace-nowrap">
                        {formatRupiah(opt.pricePerUnit)}
                        <span className="text-[10px] font-normal text-slate-400 block text-right">
                          /{opt.unit}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Dimensions Slider */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/60 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              {currentCategory.unitLabel}:
            </label>
            <span className="text-xs font-semibold px-2.5 py-1 bg-sky-500/10 text-sky-400 rounded-md border border-sky-400/20">
              Total Ukuran: {areaOrLength} {currentCategory.resultUnit}
            </span>
          </div>

          <div className={`grid grid-cols-1 ${isArea ? 'sm:grid-cols-2' : ''} gap-6`}>
            {/* Length Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">{currentCategory.primaryLabel} :</span>
                <span className="text-sky-400 font-bold">
                  {safeLength} {sliderUnitWord}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={primaryMax}
                step="0.5"
                value={safeLength}
                onChange={(e) => setLength(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Width / Height Slider (Area categories) */}
            {isArea && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">
                    {currentCategory.secondaryLabel || 'Lebar'} :
                  </span>
                  <span className="text-sky-400 font-bold">
                    {safeWidth} {sliderUnitWord}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={secondaryMax}
                  step="0.5"
                  value={safeWidth}
                  onChange={(e) => setWidth(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Estimated Result & CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-sky-600/20 to-blue-600/20 border border-sky-500/30 rounded-2xl p-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-xs text-slate-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>PERKIRAAN TOTAL BIAYA (BAHAN + PEMASANGAN):</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-sky-400 tracking-tight font-heading">
              {formatRupiah(estimatedPrice)}
            </div>
            <p className="text-[11px] text-slate-400">{config.footnote}</p>
          </div>

          <a
            href={`https://wa.me/${waDigits}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 transition-all duration-200 flex items-center justify-center space-x-2.5 flex-shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{config.ctaText}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default CostEstimator;
