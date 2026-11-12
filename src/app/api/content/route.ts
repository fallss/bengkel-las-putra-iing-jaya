import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pageKey = searchParams.get('page');

    if (pageKey) {
      const rows = db.prepare('SELECT * FROM page_contents WHERE page_key = ? ORDER BY id ASC').all(pageKey);
      return NextResponse.json({ success: true, data: rows });
    }

    const rows = db.prepare('SELECT * FROM page_contents ORDER BY page_key, id ASC').all();
    return NextResponse.json({ success: true, data: rows });
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
    const { id, page_key, section_key, title, content, content_type, dimension_hint } = body;

    if (id) {
      db.prepare(`
        UPDATE page_contents
        SET content = ?,
            title = COALESCE(?, title),
            content_type = COALESCE(?, content_type),
            dimension_hint = COALESCE(?, dimension_hint),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(content, title, content_type, dimension_hint, id);
    } else if (page_key && section_key) {
      db.prepare(`
        INSERT INTO page_contents (page_key, section_key, title, content, content_type, dimension_hint)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(page_key, section_key) DO UPDATE SET
          content = excluded.content,
          title = COALESCE(NULLIF(?, ''), page_contents.title),
          content_type = COALESCE(excluded.content_type, page_contents.content_type),
          dimension_hint = COALESCE(excluded.dimension_hint, page_contents.dimension_hint),
          updated_at = CURRENT_TIMESTAMP
      `).run(page_key, section_key, title || section_key, content, content_type || 'text', dimension_hint || null, title || '');
    } else {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Konten berhasil diperbarui' });
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
    const { page_key, section_key, title, content, content_type, dimension_hint } = body;

    if (!page_key || !section_key) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap' }, { status: 400 });
    }

    const info = db.prepare(`
      INSERT INTO page_contents (page_key, section_key, title, content, content_type, dimension_hint)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(page_key, section_key) DO UPDATE SET
        content = excluded.content,
        title = excluded.title,
        content_type = excluded.content_type,
        dimension_hint = excluded.dimension_hint,
        updated_at = CURRENT_TIMESTAMP
    `).run(page_key, section_key, title || section_key, content || '', content_type || 'text', dimension_hint || null);

    return NextResponse.json({ success: true, message: 'Konten berhasil ditambahkan', id: info.lastInsertRowid });
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID diperlukan' }, { status: 400 });
    }

    db.prepare('DELETE FROM page_contents WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Konten berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
