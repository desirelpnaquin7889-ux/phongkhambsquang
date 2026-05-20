import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '../_components/AdminShell';
import ServicesClient from './_ServicesClient';

export default async function ServicesPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_auth')?.value !== 'true') redirect('/admin');

  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });

  return (
    <AdminShell active="services">
      <ServicesClient initialServices={services} />
    </AdminShell>
  );
}
