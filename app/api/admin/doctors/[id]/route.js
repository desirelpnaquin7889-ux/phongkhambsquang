import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, parseId } from '@/lib/admin-auth';

export async function PATCH(request, { params }) {
  const deny = await requireAuth();
  if (deny) return deny;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

  const { name, specialty, credentials, bio, imageUrl, tags } = await request.json();

  try {
    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        name,
        specialty,
        credentials: credentials || '',
        bio: bio || '',
        imageUrl: imageUrl?.trim() || null,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
      },
    });
    return NextResponse.json(doctor);
  } catch {
    return NextResponse.json({ error: 'Không tìm thấy bác sĩ' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const deny = await requireAuth();
  if (deny) return deny;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

  try {
    await prisma.doctor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Không tìm thấy bác sĩ' }, { status: 404 });
  }
}
