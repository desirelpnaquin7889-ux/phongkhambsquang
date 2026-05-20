import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth, parseId } from '@/lib/admin-auth';

export async function PATCH(request, { params }) {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

    const body = await request.json();
    const { name, description, icon, active } = body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description?.trim() || '';
    if (icon !== undefined) data.icon = icon?.trim() || 'ri-service-line';
    if (active !== undefined) data.active = active === true;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Không có dữ liệu để cập nhật' }, { status: 400 });
    }

    const service = await prisma.service.update({
      where: { id },
      data,
    });
    revalidatePath('/');
    return NextResponse.json(service);
  } catch (err) {
    console.error('PATCH service error:', err);
    return NextResponse.json({ error: 'Không tìm thấy dịch vụ' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

    await prisma.service.delete({ where: { id } });
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE service error:', err);
    return NextResponse.json({ error: 'Không tìm thấy dịch vụ' }, { status: 404 });
  }
}
