import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import {
  formatClientRow,
  normalizePhone,
  verifyClientPassword,
} from '@/lib/clientHelpers';

export const dynamic = 'force-dynamic';

function setSessionCookie(client: ReturnType<typeof formatClientRow>) {
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
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, password, isDemo } = body;

    let rawClient: Record<string, any> | undefined;

    if (isDemo) {
      rawClient = db
        .prepare('SELECT * FROM clients ORDER BY id ASC LIMIT 1')
        .get() as Record<string, any> | undefined;
    } else {
      const idStr = String(identifier ?? '').trim();
      if (!idStr) {
        return NextResponse.json(
          { success: false, message: 'Masukkan Nomor WhatsApp atau Email Anda' },
          { status: 400 }
        );
      }

      const cleanDigits = normalizePhone(idStr);
      rawClient = db
        .prepare(`
          SELECT * FROM clients
          WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone, '-', ''), ' ', ''), '+', ''), '.', '') = ?
             OR phone = ?
             OR LOWER(COALESCE(email, '')) = LOWER(?)
          LIMIT 1
        `)
        .get(cleanDigits, idStr, idStr) as Record<string, any> | undefined;

      if (!rawClient) {
        return NextResponse.json(
          {
            success: false,
            message: 'Nomor WhatsApp atau Email belum terdaftar. Silakan daftar di tab "Daftar Member".',
          },
          { status: 404 }
        );
      }

      if (!verifyClientPassword(password, rawClient.password)) {
        return NextResponse.json(
          { success: false, message: 'Password salah. Periksa kembali password Anda.' },
          { status: 401 }
        );
      }
    }

    if (!rawClient) {
      return NextResponse.json(
        { success: false, message: 'Data klien tidak ditemukan' },
        { status: 404 }
      );
    }

    const client = formatClientRow(rawClient);
    setSessionCookie(client);

    return NextResponse.json({
      success: true,
      message: 'Login klien berhasil',
      client,
    });
  } catch (error: any) {
    console.error('Client login error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memproses login klien' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessionCookie = cookies().get('client_session');
    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const rawClient = db
      .prepare('SELECT * FROM clients WHERE id = ?')
      .get(sessionData.id) as Record<string, any> | undefined;

    if (!rawClient) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json(
      {
        authenticated: true,
        client: formatClientRow(rawClient),
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

/** Allow an authenticated member to update their own profile / project request details. */
export async function PATCH(req: Request) {
  try {
    const sessionCookie = cookies().get('client_session');
    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, message: 'Silakan login terlebih dahulu' }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const existing = db
      .prepare('SELECT * FROM clients WHERE id = ?')
      .get(sessionData.id) as Record<string, any> | undefined;

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Akun member tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const nextName = String(body.name ?? existing.name).trim() || existing.name;
    const nextEmail = body.email !== undefined ? String(body.email).trim() : existing.email;
    const nextLocation = String(body.location ?? existing.location).trim() || existing.location;
    const nextProjectName =
      String(body.projectName ?? existing.project_name).trim() || existing.project_name;
    const nextProjectCategory =
      String(body.projectCategory ?? existing.project_category).trim() || existing.project_category;

    db.prepare(`
      UPDATE clients SET
        name = ?,
        email = ?,
        location = ?,
        project_name = ?,
        project_category = ?
      WHERE id = ?
    `).run(nextName, nextEmail || null, nextLocation, nextProjectName, nextProjectCategory, existing.id);

    const updated = db
      .prepare('SELECT * FROM clients WHERE id = ?')
      .get(existing.id) as Record<string, any>;
    const client = formatClientRow(updated);
    setSessionCookie(client);

    return NextResponse.json({
      success: true,
      message: 'Profil & kebutuhan proyek berhasil diperbarui',
      client,
    });
  } catch (error: any) {
    console.error('Client self-update error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memperbarui profil member' },
      { status: 500 }
    );
  }
}
