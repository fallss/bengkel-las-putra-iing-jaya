import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import {
  formatClientRow,
  hashClientPassword,
  normalizePhone,
} from '@/lib/clientHelpers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? '').trim();
    const rawPhone = String(body.phone ?? '').trim();
    const normalized = normalizePhone(rawPhone);
    const email = String(body.email ?? '').trim();
    const password = String(body.password ?? '').trim();
    const projectCategory = String(body.projectCategory ?? '').trim() || 'Kanopi & Pagar';
    const projectName =
      String(body.projectName ?? '').trim() || `Pesanan ${projectCategory} - ${name}`;
    const location = String(body.location ?? '').trim() || 'Bandung Barat';

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap wajib diisi (minimal 2 karakter)' },
        { status: 400 }
      );
    }

    if (!normalized || normalized.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Nomor WhatsApp / HP tidak valid (minimal 8 digit)' },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Password akun minimal 4 karakter' },
        { status: 400 }
      );
    }

    // Check duplicate by normalized phone or email
    const existingByPhone = db
      .prepare(
        "SELECT id FROM clients WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone, '-', ''), ' ', ''), '+', ''), '.', '') = ? OR phone = ?"
      )
      .get(normalized, rawPhone) as { id: number } | undefined;

    if (existingByPhone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nomor WhatsApp ini sudah terdaftar. Silakan login lewat tab Masuk Client.',
        },
        { status: 409 }
      );
    }

    if (email) {
      const existingByEmail = db
        .prepare('SELECT id FROM clients WHERE LOWER(email) = LOWER(?)')
        .get(email) as { id: number } | undefined;
      if (existingByEmail) {
        return NextResponse.json(
          {
            success: false,
            message: 'Email ini sudah terdaftar. Silakan login lewat tab Masuk Client.',
          },
          { status: 409 }
        );
      }
    }

    const passwordHash = hashClientPassword(password);
    const initialStatus = 'Pendaftaran Member Diterima • Menunggu Verifikasi & Jadwal Survey';
    const initialEstimate = 'Menunggu Hasil Survey & RAB';
    const initialNotes =
      'Akun member Anda sudah terdaftar. Admin bengkel akan memverifikasi kebutuhan proyek dan menghubungi via WhatsApp untuk jadwal survey gratis.';

    const info = db
      .prepare(`
        INSERT INTO clients (
          name, phone, email, password, project_name, project_category,
          project_status, progress_percentage, project_estimate, location, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        name,
        rawPhone,
        email || null,
        passwordHash,
        projectName,
        projectCategory,
        initialStatus,
        15,
        initialEstimate,
        location,
        initialNotes
      );

    const inserted = db
      .prepare('SELECT * FROM clients WHERE id = ?')
      .get(info.lastInsertRowid) as Record<string, any>;

    const client = formatClientRow(inserted);

    cookies().set(
      'client_session',
      JSON.stringify({
        id: client.id,
        name: client.name,
        phone: client.phone,
        project_name: client.projectName,
      }),
      {
        httpOnly: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran member berhasil!',
      client,
    });
  } catch (error: any) {
    console.error('Client register error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal mendaftarkan member baru' },
      { status: 500 }
    );
  }
}

