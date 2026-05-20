import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/admin-auth';

export async function GET() {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(services);
  } catch (err) {
    console.error('GET services error:', err);
    return NextResponse.json({ error: 'Lỗi tải dữ liệu' }, { status: 500 });
  }
}

export async function POST(request) {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const { name, description, icon, active } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Tên dịch vụ là bắt buộc' }, { status: 400 });

    const agg = await prisma.service.aggregate({ _max: { order: true } });
    const order = (agg._max.order ?? 0) + 1;

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        icon: icon?.trim() || 'ri-service-line',
        active: active !== false,
        order,
      },
    });
    revalidatePath('/');
    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error('POST service error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi tạo dịch vụ' }, { status: 500 });
  }
}
