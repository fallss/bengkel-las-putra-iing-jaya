import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import {
  formatArticleRow,
  getTodayIndonesianDate,
  parseArticleContent,
  parseArticleTags,
  slugifyArticleTitle,
} from '@/lib/articleHelpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = db
      .prepare('SELECT * FROM articles ORDER BY created_at DESC, rowid ASC')
      .all();
    return NextResponse.json({
      success: true,
      data: rows.map(formatArticleRow),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal memuat artikel' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak. Silakan login sebagai Admin terlebih dahulu.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const title = String(body.title || '').trim();
    const excerpt = String(body.excerpt || '').trim();
    const image = String(body.image || '').trim();
    const paragraphs = parseArticleContent(body.content);

    if (!title || !excerpt || paragraphs.length === 0 || !image) {
      return NextResponse.json(
        { success: false, message: 'Judul, Foto Cover, Ringkasan, dan Isi Artikel wajib diisi.' },
        { status: 400 }
      );
    }

    const baseSlug = slugifyArticleTitle(String(body.slug || '').trim() || title);
    let slug = baseSlug;
    let suffix = 2;
    const existsStmt = db.prepare('SELECT 1 FROM articles WHERE slug = ?');
    while (existsStmt.get(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const date = String(body.date || '').trim() || getTodayIndonesianDate();
    const readTime =
      String(body.readTime || body.read_time || '').trim() ||
      `${Math.max(2, Math.ceil(paragraphs.join(' ').split(/\s+/).length / 150))} Menit Baca`;
    const author = String(body.author || '').trim() || 'Tim Ahli Las Putra Iing Jaya';
    const tags = parseArticleTags(body.tags);

    db.prepare(
      `INSERT INTO articles (slug, title, date, read_time, author, image, excerpt, content, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      slug,
      title,
      date,
      readTime,
      author,
      image,
      excerpt,
      JSON.stringify(paragraphs),
      JSON.stringify(tags)
    );

    const created = db.prepare('SELECT * FROM articles WHERE slug = ?').get(slug);
    return NextResponse.json(
      {
        success: true,
        message: 'Artikel baru berhasil ditambahkan!',
        data: formatArticleRow(created),
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal menambahkan artikel' },
      { status: 500 }
    );
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
    const targetSlug = String(body.originalSlug || body.slug || '').trim();
    if (!targetSlug) {
      return NextResponse.json(
        { success: false, message: 'Slug artikel yang diedit wajib disertakan.' },
        { status: 400 }
      );
    }

    const existing = db.prepare('SELECT * FROM articles WHERE slug = ?').get(targetSlug) as any;
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Artikel tidak ditemukan di database.' },
        { status: 404 }
      );
    }

    const title = String(body.title || '').trim();
    const excerpt = String(body.excerpt || '').trim();
    const image = String(body.image || '').trim();
    const paragraphs = parseArticleContent(body.content);

    if (!title || !excerpt || paragraphs.length === 0 || !image) {
      return NextResponse.json(
        { success: false, message: 'Judul, Foto Cover, Ringkasan, dan Isi Artikel wajib diisi.' },
        { status: 400 }
      );
    }

    const requestedSlug = String(body.slug || '').trim();
    const nextSlug = requestedSlug ? slugifyArticleTitle(requestedSlug) : targetSlug;
    if (nextSlug !== targetSlug) {
      const collision = db.prepare('SELECT 1 FROM articles WHERE slug = ?').get(nextSlug);
      if (collision) {
        return NextResponse.json(
          { success: false, message: `Slug "${nextSlug}" sudah digunakan artikel lain.` },
          { status: 409 }
        );
      }
    }

    const date = String(body.date || '').trim() || existing.date;
    const readTime = String(body.readTime || body.read_time || '').trim() || existing.read_time;
    const author = String(body.author || '').trim() || existing.author;
    const tags = parseArticleTags(body.tags);

    db.prepare(
      `UPDATE articles
       SET slug = ?,
           title = ?,
           date = ?,
           read_time = ?,
           author = ?,
           image = ?,
           excerpt = ?,
           content = ?,
           tags = ?
       WHERE slug = ?`
    ).run(
      nextSlug,
      title,
      date,
      readTime,
      author,
      image,
      excerpt,
      JSON.stringify(paragraphs),
      JSON.stringify(tags),
      targetSlug
    );

    const updated = db.prepare('SELECT * FROM articles WHERE slug = ?').get(nextSlug);
    return NextResponse.json({
      success: true,
      message: 'Perubahan artikel berhasil disimpan!',
      data: formatArticleRow(updated),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal memperbarui artikel' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak. Silakan login sebagai Admin terlebih dahulu.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug artikel wajib disertakan.' },
        { status: 400 }
      );
    }

    db.prepare('DELETE FROM articles WHERE slug = ?').run(slug);
    return NextResponse.json({
      success: true,
      message: 'Artikel berhasil dihapus!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal menghapus artikel' },
      { status: 500 }
    );
  }
}

