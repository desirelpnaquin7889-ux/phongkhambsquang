'use client';
import { useState } from 'react';

const ICON_PICKS = [
  'ri-heart-pulse-line', 'ri-parent-line', 'ri-microscope-line', 'ri-scan-2-line',
  'ri-test-tube-line', 'ri-user-heart-line', 'ri-stethoscope-line', 'ri-capsule-line',
  'ri-first-aid-kit-line', 'ri-mental-health-line', 'ri-eye-line', 'ri-tooth-line',
  'ri-dna-line', 'ri-heart-3-line', 'ri-lungs-line', 'ri-surgical-mask-line',
  'ri-pulse-line', 'ri-syringe-line', 'ri-hospital-line', 'ri-wheelchair-line',
];

const EMPTY = { name: '', description: '', icon: 'ri-heart-pulse-line', active: true };

export default function ServicesClient({ initialServices }) {
  const [services, setServices] = useState(initialServices);
  const [panel, setPanel] = useState(null); // null | 'new' | service-object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  function openNew() {
    setForm(EMPTY);
    setError('');
    setPanel('new');
  }

  function openEdit(s) {
    setForm({ name: s.name, description: s.description, icon: s.icon, active: s.active });
    setError('');
    setPanel(s);
  }

  function close() {
    setPanel(null);
    setError('');
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Tên dịch vụ là bắt buộc'); return; }
    setSaving(true);
    setError('');
    try {
      const isEdit = panel !== 'new';
      const r = await fetch(isEdit ? `/api/admin/services/${panel.id}` : '/api/admin/services', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const saved = await r.json();
      if (!r.ok) throw new Error(saved.error || 'Lỗi lưu');
      setServices(prev => isEdit ? prev.map(s => s.id === saved.id ? saved : s) : [...prev, saved]);
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa dịch vụ này?')) return;
    setDeletingId(id);
    try {
      const r = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Xóa thất bại');
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(s) {
    try {
      const r = await fetch(`/api/admin/services/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...s, active: !s.active }),
      });
      const saved = await r.json();
      if (!r.ok) throw new Error(saved.error);
      setServices(prev => prev.map(x => x.id === saved.id ? saved : x));
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý dịch vụ</h1>
          <p className="text-gray-500 text-sm mt-1">
            {services.filter(s => s.active).length} đang hoạt động / {services.length} tổng
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
          style={{ background: '#0D9488' }}>
          <i className="ri-add-line text-base"></i> Thêm dịch vụ
        </button>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-teal-600 text-lg"
              style={{ background: '#F0FDFA' }}>
              <i className={s.icon}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">{s.name}</h3>
                <button onClick={() => toggleActive(s)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${s.active ? 'bg-teal-50 text-teal-600 hover:bg-red-50 hover:text-red-500' : 'bg-gray-100 text-gray-400 hover:bg-teal-50 hover:text-teal-600'}`}>
                  {s.active ? 'Đang hoạt động' : 'Tạm ẩn'}
                </button>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{s.description}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => openEdit(s)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 text-gray-500 hover:text-teal-600 hover:border-teal-200 transition-colors">
                <i className="ri-pencil-line text-sm"></i>
              </button>
              <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50">
                <i className={deletingId === s.id ? 'ri-loader-4-line animate-spin text-sm' : 'ri-delete-bin-line text-sm'}></i>
              </button>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-2 text-center py-20 text-gray-400">
            <i className="ri-service-line text-4xl block mb-3"></i>
            <p>Chưa có dịch vụ nào. Nhấn "Thêm dịch vụ" để bắt đầu.</p>
          </div>
        )}
      </div>

      {/* Side panel */}
      {panel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{panel === 'new' ? 'Thêm dịch vụ mới' : 'Chỉnh sửa dịch vụ'}</h2>
              <button onClick={close} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                {/* Preview */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-teal-600" style={{ background: '#F0FDFA' }}>
                    <i className={form.icon || 'ri-service-line'}></i>
                  </div>
                  <input type="text" value={form.icon} onChange={set('icon')} placeholder="ri-heart-pulse-line"
                    className={inputCls + ' flex-1'} />
                </div>
                {/* Quick picks */}
                <p className="text-xs text-gray-400 mb-2">Chọn nhanh:</p>
                <div className="grid grid-cols-10 gap-1.5">
                  {ICON_PICKS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      title={ic}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${form.icon === ic ? 'text-teal-600 border-2 border-teal-400' : 'text-gray-500 border border-gray-100 hover:border-teal-200 hover:text-teal-500'}`}
                      style={form.icon === ic ? { background: '#F0FDFA' } : { background: '#F9FAFB' }}>
                      <i className={ic}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên dịch vụ <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Siêu âm tổng quát" value={form.name} onChange={set('name')} className={inputCls} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
                <textarea rows={4} placeholder="Mô tả ngắn về dịch vụ..." value={form.description} onChange={set('description')}
                  className={inputCls + ' resize-none'} />
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">Hiển thị trên website</p>
                  <p className="text-xs text-gray-400 mt-0.5">Tắt để ẩn dịch vụ khỏi trang chủ</p>
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

            {/* Footer */}
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
