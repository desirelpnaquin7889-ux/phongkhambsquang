import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/admin-auth';

const ALLOWED_KEYS = new Set([
  'site_name', 'site_tagline', 'home_title', 'home_subtitle', 'hero_image',
  'contact_address', 'contact_phone', 'contact_email',
  'contact_hours_weekday', 'contact_hours_sunday',
  'contact_open_time', 'contact_close_time',
  'contact_maps_embed', 'contact_maps_link',
]);

export async function GET() {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const rows = await prisma.siteSetting.findMany();
    return NextResponse.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (err) {
    console.error('GET settings error:', err);
    return NextResponse.json({ error: 'Lỗi tải cài đặt' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const updates = await request.json();
    const filtered = Object.entries(updates).filter(([k]) => ALLOWED_KEYS.has(k));

    if (filtered.length === 0) {
      return NextResponse.json({ error: 'Không có trường hợp lệ' }, { status: 400 });
    }

    await Promise.all(
      filtered.map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value).slice(0, 2000) },
          create: { key, value: String(value).slice(0, 2000) },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH settings error:', err);
    return NextResponse.json({ error: 'Lỗi lưu cài đặt' }, { status: 500 });
  }
}
