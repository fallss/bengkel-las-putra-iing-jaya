import { ArticleItem } from '@/data/content';

/** Safely parses article body paragraphs from JSON array or newline-separated string. */
export function parseArticleContent(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // Fall through to newline splitting when stored text is plain prose.
      }
    }
    const blocks = trimmed.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    if (blocks.length > 0) return blocks;
    return trimmed.split('\n').map((b) => b.trim()).filter(Boolean);
  }
  return [];
}

/** Safely parses comma-separated or JSON-encoded article tags. */
export function parseArticleTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((t) => String(t).trim()).filter(Boolean);
        }
      } catch {
        // Fall through to comma-separated parsing.
      }
    }
    return trimmed.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

/** Converts an arbitrary title into a URL-safe slug. */
export function slugifyArticleTitle(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `artikel-${Date.now()}`;
}

/** Normalizes a SQLite articles row to the frontend ArticleItem shape. */
export function formatArticleRow(row: any): ArticleItem & { created_at?: string } {
  return {
    slug: String(row.slug || ''),
    title: String(row.title || ''),
    date: String(row.date || ''),
    readTime: String(row.read_time || row.readTime || '4 Menit Baca'),
    author: String(row.author || 'Tim Ahli Las Putra Iing Jaya'),
    image: String(row.image || '/assets/images/asset_24_Bengkel-Las-Stainless-Steel-Te.jpg'),
    excerpt: String(row.excerpt || ''),
    content: parseArticleContent(row.content),
    tags: parseArticleTags(row.tags),
    created_at: row.created_at,
  };
}

/** Returns today's date formatted in Indonesian (e.g., "11 November 2026"). */
export function getTodayIndonesianDate(): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

