import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/admin-auth';

export async function GET(request) {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = 20;
    const where = status && status !== 'all' ? { status } : {};

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json({ appointments, total, page, limit });
  } catch (err) {
    console.error('GET appointments error:', err);
    return NextResponse.json({ error: 'Lỗi tải dữ liệu' }, { status: 500 });
  }
}
