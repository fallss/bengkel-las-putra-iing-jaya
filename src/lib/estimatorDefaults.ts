export interface EstimatorOption {
  name: string;
  pricePerUnit: number;
  unit: string;
  desc: string;
}

export interface EstimatorCategory {
  id: string;
  title: string;
  unitLabel: string;
  calcMode: 'area' | 'linear';
  resultUnit: string;
  primaryLabel: string;
  primaryMax: number;
  secondaryLabel?: string;
  secondaryMax?: number;
  sortOrder?: number;
  options: EstimatorOption[];
}

export interface EstimatorConfig {
  badgeText: string;
  headingTitle: string;
  headingSubtitle: string;
  warrantyLabel: string;
  warrantyValue: string;
  footnote: string;
  ctaText: string;
}

export const DEFAULT_ESTIMATOR_CONFIG: EstimatorConfig = {
  badgeText: 'Simulasi Online Cepat',
  headingTitle: 'Kalkulator Estimasi Biaya',
  headingSubtitle:
    'Dapatkan perkiraan biaya transparan untuk kanopi, pagar, railing, atau tangga putar Anda.',
  warrantyLabel: 'Jaminan Material',
  warrantyValue: '100% Sesuai Spesifikasi',
  footnote: '*Harga sudah termasuk cat duco anti karat dan jasa pemasangan. Bebas biaya survey & konsultasi.',
  ctaText: 'Kirim Hasil Estimasi Ini ke WhatsApp',
};

export const DEFAULT_ESTIMATOR_CATEGORIES: EstimatorCategory[] = [
  {
    id: 'kanopi',
    title: 'Atap Kanopi Carport',
    unitLabel: 'Luas (Panjang x Lebar)',
    calcMode: 'area',
    resultUnit: 'm²',
    primaryLabel: 'Panjang',
    primaryMax: 30,
    secondaryLabel: 'Lebar Carport',
    secondaryMax: 15,
    sortOrder: 0,
    options: [
      {
        name: 'Kanopi Atap Alderon Twinwall (Anti Panas & Bising)',
        pricePerUnit: 550000,
        unit: 'm²',
        desc: 'Besi Hollow Galvanis 4×6/4×8 + Atap Alderon berongga ganda tahan panas',
      },
      {
        name: 'Kanopi Kaca Tempered 8mm / 10mm (Mewah Modern)',
        pricePerUnit: 1250000,
        unit: 'm²',
        desc: 'Rangka Besi WF/Hollow tebal + Kaca Tempered bening/riben',
      },
      {
        name: 'Kanopi Spandek Pasir (Ekonomis & Tahan Karat)',
        pricePerUnit: 380000,
        unit: 'm²',
        desc: 'Rangka Galvanis SNI + Atap Spandek berlapis butir pasir peredam hujan',
      },
      {
        name: 'Kanopi Polycarbonate UV Protection',
        pricePerUnit: 420000,
        unit: 'm²',
        desc: 'Rangka Galvanis + Lembaran Polycarbonate merk SolarTuff / TwinLite',
      },
    ],
  },
  {
    id: 'pagar',
    title: 'Pintu Pagar Rumah',
    unitLabel: 'Luas (Panjang x Tinggi)',
    calcMode: 'area',
    resultUnit: 'm²',
    primaryLabel: 'Panjang',
    primaryMax: 30,
    secondaryLabel: 'Tinggi Pagar',
    secondaryMax: 4,
    sortOrder: 1,
    options: [
      {
        name: 'Pagar Besi Minimalis Galvanis Cat Duco',
        pricePerUnit: 480000,
        unit: 'm²',
        desc: 'Hollow Galvanis Anti Karat SNI 1.4mm + Cat Semprot Epoxy & Duco',
      },
      {
        name: 'Pagar Kombinasi Woodplank GRC Serat Kayu',
        pricePerUnit: 600000,
        unit: 'm²',
        desc: 'Rangka Besi Galvanis + Lisplang Woodplank tahan air & rayap',
      },
      {
        name: 'Pagar Plat Laser Cutting Modern Presisi',
        pricePerUnit: 950000,
        unit: 'm²',
        desc: 'Plat Besi 2mm Cutting Motif CNC Custom + Rangka Kokoh + Cat Premium',
      },
    ],
  },
  {
    id: 'railing',
    title: 'Railing Tangga & Balkon',
    unitLabel: 'Panjang Railing',
    calcMode: 'linear',
    resultUnit: 'm¹',
    primaryLabel: 'Panjang',
    primaryMax: 30,
    secondaryLabel: 'Lebar / Tinggi',
    secondaryMax: 10,
    sortOrder: 2,
    options: [
      {
        name: 'Railing Stainless SUS 304 Asli (Anti Karat Abadi)',
        pricePerUnit: 750000,
        unit: 'm¹',
        desc: 'Pipa Stainless SUS 304 murni + Las Argon mulus & polish kilap',
      },
      {
        name: 'Railing Stainless Kombinasi Kaca Tempered Glass',
        pricePerUnit: 1100000,
        unit: 'm¹',
        desc: 'Tiang Stainless 304 + Kaca Tempered 8mm/10mm + Fitting lengkap',
      },
      {
        name: 'Railing Besi Minimalis Garis Vertikal/Horizontal',
        pricePerUnit: 420000,
        unit: 'm¹',
        desc: 'Hollow Galvanis + Pengecatan halus standar hunian modern',
      },
    ],
  },
  {
    id: 'tangga-putar',
    title: 'Tangga Putar / Spiral',
    unitLabel: 'Tinggi Lantai ke Lantai',
    calcMode: 'linear',
    resultUnit: 'm¹',
    primaryLabel: 'Tinggi',
    primaryMax: 10,
    secondaryLabel: 'Lebar / Diameter',
    secondaryMax: 5,
    sortOrder: 3,
    options: [
      {
        name: 'Tangga Putar Plat Bordes Anti-Slip',
        pricePerUnit: 1650000,
        unit: 'm¹ tinggi',
        desc: 'Tiang Pipa 4 inch kokoh + Anak tangga plat bordes anti licin + Railing',
      },
      {
        name: 'Tangga Rebah Trap Kayu / Mezanin',
        pricePerUnit: 1950000,
        unit: 'm¹ tinggi',
        desc: 'Rangka UNP/Hollow tebal + Pijakan Kayu Bengkirai/Merbau solid',
      },
    ],
  },
];
