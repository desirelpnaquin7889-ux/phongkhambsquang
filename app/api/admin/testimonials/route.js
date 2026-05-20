import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/admin-auth';

export async function GET() {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const rows = await prisma.testimonial.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET testimonials error:', err);
    return NextResponse.json({ error: 'Lỗi tải phản hồi' }, { status: 500 });
  }
}

export async function POST(request) {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const { name, role, initials, stars, text, active, order } = await request.json();
    if (!name?.trim() || !text?.trim()) {
      return NextResponse.json({ error: 'Tên và nội dung là bắt buộc' }, { status: 400 });
    }
    const t = await prisma.testimonial.create({
      data: {
        name: name.trim(),
        role: role?.trim() || '',
        initials: (initials?.trim() || name.trim().split(' ').map(w => w[0]).slice(0, 2).join('')).toUpperCase(),
        stars: Number(stars) || 5,
        text: text.trim(),
        active: active !== false,
        order: Number(order) || 0,
      },
    });
    revalidatePath('/');
    return NextResponse.json(t, { status: 201 });
  } catch (err) {
    console.error('POST testimonial error:', err);
    return NextResponse.json({ error: 'Lỗi tạo phản hồi' }, { status: 500 });
  }
}
