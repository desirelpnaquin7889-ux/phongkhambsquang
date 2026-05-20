import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAuth } from '@/lib/admin-auth';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

function verifyMagicBytes(buffer, mimeType) {
  const b = new Uint8Array(buffer.slice(0, 12));
  switch (mimeType) {
    case 'image/jpeg': return b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF;
    case 'image/png':  return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47;
    case 'image/webp': return b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
                              b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
    case 'image/gif':  return b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46;
    default:           return false;
  }
}

export async function POST(request) {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) return NextResponse.json({ error: 'Không có file' }, { status: 400 });
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json({ error: 'Chỉ nhận JPG, PNG, WebP, GIF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();

    if (bytes.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'File tối đa 5 MB' }, { status: 400 });
    }
    if (!verifyMagicBytes(bytes, file.type)) {
      return NextResponse.json({ error: 'File không hợp lệ hoặc bị hỏng' }, { status: 400 });
    }

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const blob = await put(filename, bytes, { access: 'public' });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload thất bại' }, { status: 500 });
  }
}
