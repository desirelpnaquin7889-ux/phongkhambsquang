import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '../_components/AdminShell';
import ContactsClient from './_ContactsClient';

export default async function ContactsPage({ searchParams }) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_auth')?.value !== 'true') redirect('/admin');

  const params = await searchParams;
  const search = params.search?.trim() || '';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const limit = 20;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  // Convert Date objects to ISO strings for client component serialization
  const serializedMessages = messages.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <AdminShell active="contacts">
      <ContactsClient
        initialMessages={serializedMessages}
        initialTotal={total}
        initialPage={page}
        limit={limit}
        initialSearch={search}
      />
    </AdminShell>
  );
}
