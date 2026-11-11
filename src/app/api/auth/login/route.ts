import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const user = db.prepare('SELECT id, username, name, role FROM admin_users WHERE username = ? AND password = ?').get(username, passwordHash) as any;

    if (!user) {
      return NextResponse.json({ success: false, message: 'Username atau password salah!' }, { status: 401 });
    }

    // Set cookie session
    const cookieStore = cookies();
    cookieStore.set('admin_session', JSON.stringify({ id: user.id, username: user.username, name: user.name }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

