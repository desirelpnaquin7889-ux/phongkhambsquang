import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminShell from '../_components/AdminShell';
import Link from 'next/link';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_auth')?.value !== 'true') redirect('/admin');

  const [total, pending, confirmed, completed, recentAppts] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: 'pending' } }),
    prisma.appointment.count({ where: { status: 'confirmed' } }),
    prisma.appointment.count({ where: { status: 'completed' } }),
    prisma.appointment.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);

  const statusLabel = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
  const statusColor = { pending: 'bg-yellow-50 text-yellow-700', confirmed: 'bg-teal-50 text-teal-700', completed: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-600' };

  return (
    <AdminShell active="dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-500 text-sm mt-1">Phòng Khám An Bình — hôm nay {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tổng lịch hẹn', value: total, color: 'border-teal-200 bg-teal-50', textColor: 'text-teal-700' },
          { label: 'Chờ xác nhận', value: pending, color: 'border-yellow-200 bg-yellow-50', textColor: 'text-yellow-700' },
          { label: 'Đã xác nhận', value: confirmed, color: 'border-blue-200 bg-blue-50', textColor: 'text-blue-700' },
          { label: 'Hoàn thành', value: completed, color: 'border-green-200 bg-green-50', textColor: 'text-green-700' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl border p-5 ${stat.color}`}>
            <div className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
            <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Lịch hẹn gần đây</h2>
          <Link href="/admin/appointments" className="text-sm font-medium text-teal-600 hover:text-teal-700">
            Xem tất cả →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentAppts.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">Chưa có lịch hẹn nào</p>
          )}
          {recentAppts.map(a => (
            <div key={a.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600 font-semibold text-sm">
                {a.patientName?.[0] ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{a.patientName}</p>
                <p className="text-gray-400 text-xs">{a.phone} · {a.service}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[a.status] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabel[a.status] || a.status}
                </span>
                <p className="text-gray-400 text-xs mt-1">{a.date} · {a.timeSlot.replace(' (7:00 – 12:00)', '').replace(' (13:00 – 17:00)', '')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
