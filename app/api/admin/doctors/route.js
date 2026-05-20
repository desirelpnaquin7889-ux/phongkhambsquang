import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/admin-auth';

export async function GET() {
  const deny = await requireAuth();
  if (deny) return deny;
  const doctors = await prisma.doctor.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(doctors);
}

export async function POST(request) {
  const deny = await requireAuth();
  if (deny) return deny;

  const { name, specialty, credentials, bio, imageUrl, tags } = await request.json();
  if (!name || !specialty) {
    return NextResponse.json({ error: 'Tên và chuyên khoa là bắt buộc' }, { status: 400 });
  }

  const agg = await prisma.doctor.aggregate({ _max: { order: true } });
  const order = (agg._max.order ?? 0) + 1;

  try {
    const doctor = await prisma.doctor.create({
      data: {
        name,
        specialty,
        credentials: credentials || '',
        bio: bio || '',
        imageUrl: imageUrl || null,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        order,
      },
    });
    return NextResponse.json(doctor, { status: 201 });
  } catch (err) {
    console.error('Create doctor error:', err);
    return NextResponse.json({ error: 'Lỗi tạo bác sĩ' }, { status: 500 });
  }
}
