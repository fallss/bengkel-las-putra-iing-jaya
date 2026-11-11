import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, isDemo } = body;

    let client: any = null;

    if (isDemo || !identifier) {
      // Login as demo client
      client = db.prepare('SELECT * FROM clients ORDER BY id ASC LIMIT 1').get();
    } else {
      // Find client by phone, email, or id
      const trimmed = identifier.trim().replace(/[-\s]/g, '');
      client = db.prepare(`
        SELECT * FROM clients 
        WHERE phone LIKE ? OR email LIKE ? OR name LIKE ?
        LIMIT 1
      `).get(`%${trimmed}%`, `%${identifier.trim()}%`, `%${identifier.trim()}%`);

      if (!client) {
        // Fallback or create guest client session
        client = db.prepare('SELECT * FROM clients ORDER BY id ASC LIMIT 1').get();
      }
    }

    if (!client) {
      return NextResponse.json({ success: false, message: 'Data klien tidak ditemukan' }, { status: 404 });
    }

    // Set client session cookie
    const cookieStore = cookies();
    cookieStore.set('client_session', JSON.stringify({
      id: client.id,
      name: client.name,
      phone: client.phone,
      project_name: client.project_name
    }), {
      httpOnly: false, // Accessible to client-side for dynamic greeting
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return NextResponse.json({
      success: true,
      message: 'Login klien berhasil',
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        projectName: client.project_name,
        projectCategory: client.project_category,
        projectStatus: client.project_status,
        progressPercentage: client.progress_percentage,
        projectEstimate: client.project_estimate,
        location: client.location,
        notes: client.notes,
        createdAt: client.created_at,
      }
    });
  } catch (error: any) {
    console.error('Client login error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('client_session');

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(sessionData.id) as any;

    if (!client) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        projectName: client.project_name,
        projectCategory: client.project_category,
        projectStatus: client.project_status,
        progressPercentage: client.progress_percentage,
        projectEstimate: client.project_estimate,
        location: client.location,
        notes: client.notes,
        createdAt: client.created_at,
      }
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
