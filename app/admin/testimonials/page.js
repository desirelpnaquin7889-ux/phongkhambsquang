import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '../_components/AdminShell';
import TestimonialsClient from './_TestimonialsClient';

export default async function TestimonialsPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_auth')?.value !== 'true') redirect('/admin');

  const rows = await prisma.testimonial.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });

  return (
    <AdminShell active="testimonials">
      <TestimonialsClient initialData={rows} />
    </AdminShell>
  );
}
