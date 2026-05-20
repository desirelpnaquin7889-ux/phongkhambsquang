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
    const { name, role, initials, stars, text, active, order } = body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (role !== undefined) data.role = role?.trim() || '';
    if (initials !== undefined) data.initials = initials?.trim().toUpperCase() || '';
    if (stars !== undefined) data.stars = Number(stars);
    if (text !== undefined) data.text = text.trim();
    if (active !== undefined) data.active = active === true;
    if (order !== undefined) data.order = Number(order);

    const t = await prisma.testimonial.update({ where: { id }, data });
    revalidatePath('/');
    return NextResponse.json(t);
  } catch (err) {
    console.error('PATCH testimonial error:', err);
    return NextResponse.json({ error: 'Không tìm thấy phản hồi' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

    await prisma.testimonial.delete({ where: { id } });
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE testimonial error:', err);
    return NextResponse.json({ error: 'Không tìm thấy phản hồi' }, { status: 404 });
  }
}
