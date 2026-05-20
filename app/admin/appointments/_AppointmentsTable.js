'use client';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const STATUS = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-teal-50 text-teal-700 border-teal-200' },
  completed: { label: 'Hoàn thành',   color: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-50 text-red-600 border-red-200' },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, color: 'bg-gray-50 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg border ${s.color}`}>
      {s.label}
    </span>
  );
}

function smartPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const result = [];
  let prev = 0;
  for (const p of [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)) {
    if (p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  }
  return result;
}

export default function AppointmentsTable({ appointments: initial, total, status, page, limit, search }) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initial);
  const [detail, setDetail] = useState(null);       // appointment object | null
  const [deleteTarget, setDeleteTarget] = useState(null); // appointment object | null
  const [updatingId, setUpdatingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search → update URL
  function handleSearch(e) {
    const q = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const url = new URL(window.location.href);
      if (q) url.searchParams.set('search', q);
      else url.searchParams.delete('search');
      url.searchParams.delete('page');
      router.push(url.pathname + url.search);
    }, 400);
  }

  async function updateStatus(id, newStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        if (detail?.id === id) setDetail(d => ({ ...d, status: newStatus }));
      } else {
        alert('Cập nhật trạng thái thất bại, vui lòng thử lại.');
      }
    } catch {
      alert('Không thể kết nối server.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/appointments/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setAppointments(prev => prev.filter(a => a.id !== deleteTarget.id));
        setDeleteTarget(null);
        setDetail(null);
      } else {
        alert('Xóa thất bại, vui lòng thử lại.');
      }
    } catch {
      alert('Không thể kết nối server.');
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.ceil(total / limit);
  const pageLink = (p) => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (search) params.set('search', search);
    params.set('page', String(p));
    return `/admin/appointments?${params.toString()}`;
  };

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            ref={searchRef}
            type="text"
            defaultValue={search}
            placeholder="Tìm theo tên hoặc số điện thoại..."
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['all','Tất cả'], ['pending','Chờ xác nhận'], ['confirmed','Đã xác nhận'], ['completed','Hoàn thành'], ['cancelled','Đã hủy']].map(([key, label]) => (
            <Link key={key} href={`/admin/appointments?status=${key}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                status === key ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
              }`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {appointments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="ri-calendar-2-line text-4xl block mb-3"></i>
            <p className="text-sm">{search ? `Không tìm thấy kết quả cho "${search}"` : 'Không có lịch hẹn nào'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider w-10">#</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Bệnh nhân</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Dịch vụ</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">Ngày khám</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-3.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map(a => (
                <tr key={a.id}
                  onClick={() => setDetail(a)}
                  className="hover:bg-teal-50/30 cursor-pointer transition-colors group">
                  <td className="px-5 py-4 text-gray-400 text-xs">{a.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors">{a.patientName}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{a.phone}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 hidden md:table-cell max-w-[160px] truncate">{a.service}</td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="text-gray-700 text-xs">{a.date}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{a.timeSlot}</div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <i className="ri-arrow-right-s-line text-gray-300 group-hover:text-teal-400 transition-colors"></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Smart pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-5">
          <Link href={pageLink(Math.max(1, page - 1))}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm transition-colors ${page === 1 ? 'border-gray-100 text-gray-300 pointer-events-none' : 'border-gray-200 text-gray-600 hover:border-teal-300 bg-white'}`}>
            <i className="ri-arrow-left-s-line"></i>
          </Link>
          {smartPages(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
            ) : (
              <Link key={p} href={pageLink(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium border transition-colors ${
                  p === page ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                }`}>
                {p}
              </Link>
            )
          )}
          <Link href={pageLink(Math.min(totalPages, page + 1))}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm transition-colors ${page === totalPages ? 'border-gray-100 text-gray-300 pointer-events-none' : 'border-gray-200 text-gray-600 hover:border-teal-300 bg-white'}`}>
            <i className="ri-arrow-right-s-line"></i>
          </Link>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">Chi tiết lịch hẹn #{detail.id}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tạo lúc {new Date(detail.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Họ và tên</p>
                  <p className="font-semibold text-gray-900">{detail.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Số điện thoại</p>
                  <a href={`tel:${detail.phone}`} className="font-medium text-teal-600">{detail.phone}</a>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Dịch vụ</p>
                <p className="text-gray-800">{detail.service || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ngày khám</p>
                  <p className="text-gray-800">{detail.date || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Buổi khám</p>
                  <p className="text-gray-800">{detail.timeSlot}</p>
                </div>
              </div>
              {detail.notes && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ghi chú</p>
                  <p className="text-gray-700 bg-gray-50 rounded-xl px-4 py-3 text-sm leading-relaxed">{detail.notes}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Trạng thái</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS).map(([key, val]) => (
                    <button key={key}
                      disabled={updatingId === detail.id}
                      onClick={() => updateStatus(detail.id, key)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        detail.status === key
                          ? val.color + ' ring-2 ring-offset-1 ring-teal-400'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      {updatingId === detail.id && detail.status !== key ? '…' : val.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <button onClick={() => setDeleteTarget(detail)}
                className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                <i className="ri-delete-bin-line"></i> Xóa lịch hẹn
              </button>
              <button onClick={() => setDetail(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl px-5 py-2 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-xl"></i>
            </div>
            <h3 className="text-center font-semibold text-gray-900 mb-1">Xóa lịch hẹn?</h3>
            <p className="text-center text-gray-500 text-sm mb-6">
              Lịch hẹn của <strong>{deleteTarget.patientName}</strong> ({deleteTarget.date}) sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50">
                Hủy
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting ? <><i className="ri-loader-4-line animate-spin"></i> Đang xóa...</> : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
