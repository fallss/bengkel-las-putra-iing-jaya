import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM services ORDER BY created_at ASC').all();
    const formatted = rows.map((r: any) => ({
      ...r,
      specs: r.specs ? JSON.parse(r.specs) : [],
      materials: r.materials ? JSON.parse(r.materials) : [],
      features: r.features ? JSON.parse(r.features) : [],
      priceRange: r.price_range,
    }));
    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, category, tagline, desc, specs, materials, priceRange, image, features } = body;

    if (!id || !title || !desc || !image) {
      return NextResponse.json({ success: false, message: 'ID, Judul, Deskripsi, dan Gambar wajib diisi' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO services (id, title, category, tagline, desc, specs, materials, price_range, image, features)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        category = excluded.category,
        tagline = excluded.tagline,
        desc = excluded.desc,
        specs = excluded.specs,
        materials = excluded.materials,
        price_range = excluded.price_range,
        image = excluded.image,
        features = excluded.features
    `);

    stmt.run(
      id,
      title,
      category || 'Lainnya',
      tagline || '',
      desc,
      JSON.stringify(Array.isArray(specs) ? specs : []),
      JSON.stringify(Array.isArray(materials) ? materials : []),
      priceRange || '',
      image,
      JSON.stringify(Array.isArray(features) ? features : [])
    );

    return NextResponse.json({ success: true, message: 'Layanan berhasil disimpan!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID Layanan wajib diisi' }, { status: 400 });
    }

    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Layanan berhasil dihapus!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

