import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '../_components/AdminShell';
import DoctorsClient from './_DoctorsClient';

export default async function DoctorsPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_auth')?.value !== 'true') redirect('/admin');

  const doctors = await prisma.doctor.findMany({ orderBy: { order: 'asc' } });

  return (
    <AdminShell active="doctors">
      <DoctorsClient initialDoctors={doctors} />
    </AdminShell>
  );
}
