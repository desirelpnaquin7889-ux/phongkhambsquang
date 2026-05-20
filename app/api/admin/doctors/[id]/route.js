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

    const { name, specialty, credentials, bio, imageUrl, tags } = await request.json();

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
    revalidatePath('/');
    return NextResponse.json(doctor);
  } catch (err) {
    console.error('PATCH doctor error:', err);
    return NextResponse.json({ error: 'Không tìm thấy bác sĩ' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const deny = await requireAuth();
  if (deny) return deny;
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

    await prisma.doctor.delete({ where: { id } });
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE doctor error:', err);
    return NextResponse.json({ error: 'Không tìm thấy bác sĩ' }, { status: 404 });
  }
}
