import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // Accept either 'file' or 'image' field name
    const file = (formData.get('file') || formData.get('image')) as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, message: 'Tidak ada file yang dipilih untuk diunggah' },
        { status: 400 }
      );
    }

    // Max 20MB limit
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Ukuran file terlalu besar (maksimal 20MB)' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if not exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Clean filename and preserve extension
    const ext = path.extname(file.name || '').toLowerCase() || '.jpg';
    const rawBase = path.basename(file.name || 'image', ext);
    const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'upload';
    const filename = `${Date.now()}_${safeBase}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      src: publicUrl,
      name: file.name,
      size: file.size,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: `Gagal mengunggah file: ${err.message}` },
      { status: 500 }
    );
  }
}
