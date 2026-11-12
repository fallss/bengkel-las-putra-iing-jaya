import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM site_settings').all() as any[];
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return NextResponse.json({ success: true, data: settings, rows });
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
    const stmt = db.prepare(
      'INSERT INTO site_settings (key, value, description) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    );

    for (const [key, val] of Object.entries(body)) {
      if (typeof val === 'string') {
        stmt.run(key, val.trim(), key);
      }
    }

    // Keep legacy global page_contents keys in sync with site_settings
    const syncContent = db.prepare(
      'UPDATE page_contents SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE page_key = ? AND section_key = ?'
    );
    const globalSyncMap: Array<[string, string]> = [
      ['topbar_tagline', 'topbar_tagline'],
      ['phone', 'topbar_phone'],
      ['ticker_text_1', 'ticker_text_1'],
      ['ticker_text_2', 'ticker_text_2'],
      ['ticker_phone', 'ticker_phone'],
      ['ticker_btn_label', 'ticker_btn_label'],
    ];
    for (const [settingKey, sectionKey] of globalSyncMap) {
      if (typeof body[settingKey] === 'string') {
        syncContent.run(body[settingKey].trim(), 'global', sectionKey);
      }
    }

    return NextResponse.json({ success: true, message: 'Pengaturan berhasil diperbarui!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

