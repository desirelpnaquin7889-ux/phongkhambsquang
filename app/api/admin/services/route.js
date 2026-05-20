import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/admin-auth';

export async function GET() {
  const deny = await requireAuth();
  if (deny) return deny;
  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(services);
}

export async function POST(request) {
  const deny = await requireAuth();
  if (deny) return deny;

  const { name, description, icon, active } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Tên dịch vụ là bắt buộc' }, { status: 400 });

  const agg = await prisma.service.aggregate({ _max: { order: true } });
  const order = (agg._max.order ?? 0) + 1;

  try {
    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        icon: icon?.trim() || 'ri-service-line',
        active: active !== false,
        order,
      },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error('Create service error:', err);
    return NextResponse.json({ error: 'Lỗi tạo dịch vụ' }, { status: 500 });
  }
}
