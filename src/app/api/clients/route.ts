import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import {
  formatClientRow,
  hashClientPassword,
  normalizePhone,
} from '@/lib/clientHelpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = db
      .prepare('SELECT * FROM clients ORDER BY id DESC')
      .all() as Record<string, any>[];
    return NextResponse.json(
      { success: true, data: rows.map(formatClientRow) },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const name = String(body.name ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Nama dan Nomor HP/WhatsApp wajib diisi' },
        { status: 400 }
      );
    }

    const cleanDigits = normalizePhone(phone);
    const exists = db
      .prepare(
        "SELECT id FROM clients WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone, '-', ''), ' ', ''), '+', ''), '.', '') = ? OR phone = ?"
      )
      .get(cleanDigits, phone);
    if (exists) {
      return NextResponse.json(
        { success: false, message: 'Nomor telepon client ini sudah terdaftar' },
        { status: 409 }
      );
    }

    const progress = Math.min(100, Math.max(0, Math.round(Number(body.progressPercentage) || 15)));
    const passwordHash = body.password ? hashClientPassword(String(body.password)) : hashClientPassword('klien123');

    const info = db
      .prepare(`
        INSERT INTO clients (
          name, phone, email, password, project_name, project_category,
          project_status, progress_percentage, project_estimate, location, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        name,
        phone,
        String(body.email ?? '').trim() || null,
        passwordHash,
        String(body.projectName ?? '').trim() || `Pesanan Proyek - ${name}`,
        String(body.projectCategory ?? '').trim() || 'Kanopi & Pagar',
        String(body.projectStatus ?? '').trim() || 'Pendaftaran Diterima • Menunggu Survey',
        progress,
        String(body.projectEstimate ?? '').trim() || 'Menunggu Survey & RAB',
        String(body.location ?? '').trim() || 'Bandung Barat',
        String(body.notes ?? '').trim() || ''
      );

    const created = db
      .prepare('SELECT * FROM clients WHERE id = ?')
      .get(info.lastInsertRowid) as Record<string, any>;

    return NextResponse.json({
      success: true,
      message: 'Data client berhasil ditambahkan',
      client: formatClientRow(created),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID client wajib diisi' }, { status: 400 });
    }

    const existing = db
      .prepare('SELECT * FROM clients WHERE id = ?')
      .get(id) as Record<string, any> | undefined;
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Data client tidak ditemukan' }, { status: 404 });
    }

    const progress =
      body.progressPercentage !== undefined
        ? Math.min(100, Math.max(0, Math.round(Number(body.progressPercentage) || 0)))
        : existing.progress_percentage;

    db.prepare(`
      UPDATE clients SET
        name = ?,
        phone = ?,
        email = ?,
        project_name = ?,
        project_category = ?,
        project_status = ?,
        progress_percentage = ?,
        project_estimate = ?,
        location = ?,
        notes = ?
      WHERE id = ?
    `).run(
      String(body.name ?? existing.name).trim() || existing.name,
      String(body.phone ?? existing.phone).trim() || existing.phone,
      body.email !== undefined ? String(body.email).trim() || null : existing.email,
      String(body.projectName ?? existing.project_name).trim() || existing.project_name,
      String(body.projectCategory ?? existing.project_category).trim() || existing.project_category,
      String(body.projectStatus ?? existing.project_status).trim() || existing.project_status,
      progress,
      String(body.projectEstimate ?? existing.project_estimate).trim() || existing.project_estimate,
      String(body.location ?? existing.location).trim() || existing.location,
      body.notes !== undefined ? String(body.notes).trim() : existing.notes,
      id
    );

    const updated = db
      .prepare('SELECT * FROM clients WHERE id = ?')
      .get(id) as Record<string, any>;

    return NextResponse.json({
      success: true,
      message: 'Progres & data client berhasil diperbarui',
      client: formatClientRow(updated),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ success: false, message: 'Parameter id wajib diisi' }, { status: 400 });
    }

    const info = db.prepare('DELETE FROM clients WHERE id = ?').run(id);
    if (info.changes === 0) {
      return NextResponse.json({ success: false, message: 'Client tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Data client berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

