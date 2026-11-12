import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { slugifyCategory } from '@/lib/categoryDefaults';

export const dynamic = 'force-dynamic';

const DEFAULT_SERVICE_IMAGE = '/assets/images/asset_24_Jasa-pembuatan-kanopi.jpg';

function safeParseArray(raw: unknown): string[] {
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
        // Fall through to newline splitting when value is plain multiline text.
      }
    }
    return trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

function formatServiceRow(row: any) {
  return {
    ...row,
    specs: safeParseArray(row.specs),
    materials: safeParseArray(row.materials),
    features: safeParseArray(row.features),
    priceRange: row.price_range || '',
  };
}

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM services ORDER BY created_at ASC, rowid ASC').all();
    return NextResponse.json({ success: true, data: rows.map(formatServiceRow) });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak. Silakan login sebagai Admin terlebih dahulu.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const title = String(body.title || '').trim();
    const desc = String(body.desc || '').trim();
    const image = String(body.image || '').trim() || DEFAULT_SERVICE_IMAGE;

    if (!title || !desc) {
      return NextResponse.json(
        { success: false, message: 'Judul Layanan dan Deskripsi Lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    const baseId = slugifyCategory(String(body.id || '').trim() || title) || `layanan-${Date.now()}`;
    let serviceId = baseId;
    let suffix = 2;
    const existsStmt = db.prepare('SELECT 1 FROM services WHERE id = ?');
    while (existsStmt.get(serviceId)) {
      serviceId = `${baseId}-${suffix++}`;
    }

    const specs = safeParseArray(body.specs);
    const materials = safeParseArray(body.materials);
    const features = safeParseArray(body.features);

    db.prepare(`
      INSERT INTO services (id, title, category, tagline, desc, specs, materials, price_range, image, features)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      serviceId,
      title,
      String(body.category || 'Lainnya').trim() || 'Lainnya',
      String(body.tagline || '').trim(),
      desc,
      JSON.stringify(specs),
      JSON.stringify(materials),
      String(body.priceRange || body.price_range || '').trim(),
      image,
      JSON.stringify(features)
    );

    const created = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
    return NextResponse.json(
      { success: true, message: 'Layanan baru berhasil ditambahkan!', data: formatServiceRow(created) },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak. Silakan login sebagai Admin terlebih dahulu.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const targetId = String(body.originalId || body.id || '').trim();
    if (!targetId) {
      return NextResponse.json(
        { success: false, message: 'ID layanan yang diedit wajib disertakan.' },
        { status: 400 }
      );
    }

    const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(targetId) as any;
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Layanan tidak ditemukan di database.' },
        { status: 404 }
      );
    }

    const title = String(body.title || '').trim();
    const desc = String(body.desc || '').trim();
    const image = String(body.image || '').trim();

    if (!title || !desc || !image) {
      return NextResponse.json(
        { success: false, message: 'Judul, Foto Layanan, dan Deskripsi Lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    const requestedId = String(body.id || '').trim();
    const nextId = requestedId ? slugifyCategory(requestedId) || targetId : targetId;
    if (nextId !== targetId) {
      const collision = db.prepare('SELECT 1 FROM services WHERE id = ?').get(nextId);
      if (collision) {
        return NextResponse.json(
          { success: false, message: `ID layanan "${nextId}" sudah digunakan layanan lain.` },
          { status: 409 }
        );
      }
    }

    const specs = body.specs !== undefined ? safeParseArray(body.specs) : safeParseArray(existing.specs);
    const materials =
      body.materials !== undefined ? safeParseArray(body.materials) : safeParseArray(existing.materials);
    const features =
      body.features !== undefined ? safeParseArray(body.features) : safeParseArray(existing.features);

    db.prepare(`
      UPDATE services
      SET id = ?,
          title = ?,
          category = ?,
          tagline = ?,
          desc = ?,
          specs = ?,
          materials = ?,
          price_range = ?,
          image = ?,
          features = ?
      WHERE id = ?
    `).run(
      nextId,
      title,
      String(body.category || existing.category || 'Lainnya').trim(),
      String(body.tagline ?? existing.tagline ?? '').trim(),
      desc,
      JSON.stringify(specs),
      JSON.stringify(materials),
      String(body.priceRange ?? body.price_range ?? existing.price_range ?? '').trim(),
      image,
      JSON.stringify(features),
      targetId
    );

    const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(nextId);
    return NextResponse.json({
      success: true,
      message: 'Perubahan layanan berhasil disimpan!',
      data: formatServiceRow(updated),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak. Silakan login sebagai Admin terlebih dahulu.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID Layanan wajib diisi' }, { status: 400 });
    }

    const result = db.prepare('DELETE FROM services WHERE id = ?').run(id);
    if (result.changes === 0) {
      return NextResponse.json({ success: false, message: 'Layanan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Layanan berhasil dihapus!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

