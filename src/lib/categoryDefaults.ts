export type CategoryScope = 'layanan' | 'galeri';

export interface CategoryItem {
  id?: number;
  scope: CategoryScope;
  slug: string;
  label: string;
  sort_order: number;
}

export const DEFAULT_LAYANAN_CATEGORIES: CategoryItem[] = [
  { scope: 'layanan', slug: 'Kanopi', label: 'Kanopi Carport', sort_order: 1 },
  { scope: 'layanan', slug: 'Pagar', label: 'Pintu & Pagar', sort_order: 2 },
  { scope: 'layanan', slug: 'Railing', label: 'Railing Stainless 304', sort_order: 3 },
  { scope: 'layanan', slug: 'Tangga', label: 'Tangga Putar & Spiral', sort_order: 4 },
  { scope: 'layanan', slug: 'Konstruksi', label: 'Baja WF & Rangka Atap', sort_order: 5 },
  { scope: 'layanan', slug: 'Teralis', label: 'Teralis Jendela', sort_order: 6 },
  { scope: 'layanan', slug: 'Lainnya', label: 'Lainnya', sort_order: 7 },
];

export const DEFAULT_GALERI_CATEGORIES: CategoryItem[] = [
  { scope: 'galeri', slug: 'kanopi', label: 'Kanopi Carport', sort_order: 1 },
  { scope: 'galeri', slug: 'pagar', label: 'Pagar & Gerbang', sort_order: 2 },
  { scope: 'galeri', slug: 'railing', label: 'Railing Tangga', sort_order: 3 },
  { scope: 'galeri', slug: 'tangga', label: 'Tangga Putar', sort_order: 4 },
  { scope: 'galeri', slug: 'teralis', label: 'Teralis Pengaman', sort_order: 5 },
  { scope: 'galeri', slug: 'konstruksi', label: 'Konstruksi WF', sort_order: 6 },
  { scope: 'galeri', slug: 'lainnya', label: 'Lainnya', sort_order: 7 },
];

export function getDefaultCategories(scope: CategoryScope): CategoryItem[] {
  return scope === 'galeri' ? DEFAULT_GALERI_CATEGORIES : DEFAULT_LAYANAN_CATEGORIES;
}

export function slugifyCategory(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

