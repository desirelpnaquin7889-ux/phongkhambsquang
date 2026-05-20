import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { name, phone, message } = await request.json();

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Họ tên và số điện thoại là bắt buộc' }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        message: message?.trim() || null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Contact error:', err);
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 });
  }
}
