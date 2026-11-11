import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, phone, service, district, message } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ success: false, message: 'Nama dan nomor telepon wajib diisi' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, phone, service, district, message)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(name, phone, service || '', district || '', message || '');

    return NextResponse.json({ success: true, message: 'Pesan berhasil disimpan ke database' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

