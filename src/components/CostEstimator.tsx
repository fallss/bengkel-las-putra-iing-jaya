'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { COMPANY_INFO } from '@/data/content';

interface OptionType {
  name: string;
  pricePerUnit: number; // in IDR
  unit: string;
  desc: string;
}

interface CategoryOption {
  id: string;
  title: string;
  unitLabel: string;
  options: OptionType[];
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'kanopi',
    title: 'Atap Kanopi Carport',
    unitLabel: 'Luas (Panjang x Lebar)',
    options: [
      { name: 'Kanopi Atap Alderon Twinwall (Anti Panas & Bising)', pricePerUnit: 550000, unit: 'm²', desc: 'Besi Hollow Galvanis 4x6/4x8 + Atap Alderon berongga ganda tahan panas' },
      { name: 'Kanopi Kaca Tempered 8mm / 10mm (Mewah Modern)', pricePerUnit: 1250000, unit: 'm²', desc: 'Rangka Besi WF/Hollow tebal + Kaca Tempered bening/riben' },
      { name: 'Kanopi Spandek Pasir (Ekonomis & Tahan Karat)', pricePerUnit: 380000, unit: 'm²', desc: 'Rangka Galvanis SNI + Atap Spandek berlapis butir pasir peredam hujan' },
      { name: 'Kanopi Polycarbonate UV Protection', pricePerUnit: 420000, unit: 'm²', desc: 'Rangka Galvanis + Lembaran Polycarbonate merk SolarTuff / TwinLite' }
    ]
  },
  {
    id: 'pagar',
    title: 'Pintu Pagar Rumah',
    unitLabel: 'Luas (Panjang x Tinggi)',
    options: [
      { name: 'Pagar Besi Minimalis Galvanis Cat Duco', pricePerUnit: 480000, unit: 'm²', desc: 'Besi Hollow galvanis SNI rapat + engsel/roda bearing smooth' },
      { name: 'Pagar Kombinasi Woodplank GRC Serat Kayu', pricePerUnit: 600000, unit: 'm²', desc: 'Rangka besi hitam + papan GRC woodplank tahan air dan rayap' },
      { name: 'Pagar Plat Laser Cutting Modern Presisi', pricePerUnit: 950000, unit: 'm²', desc: 'Plat besi tebal dipotong motif CNC laser cutting custom estetik' }
    ]
  },
  {
    id: 'railing',
    title: 'Railing Tangga & Balkon',
    unitLabel: 'Panjang Railing',
    options: [
      { name: 'Railing Stainless SUS 304 Asli (Anti Karat Abadi)', pricePerUnit: 750000, unit: 'm¹', desc: 'Pipa SUS 304 hairline/mirror + tiang stainless kokoh' },
      { name: 'Railing Stainless Kombinasi Kaca Tempered Glass', pricePerUnit: 1100000, unit: 'm¹', desc: 'Tiang stainless 304 + kaca tempered 8mm mewah' },
      { name: 'Railing Besi Minimalis Garis Vertikal/Horizontal', pricePerUnit: 420000, unit: 'm¹', desc: 'Besi hollow galvanis rapat finishing cat duco hitam/putih' }
    ]
  },
  {
    id: 'tangga-putar',
    title: 'Tangga Putar / Spiral',
    unitLabel: 'Tinggi Lantai ke Lantai',
    options: [
      { name: 'Tangga Putar Plat Bordes Anti-Slip', pricePerUnit: 1650000, unit: 'm¹ tinggi', desc: 'Tiang sentral pipa baja tebal SCH + pijakan plat bordes timbul kokoh' },
      { name: 'Tangga Rebah Trap Kayu / Mezanin', pricePerUnit: 1950000, unit: 'm¹ tinggi', desc: 'Rangka canal UNP/Hollow tebal + pijakan kayu atau plat' }
    ]
  }
];

export const CostEstimator: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>('kanopi');
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number>(0);
  const [lengthVal, setLengthVal] = useState<number>(5);
  const [widthVal, setWidthVal] = useState<number>(3); // used as width or height

  const currentCategory = CATEGORIES.find((c) => c.id === selectedCat) || CATEGORIES[0];
  const currentOption = currentCategory.options[selectedOptionIdx] || currentCategory.options[0];

  // Calculate volume
  const isArea = selectedCat === 'kanopi' || selectedCat === 'pagar';
  const calculatedUnits = isArea ? lengthVal * widthVal : lengthVal;
  const estimatedCost = Math.round(calculatedUnits * currentOption.pricePerUnit);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleWhatsAppConsult = () => {
    const unitText = isArea ? `${lengthVal}m x ${widthVal}m (${calculatedUnits} m²)` : `${lengthVal} m¹`;
    const message = `Halo Bengkel Las Bandung Barat, saya ingin konsultasi estimasi biaya:\n\n` +
      `• Kategori: ${currentCategory.title}\n` +
      `• Pilihan Material: ${currentOption.name}\n` +
      `• Ukuran: ${unitText}\n` +
      `• Perkiraan Estimasi Web: Sekitar ${formatRupiah(estimatedCost)}\n\n` +
      `Mohon info ketersediaan jadwal survey gratis ke lokasi saya di Bandung Barat. Terima kasih!`;

    window.open(`https://wa.me/${COMPANY_INFO.waNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-slate-900 border border-sky-950/60 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-800/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 text-xs font-bold border border-sky-500/30">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulasi Online Cepat</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Kalkulator Estimasi Biaya
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Dapatkan perkiraan biaya transparan untuk kanopi, pagar, railing, atau tangga putar Anda.
            </p>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block">Jaminan Material</span>
            <span className="text-xs font-bold text-sky-400">100% Sesuai Spesifikasi</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCat(cat.id);
                  setSelectedOptionIdx(0);
                }}
                className={`h-full min-w-0 px-3 sm:px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition text-left relative ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 ring-1 ring-sky-400'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                }`}
              >
                <span className="block break-words">{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Material Selection Grid */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Pilih Jenis & Spesifikasi Bahan:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentCategory.options.map((opt, idx) => {
              const isSelected = selectedOptionIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedOptionIdx(idx)}
                  className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 min-w-0 h-full ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-start space-x-2">
                      <div className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-sky-400 bg-sky-400' : 'border-slate-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                      <span className={`text-sm font-bold break-words ${isSelected ? 'text-sky-300' : 'text-white'}`}>
                        {opt.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                  <div className="pl-6 sm:pl-0 text-left sm:text-right flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-sky-400 inline sm:block">
                      {formatRupiah(opt.pricePerUnit)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1 sm:ml-0">/{opt.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dimension Sliders */}
        <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-5 sm:space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {currentCategory.unitLabel}:
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
              Total Ukuran: {calculatedUnits} {isArea ? 'm²' : 'm¹'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Length / Tinggi */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Panjang {selectedCat === 'tangga-putar' ? 'Tinggi' : ''}:</span>
                <span className="font-mono font-bold text-sky-400">{lengthVal} Meter</span>
              </div>
              <input
                type="range"
                min="1"
                max={selectedCat === 'tangga-putar' ? 10 : 30}
                step="0.5"
                value={lengthVal}
                onChange={(e) => setLengthVal(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Width (if area) */}
            {isArea && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{selectedCat === 'kanopi' ? 'Lebar Carport' : 'Tinggi Pagar'}:</span>
                  <span className="font-mono font-bold text-sky-400">{widthVal} Meter</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={selectedCat === 'pagar' ? 4 : 15}
                  step="0.5"
                  value={widthVal}
                  onChange={(e) => setWidthVal(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Calculation Result & WhatsApp Action */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1 min-w-0">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              Perkiraan Total Biaya (Bahan + Pemasangan):
            </span>
            <div className="text-2xl sm:text-4xl font-black text-sky-400 tracking-tight font-mono break-words">
              {formatRupiah(estimatedCost)}
            </div>
            <p className="text-[11px] text-slate-400">
              *Harga sudah termasuk cat duco anti karat dan jasa pemasangan. Bebas biaya survey & konsultasi.
            </p>
          </div>

          <button
            onClick={handleWhatsAppConsult}
            className="w-full md:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-extrabold text-sm shadow-xl shadow-sky-500/25 active:scale-95 transition"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Hasil Estimasi Ini ke WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

