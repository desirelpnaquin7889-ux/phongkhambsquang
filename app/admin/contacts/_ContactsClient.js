'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

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

export default function ContactsClient({ initialMessages, initialTotal, initialPage, limit, initialSearch }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [detail, setDetail] = useState(null);       // message object | null
  const [deleteTarget, setDeleteTarget] = useState(null); // message object | null
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

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/contacts?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== deleteTarget.id));
        setDeleteTarget(null);
        setDetail(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Xóa tin nhắn thất bại');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ');
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.ceil(initialTotal / limit);
  const pageLink = (p) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', p);
    return url.pathname + url.search;
  };

  return (
    <div>
      {/* Giao diện chính */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm w-full">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            ref={searchRef}
            type="text"
            defaultValue={initialSearch}
            placeholder="Tìm theo họ tên hoặc số điện thoại..."
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="ri-mail-open-line text-4xl block mb-3"></i>
            <p className="text-sm">{initialSearch ? `Không tìm thấy kết quả cho "${initialSearch}"` : 'Không có tin nhắn liên hệ nào'}</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider w-10">#</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Người gửi</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Nội dung liên hệ</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">Thời gian</th>
                <th className="px-5 py-3.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {messages.map(m => (
                <tr key={m.id}
                  onClick={() => setDetail(m)}
                  className="hover:bg-teal-50/30 cursor-pointer transition-colors group">
                  <td className="px-5 py-4 text-gray-400 text-xs">{m.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors">{m.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{m.phone}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 hidden md:table-cell max-w-sm truncate">
                    {m.message || '—'}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell text-gray-500 text-xs">
                    {new Date(m.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
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
          <button onClick={() => router.push(pageLink(Math.max(1, initialPage - 1)))} disabled={initialPage === 1}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm transition-colors ${initialPage === 1 ? 'border-gray-100 text-gray-300 pointer-events-none' : 'border-gray-200 text-gray-600 hover:border-teal-300 bg-white'}`}>
            <i className="ri-arrow-left-s-line"></i>
          </button>
          {smartPages(initialPage, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
            ) : (
              <button key={p} onClick={() => router.push(pageLink(p))}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium border transition-colors ${
                  p === initialPage ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                }`}>
                {p}
              </button>
            )
          )}
          <button onClick={() => router.push(pageLink(Math.min(totalPages, initialPage + 1)))} disabled={initialPage === totalPages}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm transition-colors ${initialPage === totalPages ? 'border-gray-100 text-gray-300 pointer-events-none' : 'border-gray-200 text-gray-600 hover:border-teal-300 bg-white'}`}>
            <i className="ri-arrow-right-s-line"></i>
          </button>
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
                <h2 className="font-semibold text-gray-900">Chi tiết tin nhắn #{detail.id}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Gửi lúc {new Date(detail.createdAt).toLocaleString('vi-VN')}
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
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Người gửi</p>
                  <p className="font-semibold text-gray-900">{detail.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Số điện thoại</p>
                  <a href={`tel:${detail.phone}`} className="font-medium text-teal-600 hover:underline">{detail.phone}</a>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Nội dung tin nhắn</p>
                <p className="text-gray-700 bg-gray-50 rounded-xl px-4 py-3.5 text-sm leading-relaxed whitespace-pre-wrap min-h-[120px]">
                  {detail.message || <em className="text-gray-400">Không có nội dung tin nhắn</em>}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
              <button onClick={() => setDeleteTarget(detail)}
                className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                <i className="ri-delete-bin-line"></i> Xóa tin nhắn
              </button>
              <button onClick={() => setDetail(null)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl px-5 py-2 transition-colors">
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
            <h3 className="text-center font-semibold text-gray-900 mb-1">Xóa tin nhắn liên hệ?</h3>
            <p className="text-center text-gray-500 text-sm mb-6 font-normal">
              Tin nhắn liên hệ từ bệnh nhân <strong>{deleteTarget.name}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
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
