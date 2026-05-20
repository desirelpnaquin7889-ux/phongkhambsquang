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

    const { name, description, icon, active } = await request.json();

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        icon: icon?.trim() || 'ri-service-line',
        active: active === true,
      },
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
