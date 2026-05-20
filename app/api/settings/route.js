import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // revalidate every 60s

export async function GET() {
  const rows = await prisma.siteSetting.findMany();
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return NextResponse.json(settings);
}
