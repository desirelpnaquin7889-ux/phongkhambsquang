import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '../_components/AdminShell';
import AppointmentsTable from './_AppointmentsTable';

export default async function AppointmentsPage({ searchParams }) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_auth')?.value !== 'true') redirect('/admin');

  const params = await searchParams;
  const status = params.status || 'all';
  const search = params.search?.trim() || '';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const limit = 20;

  const where = {
    ...(status !== 'all' ? { status } : {}),
    ...(search
      ? {
          OR: [
            { patientName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  return (
    <AdminShell active="appointments">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
        <p className="text-gray-500 text-sm mt-1">
          {search ? `Kết quả cho "${search}" — ` : ''}{total} lịch hẹn
        </p>
      </div>
      <AppointmentsTable
        appointments={appointments}
        total={total}
        status={status}
        page={page}
        limit={limit}
        search={search}
      />
    </AdminShell>
  );
}
