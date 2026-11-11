import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { slugifyCategory, type CategoryScope } from '@/lib/categoryDefaults';

export const dynamic = 'force-dynamic';

function parseScope(value: unknown): CategoryScope | null {
  if (value === 'layanan' || value === 'galeri') {
    return value;
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scopeParam = searchParams.get('scope');

    if (!scopeParam) {
      const rows = db
        .prepare('SELECT * FROM categories ORDER BY scope ASC, sort_order ASC, id ASC')
        .all();
      return NextResponse.json({ success: true, data: rows });
    }

    const scope = parseScope(scopeParam);
    if (!scope) {
      return NextResponse.json(
        { success: false, message: 'Scope kategori tidak valid (layanan | galeri)' },
        { status: 400 }
      );
    }

    const rows = db
      .prepare('SELECT * FROM categories WHERE scope = ? ORDER BY sort_order ASC, id ASC')
      .all(scope);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminAuthenticated()) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const scope = parseScope(body?.scope);
    const label = typeof body?.label === 'string' ? body.label.trim() : '';

    if (!scope) {
      return NextResponse.json(
        { success: false, message: 'Scope kategori tidak valid' },
        { status: 400 }
      );
    }
    if (!label) {
      return NextResponse.json(
        { success: false, message: 'Nama kategori wajib diisi' },
        { status: 400 }
      );
    }

    const rawSlug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    const slug = rawSlug || slugifyCategory(label) || `kategori-${Date.now()}`;

    const duplicate = db
      .prepare(
        'SELECT id FROM categories WHERE scope = ? AND (LOWER(slug) = LOWER(?) OR LOWER(label) = LOWER(?))'
      )
      .get(scope, slug, label);
    if (duplicate) {
      return NextResponse.json(
        { success: false, message: 'Kategori dengan nama atau slug tersebut sudah ada' },
        { status: 409 }
      );
    }

    const { nextOrder } = db
      .prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextOrder FROM categories WHERE scope = ?')
      .get(scope) as { nextOrder: number };

    const info = db
      .prepare('INSERT INTO categories (scope, slug, label, sort_order) VALUES (?, ?, ?, ?)')
      .run(scope, slug, label, nextOrder);

    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid);
    return NextResponse.json(
      { success: true, message: 'Kategori berhasil ditambahkan', data: created },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!isAdminAuthenticated()) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const id = Number(body?.id);
    const label = typeof body?.label === 'string' ? body.label.trim() : '';

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: 'ID kategori tidak valid' },
        { status: 400 }
      );
    }
    if (!label) {
      return NextResponse.json(
        { success: false, message: 'Nama kategori tidak boleh kosong' },
        { status: 400 }
      );
    }

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as
      | { id: number; scope: CategoryScope; slug: string; label: string }
      | undefined;
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    const duplicate = db
      .prepare(
        'SELECT id FROM categories WHERE scope = ? AND id != ? AND LOWER(label) = LOWER(?)'
      )
      .get(existing.scope, id, label);
    if (duplicate) {
      return NextResponse.json(
        { success: false, message: 'Nama kategori tersebut sudah digunakan' },
        { status: 409 }
      );
    }

    db.prepare('UPDATE categories SET label = ? WHERE id = ?').run(label, id);

    // Keep gallery photo labels synchronized when a gallery category display name changes
    if (existing.scope === 'galeri') {
      db.prepare('UPDATE gallery_photos SET category_label = ? WHERE LOWER(category) = LOWER(?)').run(
        label,
        existing.slug
      );
    }

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    return NextResponse.json({
      success: true,
      message: 'Nama kategori berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isAdminAuthenticated()) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: 'ID kategori tidak valid' },
        { status: 400 }
      );
    }

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as
      | { id: number; scope: CategoryScope; slug: string; label: string }
      | undefined;
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    const { total } = db
      .prepare('SELECT COUNT(*) AS total FROM categories WHERE scope = ?')
      .get(existing.scope) as { total: number };
    if (total <= 1) {
      return NextResponse.json(
        { success: false, message: 'Minimal harus tersisa satu kategori' },
        { status: 400 }
      );
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

