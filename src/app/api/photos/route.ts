import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let rows;
    if (category && category !== 'all') {
      rows = db.prepare('SELECT * FROM gallery_photos WHERE category = ? ORDER BY id DESC').all(category);
    } else {
      rows = db.prepare('SELECT * FROM gallery_photos ORDER BY id DESC').all();
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, category, category_label, src, location } = await req.json();

    if (!title || !src) {
      return NextResponse.json({ success: false, message: 'Judul dan URL Foto wajib diisi' }, { status: 400 });
    }

    const cat = category || 'kanopi';
    const catLabel = category_label || cat.charAt(0).toUpperCase() + cat.slice(1);

    const stmt = db.prepare(`
      INSERT INTO gallery_photos (title, category, category_label, src, location)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(title, cat, catLabel, src, location || 'Bandung Barat');

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil ditambahkan!',
      id: result.lastInsertRowid,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID foto wajib disertakan' }, { status: 400 });
    }

    db.prepare('DELETE FROM gallery_photos WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: 'Foto berhasil dihapus!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

