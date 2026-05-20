'use client';
import { useState } from 'react';

const STARS = [1, 2, 3, 4, 5];
const EMPTY = { name: '', role: '', initials: '', stars: 5, text: '', active: true };

function autoInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0] || '').slice(0, 2).join('').toUpperCase();
}

export default function TestimonialsClient({ initialData }) {
  const [items, setItems] = useState(initialData);
  const [panel, setPanel] = useState(null); // null | 'new' | item-object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  function set(field) {
    return e => {
      const val = e.target.value;
      setForm(f => {
        const next = { ...f, [field]: val };
        if (field === 'name' && !f._initialsEdited) next.initials = autoInitials(val);
        return next;
      });
    };
  }

  function openNew() {
    setForm(EMPTY);
    setError('');
    setPanel('new');
  }

  function openEdit(item) {
    setForm({ ...item, _initialsEdited: true });
    setError('');
    setPanel(item);
  }

  function close() {
    setPanel(null);
    setError('');
  }

  async function handleSave() {
    if (!form.name.trim() || !form.text.trim()) {
      setError('Tên và nội dung phản hồi là bắt buộc');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const isEdit = panel !== 'new';
      const payload = {
        name: form.name,
        role: form.role,
        initials: form.initials || autoInitials(form.name),
        stars: form.stars,
        text: form.text,
        active: form.active,
      };
      const r = await fetch(
        isEdit ? `/api/admin/testimonials/${panel.id}` : '/api/admin/testimonials',
        { method: isEdit ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      let saved;
      try { saved = await r.json(); } catch { throw new Error(`Lỗi server (HTTP ${r.status})`); }
      if (!r.ok) throw new Error(saved.error || `Lỗi ${r.status}`);
      setItems(prev => isEdit ? prev.map(x => x.id === saved.id ? saved : x) : [...prev, saved]);
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa phản hồi này?')) return;
    setDeletingId(id);
    try {
      const r = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Xóa thất bại');
      setItems(prev => prev.filter(x => x.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(item) {
    try {
      const r = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !item.active }),
      });
      const saved = await r.json();
      if (!r.ok) throw new Error(saved.error);
      setItems(prev => prev.map(x => x.id === saved.id ? saved : x));
    } catch (err) {
      alert(err.message);
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all';

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phản hồi bệnh nhân</h1>
          <p className="text-gray-500 text-sm mt-1">{items.filter(x => x.active).length} đang hiển thị / {items.length} tổng</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
          style={{ background: '#0D9488' }}>
          <i className="ri-add-line text-base"></i> Thêm phản hồi
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                style={{ background: '#F0FDFA', color: '#0D9488' }}>
                {item.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                  <button onClick={() => toggleActive(item)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${item.active ? 'bg-teal-50 text-teal-600 hover:bg-red-50 hover:text-red-500' : 'bg-gray-100 text-gray-400 hover:bg-teal-50 hover:text-teal-600'}`}>
                    {item.active ? 'Hiển thị' : 'Ẩn'}
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-0.5">{item.role}</p>
                <div className="flex gap-0.5 mt-1">
                  {STARS.map(s => (
                    <i key={s} className={`ri-star-${s <= item.stars ? 'fill' : 'line'} text-xs text-yellow-400`}></i>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => openEdit(item)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 text-gray-500 hover:text-teal-600 hover:border-teal-200 transition-colors">
                  <i className="ri-pencil-line text-sm"></i>
                </button>
                <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50">
                  <i className={deletingId === item.id ? 'ri-loader-4-line animate-spin text-sm' : 'ri-delete-bin-line text-sm'}></i>
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 italic">{item.text}</p>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-2 text-center py-20 text-gray-400">
            <i className="ri-chat-quote-line text-4xl block mb-3"></i>
            <p>Chưa có phản hồi nào. Nhấn "Thêm phản hồi" để bắt đầu.</p>
          </div>
        )}
      </div>

      {/* Side panel */}
      {panel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{panel === 'new' ? 'Thêm phản hồi mới' : 'Chỉnh sửa phản hồi'}</h2>
              <button onClick={close} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Name + Initials row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Chị Nguyễn Thị Lan" value={form.name} onChange={set('name')} className={inputCls} />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Viết tắt</label>
                  <input type="text" maxLength={2} placeholder="NL" value={form.initials}
                    onChange={e => setForm(f => ({ ...f, initials: e.target.value.toUpperCase(), _initialsEdited: true }))}
                    className={inputCls + ' text-center font-bold'} />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò / Dịch vụ đã dùng</label>
                <input type="text" placeholder="Bệnh nhân tầm soát ung thư" value={form.role} onChange={set('role')} className={inputCls} />
              </div>

              {/* Stars */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá sao</label>
                <div className="flex gap-2">
                  {STARS.map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, stars: s }))}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${form.stars === s ? 'border-yellow-300 bg-yellow-50 text-yellow-700' : 'border-gray-100 text-gray-400 hover:border-yellow-200'}`}>
                      {s} <i className={`ri-star-${s <= form.stars ? 'fill' : 'line'} text-yellow-400`}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung phản hồi <span className="text-red-500">*</span></label>
                <textarea rows={5} placeholder='"Dịch vụ tuyệt vời, bác sĩ tận tình..."'
                  value={form.text} onChange={set('text')}
                  className={inputCls + ' resize-none'} />
                <p className="text-gray-400 text-xs mt-1">Nên bắt đầu và kết thúc bằng dấu ngoặc kép "…"</p>
              </div>

              {/* Active */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">Hiển thị trên website</p>
                  <p className="text-xs text-gray-400 mt-0.5">Tắt để ẩn khỏi slider trang chủ</p>
                </div>
                <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.active ? 'bg-teal-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={close} className="flex-1 border border-gray-200 text-gray-600 font-medium text-sm rounded-xl py-2.5 hover:bg-gray-50 transition-colors">
                Hủy
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: saving ? '#9CA3AF' : '#0D9488' }}>
                {saving ? <><i className="ri-loader-4-line animate-spin"></i> Đang lưu...</> : <><i className="ri-save-line"></i> Lưu</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
