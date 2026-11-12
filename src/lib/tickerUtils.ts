export const DEFAULT_TICKER_ITEMS: string[] = [
  'Jasa Las Custom dan Fabrikasi Besi atau Stainless Steel',
  'Pengerjaan Cepat, Rapi & Bergaransi Resmi di Bandung Barat',
];

/** Resolves the ordered list of running text items from site_settings with legacy fallback. */
export function parseTickerItems(
  settings?: Record<string, string>,
  globalContent?: Record<string, string>
): string[] {
  const raw = settings?.ticker_items;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map((item) => String(item ?? '').trim()).filter(Boolean);
        if (cleaned.length > 0) return cleaned;
      }
    } catch {
      // Fallback to ticker_text_1 / ticker_text_2 below
    }
  }

  const t1 = (settings?.ticker_text_1 || globalContent?.ticker_text_1 || DEFAULT_TICKER_ITEMS[0]).trim();
  const t2 = (settings?.ticker_text_2 || globalContent?.ticker_text_2 || DEFAULT_TICKER_ITEMS[1]).trim();
  const combined = [t1, t2].filter(Boolean);
  return combined.length > 0 ? combined : [...DEFAULT_TICKER_ITEMS];
}
