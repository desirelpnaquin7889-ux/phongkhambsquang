'use client';
import { useState, useRef, useEffect } from 'react';

const EMPTY_FORM = { name: '', specialty: '', credentials: '', bio: '', imageUrl: '', tags: '' };

export default function DoctorsClient({ initialDoctors }) {
  const [doctors, setDoctors] = useState(initialDoctors.map(d => ({ ...d, tags: JSON.parse(d.tags || '[]') })));
  const [panel, setPanel] = useState(null); // null | 'new' | doctor-object
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const prevBlobRef = useRef(null);

  // Revoke previous blob URL to prevent memory leak
  useEffect(() => {
    return () => {
      if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
    };
  }, []);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  function openNew() {
    setForm(EMPTY_FORM);
    setPreview('');
    setImageFile(null);
    setError('');
    setPanel('new');
  }

  function openEdit(doc) {
    setForm({
      name: doc.name,
      specialty: doc.specialty,
      credentials: doc.credentials || '',
      bio: doc.bio || '',
      imageUrl: doc.imageUrl || '',
      tags: doc.tags.join(', '),
    });
    setPreview(doc.imageUrl || '');
    setImageFile(null);
    setError('');
    setPanel(doc);
  }

  function close() {
    setPanel(null);
    setImageFile(null);
    setPreview('');
    setError('');
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
    const blobUrl = URL.createObjectURL(file);
    prevBlobRef.current = blobUrl;
    setImageFile(file);
    setPreview(blobUrl);
    setForm(f => ({ ...f, imageUrl: '' }));
  }

  function clearImage() {
    setImageFile(null);
    setPreview('');
    setForm(f => ({ ...f, imageUrl: '' }));
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSave() {
    if (!form.name.trim() || !form.specialty.trim()) {
      setError('Tên và chuyên khoa là bắt buộc');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let imageUrl = form.imageUrl;

      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Upload thất bại');
        imageUrl = d.url;
      }

      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = { name: form.name, specialty: form.specialty, credentials: form.credentials, bio: form.bio, imageUrl, tags };

      const isEdit = panel !== 'new';
      const r = await fetch(isEdit ? `/api/admin/doctors/${panel.id}` : '/api/admin/doctors', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let saved;
      try { saved = await r.json(); } catch { throw new Error(`Lỗi server (HTTP ${r.status})`); }
      if (!r.ok) throw new Error(saved.error || `Lỗi ${r.status}`);

      let parsedTags = [];
      try { parsedTags = JSON.parse(saved.tags || '[]'); } catch { parsedTags = []; }
      const normalized = { ...saved, tags: parsedTags };
      setDoctors(prev => isEdit ? prev.map(d => d.id === saved.id ? normalized : d) : [...prev, normalized]);
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa bác sĩ này? Hành động không thể hoàn tác.')) return;
    setDeletingId(id);
    try {
      const r = await fetch(`/api/admin/doctors/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Xóa thất bại');
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all';

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đội ngũ bác sĩ</h1>
          <p className="text-gray-500 text-sm mt-1">{doctors.length} bác sĩ</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
          style={{ background: '#0D9488' }}>
          <i className="ri-add-line text-base"></i> Thêm bác sĩ
        </button>
      </div>

      {/* Doctor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {doctors.map(d => (
          <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative aspect-3/4 bg-gray-100">
              {d.imageUrl
                ? <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover object-center" />
                : <div className="w-full h-full flex items-center justify-center text-gray-300"><i className="ri-user-3-line text-5xl"></i></div>
              }
              {/* Actions overlay */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => openEdit(d)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-teal-600 hover:border-teal-200 transition-colors">
                  <i className="ri-pencil-line text-sm"></i>
                </button>
                <button onClick={() => handleDelete(d.id)} disabled={deletingId === d.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50">
                  <i className={deletingId === d.id ? 'ri-loader-4-line animate-spin text-sm' : 'ri-delete-bin-line text-sm'}></i>
                </button>
              </div>
            </div>
            <div className="p-5">
              <p className="text-teal-600 text-xs font-semibold uppercase tracking-wide mb-1">{d.specialty}</p>
              <h3 className="font-semibold text-gray-900 mb-1">{d.name}</h3>
              <p className="text-gray-400 text-xs mb-3">{d.credentials}</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-3">{d.bio}</p>
              <div className="flex flex-wrap gap-1.5">
                {d.tags.map(t => (
                  <span key={t} className="text-xs bg-teal-50 text-teal-600 rounded-full px-2.5 py-1">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {doctors.length === 0 && (
          <div className="col-span-3 text-center py-20 text-gray-400">
            <i className="ri-user-add-line text-4xl block mb-3"></i>
            <p>Chưa có bác sĩ nào. Nhấn "Thêm bác sĩ" để bắt đầu.</p>
          </div>
        )}
      </div>

      {/* Side panel overlay */}
      {panel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{panel === 'new' ? 'Thêm bác sĩ mới' : 'Chỉnh sửa bác sĩ'}</h2>
              <button onClick={close} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bác sĩ</label>
                <div className="relative">
                  {preview ? (
                    <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-gray-50 group">
                      <img src={preview} alt="preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button type="button" onClick={() => fileRef.current?.click()}
                          className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-medium rounded-lg px-3 py-2 hover:bg-gray-50">
                          <i className="ri-upload-2-line"></i> Đổi ảnh
                        </button>
                        <button type="button" onClick={clearImage}
                          className="flex items-center gap-1.5 bg-white text-red-500 text-xs font-medium rounded-lg px-3 py-2 hover:bg-gray-50">
                          <i className="ri-delete-bin-line"></i> Xóa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-teal-300 hover:text-teal-500 transition-colors">
                      <i className="ri-image-add-line text-2xl"></i>
                      <span className="text-xs">Nhấn để tải ảnh lên</span>
                      <span className="text-[11px] text-gray-300">JPG, PNG, WebP · tối đa 5 MB · khuyến nghị 600×800px</span>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
                </div>
                <div className="mt-2">
                  <input type="url" placeholder="Hoặc dán URL ảnh từ bên ngoài..." value={form.imageUrl}
                    onChange={e => { set('imageUrl')(e); setPreview(e.target.value); setImageFile(null); }}
                    className={inputCls + ' text-xs'} />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                <input type="text" placeholder="TS. BS. Nguyễn Văn A" value={form.name} onChange={set('name')} className={inputCls} />
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chuyên khoa <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Siêu âm Tổng quát & Tim mạch" value={form.specialty} onChange={set('specialty')} className={inputCls} />
              </div>

              {/* Credentials */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Học hàm / Chức danh</label>
                <input type="text" placeholder="Tiến sĩ Y khoa, CKI Nội tiết..." value={form.credentials} onChange={set('credentials')} className={inputCls} />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiểu sử</label>
                <textarea rows={4} placeholder="Kinh nghiệm, thành tích, bệnh viện công tác..." value={form.bio} onChange={set('bio')}
                  className={inputCls + ' resize-none'} />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags chuyên môn</label>
                <input type="text" placeholder="Siêu âm 4D, Tim mạch, Ung bướu..." value={form.tags} onChange={set('tags')} className={inputCls} />
                <p className="text-gray-400 text-xs mt-1">Phân cách bằng dấu phẩy</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
            </div>

            {/* Panel footer */}
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
