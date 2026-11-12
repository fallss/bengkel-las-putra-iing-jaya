import { NextResponse } from 'next/server';
import db, { getEstimatorCategories, getEstimatorConfig } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import {
  DEFAULT_ESTIMATOR_CONFIG,
  type EstimatorCategory,
  type EstimatorConfig,
  type EstimatorOption,
} from '@/lib/estimatorDefaults';

export const dynamic = 'force-dynamic';

function slugifyId(input: string): string {
  const base = String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || `kategori-${Date.now()}`;
}

function sanitizeOptions(raw: unknown): EstimatorOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const opt = (item || {}) as Record<string, unknown>;
      return {
        name: String(opt.name ?? '').trim(),
        pricePerUnit: Math.max(0, Number(opt.pricePerUnit) || 0),
        unit: String(opt.unit ?? 'm²').trim() || 'm²',
        desc: String(opt.desc ?? '').trim(),
      };
    })
    .filter((opt) => opt.name.length > 0);
}

function sanitizePositiveInt(value: unknown, fallback: number, min = 1, max = 500): number {
  const num = Math.round(Number(value));
  if (!Number.isFinite(num) || num < min) return fallback;
  return Math.min(num, max);
}

export async function GET() {
  try {
    const categories = getEstimatorCategories();
    const config = getEstimatorConfig();
    return NextResponse.json(
      { categories, config },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err) {
    console.error('Error fetching estimator data:', err);
    return NextResponse.json({ error: 'Gagal memuat data kalkulator estimasi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = String(body.title ?? '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const calcMode: 'area' | 'linear' = body.calcMode === 'linear' ? 'linear' : 'area';
    const resultUnit =
      String(body.resultUnit ?? (calcMode === 'linear' ? 'm¹' : 'm²')).trim() ||
      (calcMode === 'linear' ? 'm¹' : 'm²');
    const unitLabel =
      String(
        body.unitLabel ??
          (calcMode === 'area' ? 'Luas (Panjang x Lebar)' : 'Panjang / Ukuran')
      ).trim() || 'Ukuran';
    const primaryLabel = String(body.primaryLabel ?? 'Panjang').trim() || 'Panjang';
    const primaryMax = sanitizePositiveInt(body.primaryMax, 30);
    const secondaryLabel = String(body.secondaryLabel ?? 'Lebar').trim() || 'Lebar';
    const secondaryMax = sanitizePositiveInt(body.secondaryMax, 15);
    const options = sanitizeOptions(body.options);

    if (options.length === 0) {
      return NextResponse.json(
        { error: 'Minimal 1 pilihan jenis & harga bahan wajib diisi' },
        { status: 400 }
      );
    }

    const baseId = slugifyId(body.id || title);
    let candidateId = baseId;
    let suffix = 2;
    const checkStmt = db.prepare('SELECT id FROM estimator_categories WHERE id = ?');
    while (checkStmt.get(candidateId)) {
      candidateId = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const maxSortRow = db
      .prepare('SELECT COALESCE(MAX(sort_order), -1) as max_sort FROM estimator_categories')
      .get() as { max_sort: number };
    const nextSort = (maxSortRow?.max_sort ?? -1) + 1;

    db.prepare(`
      INSERT INTO estimator_categories (
        id, title, unit_label, calc_mode, result_unit,
        primary_label, primary_max, secondary_label, secondary_max,
        options, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      candidateId,
      title,
      unitLabel,
      calcMode,
      resultUnit,
      primaryLabel,
      primaryMax,
      secondaryLabel,
      secondaryMax,
      JSON.stringify(options),
      nextSort
    );

    const categories = getEstimatorCategories();
    const created = categories.find((c) => c.id === candidateId);
    return NextResponse.json({ success: true, category: created, categories });
  } catch (err) {
    console.error('Error creating estimator category:', err);
    return NextResponse.json({ error: 'Gagal menambahkan kategori kalkulator' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? 'update_category');

    if (action === 'update_config') {
      const incoming = (body.config || {}) as Partial<EstimatorConfig>;
      const current = getEstimatorConfig();
      const nextConfig: EstimatorConfig = {
        badgeText: String(incoming.badgeText ?? current.badgeText).trim() || DEFAULT_ESTIMATOR_CONFIG.badgeText,
        headingTitle:
          String(incoming.headingTitle ?? current.headingTitle).trim() ||
          DEFAULT_ESTIMATOR_CONFIG.headingTitle,
        headingSubtitle:
          String(incoming.headingSubtitle ?? current.headingSubtitle).trim() ||
          DEFAULT_ESTIMATOR_CONFIG.headingSubtitle,
        warrantyLabel:
          String(incoming.warrantyLabel ?? current.warrantyLabel).trim() ||
          DEFAULT_ESTIMATOR_CONFIG.warrantyLabel,
        warrantyValue:
          String(incoming.warrantyValue ?? current.warrantyValue).trim() ||
          DEFAULT_ESTIMATOR_CONFIG.warrantyValue,
        footnote:
          String(incoming.footnote ?? current.footnote).trim() || DEFAULT_ESTIMATOR_CONFIG.footnote,
        ctaText:
          String(incoming.ctaText ?? current.ctaText).trim() || DEFAULT_ESTIMATOR_CONFIG.ctaText,
      };

      db.prepare(`
        INSERT INTO site_settings (key, value, description)
        VALUES ('estimator_config', ?, 'Konfigurasi Teks Kalkulator Estimasi Biaya')
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).run(JSON.stringify(nextConfig));

      return NextResponse.json({ success: true, config: nextConfig });
    }

    if (action === 'reorder') {
      const orderedIds = Array.isArray(body.orderedIds)
        ? body.orderedIds.map((id: unknown) => String(id))
        : [];
      const stmt = db.prepare(
        'UPDATE estimator_categories SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      );
      const tx = db.transaction((ids: string[]) => {
        ids.forEach((id, idx) => stmt.run(idx, id));
      });
      tx(orderedIds);
      return NextResponse.json({ success: true, categories: getEstimatorCategories() });
    }

    // Default: update single category + its options
    const category = (body.category || body) as Partial<EstimatorCategory>;
    const id = String(category.id ?? '').trim();
    if (!id) {
      return NextResponse.json({ error: 'ID kategori wajib disertakan' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM estimator_categories WHERE id = ?').get(id) as
      | Record<string, any>
      | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    const title = String(category.title ?? existing.title).trim();
    if (!title) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const calcMode: 'area' | 'linear' =
      category.calcMode === 'linear' || category.calcMode === 'area'
        ? category.calcMode
        : existing.calc_mode === 'linear'
          ? 'linear'
          : 'area';
    const resultUnit =
      String(category.resultUnit ?? existing.result_unit).trim() ||
      (calcMode === 'linear' ? 'm¹' : 'm²');
    const unitLabel = String(category.unitLabel ?? existing.unit_label).trim() || 'Ukuran';
    const primaryLabel = String(category.primaryLabel ?? existing.primary_label).trim() || 'Panjang';
    const primaryMax = sanitizePositiveInt(category.primaryMax, Number(existing.primary_max) || 30);
    const secondaryLabel =
      String(category.secondaryLabel ?? existing.secondary_label ?? 'Lebar').trim() || 'Lebar';
    const secondaryMax = sanitizePositiveInt(
      category.secondaryMax,
      Number(existing.secondary_max) || 15
    );
    const options =
      category.options !== undefined
        ? sanitizeOptions(category.options)
        : sanitizeOptions(JSON.parse(existing.options || '[]'));

    if (options.length === 0) {
      return NextResponse.json(
        { error: 'Kategori harus memiliki minimal 1 pilihan jenis & harga bahan' },
        { status: 400 }
      );
    }

    db.prepare(`
      UPDATE estimator_categories SET
        title = ?,
        unit_label = ?,
        calc_mode = ?,
        result_unit = ?,
        primary_label = ?,
        primary_max = ?,
        secondary_label = ?,
        secondary_max = ?,
        options = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      unitLabel,
      calcMode,
      resultUnit,
      primaryLabel,
      primaryMax,
      secondaryLabel,
      secondaryMax,
      JSON.stringify(options),
      id
    );

    const categories = getEstimatorCategories();
    const updated = categories.find((c) => c.id === id);
    return NextResponse.json({ success: true, category: updated, categories });
  } catch (err) {
    console.error('Error updating estimator:', err);
    return NextResponse.json({ error: 'Gagal menyimpan perubahan kalkulator' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = String(url.searchParams.get('id') || '').trim();
    if (!id) {
      return NextResponse.json({ error: 'Parameter id wajib diisi' }, { status: 400 });
    }

    const total = db
      .prepare('SELECT count(*) as count FROM estimator_categories')
      .get() as { count: number };
    if (total.count <= 1) {
      return NextResponse.json(
        { error: 'Minimal 1 kategori kalkulator harus tetap ada' },
        { status: 400 }
      );
    }

    const info = db.prepare('DELETE FROM estimator_categories WHERE id = ?').run(id);
    if (info.changes === 0) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, categories: getEstimatorCategories() });
  } catch (err) {
    console.error('Error deleting estimator category:', err);
    return NextResponse.json({ error: 'Gagal menghapus kategori kalkulator' }, { status: 500 });
  }
}
