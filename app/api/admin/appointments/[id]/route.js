import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, parseId } from '@/lib/admin-auth';

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export async function PATCH(request, { params }) {
  const deny = await requireAuth();
  if (deny) return deny;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

  let status;
  try {
    ({ status } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(appointment);
  } catch {
    return NextResponse.json({ error: 'Không tìm thấy lịch hẹn' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const deny = await requireAuth();
  if (deny) return deny;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

  try {
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Không tìm thấy lịch hẹn' }, { status: 404 });
  }
}
