import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany();
    return NextResponse.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (err) {
    console.error('GET public settings error:', err);
    return NextResponse.json({}, { status: 200 }); // return empty, not error (public page)
  }
}
