import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientName, phone, service, date, timeSlot, notes } = body;

    if (!patientName?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Họ tên và số điện thoại là bắt buộc' }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientName: patientName.trim(),
        phone: phone.trim(),
        service: service || '',
        date: date || '',
        timeSlot: timeSlot || '',
        notes: notes?.trim() || '',
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, id: appointment.id }, { status: 201 });
  } catch (err) {
    console.error('Appointment error:', err);
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 });
  }
}
