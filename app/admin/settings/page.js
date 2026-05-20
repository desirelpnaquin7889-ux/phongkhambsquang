'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import AdminShell from '../_components/AdminShell';

// ── Validation rules per field key ──────────────────────────────────────────
const VALIDATORS = {
  contact_email:      v => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Email không hợp lệ' : '',
  contact_phone:      v => v && !/^[0-9\s\+\-\.]{8,15}$/.test(v) ? 'Số điện thoại không hợp lệ' : '',
  contact_maps_link:  v => v && !/^https?:\/\/.+/.test(v) ? 'Phải bắt đầu bằng https://' : '',
  contact_maps_embed: v => v && !/^https?:\/\/.+/.test(v) ? 'Phải bắt đầu bằng https://' : '',
};

function validate(values) {
  const errors = {};
  for (const [key, fn] of Object.entries(VALIDATORS)) {
    const msg = fn(values[key] || '');
    if (msg) errors[key] = msg;
  }
  return errors;
}

// ── Field sections config ────────────────────────────────────────────────────
const SECTIONS = [
  {
    title: 'Thông tin chung', icon: 'ri-global-line',
    fields: [
      { key: 'site_name',    label: 'Tên phòng khám',         placeholder: 'An Bình',                             type: 'text' },
      { key: 'site_tagline', label: 'Chuyên khoa / Tagline', placeholder: 'Phòng Khám Siêu Âm & Ung Bướu',     type: 'text' },
      { key: 'home_title',   label: 'Tiêu đề trang chủ',    placeholder: 'Chẩn đoán chính xác, Tầm soát sớm...', type: 'text' },
      { key: 'home_subtitle', label: 'Mô tả trang chủ',   placeholder: 'Đội ngũ bác sĩ chuyên khoa...',           type: 'textarea' },
    ],
  },
  {
    title: 'Thông tin liên hệ', icon: 'ri-contacts-line',
    fields: [
      { key: 'contact_address', label: 'Địa chỉ',        placeholder: '123 Nguyễn Văn Linh, Q.7, TP.HCM', type: 'text' },
      { key: 'contact_phone',   label: 'Số điện thoại',  placeholder: '028 1234 5678',                    type: 'text' },
      { key: 'contact_email',   label: 'Email',           placeholder: 'info@phongkham.vn',               type: 'email' },
    ],
  },
  {
    title: 'Giờ làm việc', icon: 'ri-time-line',
    fields: [
      { key: 'contact_hours_weekday', label: 'Thứ 2 – Thứ 7',       placeholder: 'Thứ 2 – Thứ 7: 7:00 – 17:00', type: 'text' },
      { key: 'contact_hours_sunday',  label: 'Chủ nhật',             placeholder: 'Chủ nhật: 7:00 – 12:00',      type: 'text' },
      { key: 'contact_open_time',     label: 'Giờ mở cửa',           placeholder: '07:00',                        type: 'time' },
      { key: 'contact_close_time',    label: 'Giờ đóng cửa',         placeholder: '17:00',                        type: 'time' },
    ],
  },
  {
    title: 'Google Maps', icon: 'ri-map-pin-2-line',
    fields: [
      { key: 'contact_maps_link',  label: 'Link chỉ đường',   placeholder: 'https://maps.google.com/?q=...', type: 'url' },
      {
        key: 'contact_maps_embed', label: 'Embed URL (src của iframe)', placeholder: 'https://www.google.com/maps/embed?pb=...', type: 'url',
        hint: 'Google Maps → Chia sẻ → Nhúng bản đồ → copy nội dung src="…" bên trong thẻ <iframe>',
      },
    ],
  },
];

// ── Password card (unchanged from step 3) ───────────────────────────────────
function PasswordCard() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [state, setState] = useState('idle');
  const [msg, setMsg]     = useState('');
  const [strength, setStrength] = useState(0);

  function score(p) {
    return [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
  }

  function set(field) {
    return e => {
      const val = e.target.value;
      setForm(f => ({ ...f, [field]: val }));
      if (field === 'newPassword') setStrength(val ? score(val) : 0);
      setState('idle');
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { setState('error'); setMsg('Mật khẩu xác nhận không khớp'); return; }
    if (form.newPassword.length < 8)               { setState('error'); setMsg('Mật khẩu mới phải có ít nhất 8 ký tự'); return; }
    setState('loading');
    try {
      const r = await fetch('/api/admin/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setState('success'); setMsg('Đổi mật khẩu thành công!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setStrength(0);
    } catch (err) { setState('error'); setMsg(err.message); }
  }

  const cls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-white';
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-teal-400', 'bg-green-500'];
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-teal-600" style={{ background: '#F0FDFA' }}>
          <i className="ri-lock-password-line text-sm"></i>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">Đổi mật khẩu</h2>
          <p className="text-gray-400 text-xs mt-0.5">Khuyến nghị ít nhất 8 ký tự, kết hợp chữ hoa, số, ký tự đặc biệt</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
          <input type="password" required autoComplete="current-password" placeholder="••••••••" value={form.currentPassword} onChange={set('currentPassword')} className={cls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
          <input type="password" required autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" value={form.newPassword} onChange={set('newPassword')} className={cls} />
          {form.newPassword && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">{[1,2,3,4].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? strengthColor[strength] : 'bg-gray-100'}`} />)}</div>
              <p className={`text-xs font-medium ${strength >= 3 ? 'text-green-600' : strength === 2 ? 'text-yellow-600' : 'text-red-500'}`}>{strengthLabel[strength]}</p>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
          <input type="password" required autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" value={form.confirmPassword} onChange={set('confirmPassword')}
            className={cls + (form.confirmPassword && form.confirmPassword !== form.newPassword ? ' border-red-300! focus:border-red-400!' : '')} />
          {form.confirmPassword && form.confirmPassword !== form.newPassword && <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>}
        </div>
        {state === 'success' && <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl px-4 py-3"><i className="ri-check-line"></i> {msg}</div>}
        {state === 'error'   && <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3"><i className="ri-error-warning-line"></i> {msg}</div>}
        <button type="submit" disabled={state === 'loading'}
          className="flex items-center gap-2 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60"
          style={{ background: state === 'loading' ? '#9CA3AF' : '#0D9488' }}>
          {state === 'loading' ? <><i className="ri-loader-4-line animate-spin"></i> Đang xử lý...</> : <><i className="ri-lock-line"></i> Đổi mật khẩu</>}
        </button>
      </form>
    </div>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [original, setOriginal]     = useState({});
  const [values, setValues]         = useState({});
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | success | error
  const [isDirty, setIsDirty]       = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const topSaveRef  = useRef(null);
  const heroFileRef = useRef(null);
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-white';

  // Load settings
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setOriginal(data); setValues(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Warn on browser close/refresh when dirty
  useEffect(() => {
    if (!isDirty) return;
    const handler = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Show floating button only when top save button scrolled out of view
  useEffect(() => {
    if (!topSaveRef.current) return;
    const obs = new IntersectionObserver(([entry]) => setShowFloating(!entry.isIntersecting), { threshold: 0 });
    obs.observe(topSaveRef.current);
    return () => obs.disconnect();
  }, [loading]);

  function handleChange(key, val) {
    setValues(v => ({ ...v, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
    setIsDirty(true);
    setSaveStatus('idle');
  }

  async function handleHeroUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setHeroUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Upload thất bại');
      handleChange('hero_image', d.url);
    } catch (err) {
      alert(err.message);
    } finally {
      setHeroUploading(false);
      if (heroFileRef.current) heroFileRef.current.value = '';
    }
  }

  function handleDiscard() {
    setValues(original);
    setErrors({});
    setIsDirty(false);
    setSaveStatus('idle');
  }

  const handleSave = useCallback(async () => {
    const errs = validate(values);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true); setSaveStatus('idle');
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!r.ok) throw new Error('Lưu thất bại');
      setOriginal(values);
      setIsDirty(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }, [values]);

  if (loading) {
    return (
      <AdminShell active="settings">
        <div className="flex items-center justify-center h-64 text-gray-400">
          <i className="ri-loader-4-line animate-spin text-2xl mr-2"></i> Đang tải...
        </div>
      </AdminShell>
    );
  }

  const saveBtn = (rounded = 'rounded-xl', size = 'px-5 py-2.5') => (
    <button onClick={handleSave} disabled={saving}
      className={`flex items-center gap-2 text-white text-sm font-semibold ${rounded} ${size} transition-colors disabled:opacity-60`}
      style={{ background: saving ? '#9CA3AF' : saveStatus === 'success' ? '#059669' : '#0D9488' }}>
      {saving         ? <><i className="ri-loader-4-line animate-spin"></i> Đang lưu...</>
       : saveStatus === 'success' ? <><i className="ri-check-line"></i> Đã lưu!</>
       : <><i className="ri-save-line"></i> Lưu thay đổi</>}
    </button>
  );

  return (
    <AdminShell active="settings">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt website</h1>
          <p className="text-gray-500 text-sm mt-1">Thông tin hiển thị trên trang chủ</p>
        </div>
        <div ref={topSaveRef} className="flex items-center gap-3">
          {isDirty && (
            <button onClick={handleDiscard}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors">
              Bỏ thay đổi
            </button>
          )}
          {saveBtn()}
        </div>
      </div>

      {/* Unsaved changes banner */}
      {isDirty && (
        <div className="mb-5 flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <i className="ri-error-warning-line text-amber-500"></i>
            <span>Bạn có thay đổi chưa được lưu.</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleDiscard} className="text-xs font-medium text-amber-700 hover:text-amber-900 underline">Bỏ qua</button>
            <button onClick={handleSave} disabled={saving} className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-3 py-1 transition-colors">
              Lưu ngay
            </button>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
          <i className="ri-error-warning-line"></i> Lưu thất bại, vui lòng thử lại.
        </div>
      )}

      <div className="space-y-6">
        {SECTIONS.map(section => (
          <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-teal-600" style={{ background: '#F0FDFA' }}>
                <i className={`${section.icon} text-sm`}></i>
              </div>
              <h2 className="font-semibold text-gray-900 text-sm">{section.title}</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              {section.fields.map(field => {
                const hasErr = !!errors[field.key];
                const fieldCls = inputCls + (hasErr ? ' !border-red-300 focus:!border-red-400 focus:!ring-red-100' : '');
                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea rows={3} placeholder={field.placeholder}
                        value={values[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)}
                        className={fieldCls + ' resize-none'} />
                    ) : (
                      <input type={field.type} placeholder={field.placeholder}
                        value={values[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)}
                        className={fieldCls} />
                    )}
                    {hasErr && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors[field.key]}</p>}
                    {field.hint && !hasErr && <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">{field.hint}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Hero Image Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-teal-600" style={{ background: '#F0FDFA' }}>
              <i className="ri-image-line text-sm"></i>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Ảnh nền Hero</h2>
              <p className="text-gray-400 text-xs mt-0.5">Ảnh hiển thị toàn màn hình ở phần đầu trang</p>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            {/* Preview */}
            <div className="relative h-44 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={values.hero_image || 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&q=80'}
                alt="Hero preview"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 flex items-end p-3" style={{ background: 'linear-gradient(to top,rgba(0,0,0,.5),transparent)' }}>
                <span className="text-white/70 text-xs">Xem trước</span>
              </div>
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tải ảnh lên</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => heroFileRef.current?.click()} disabled={heroUploading}
                  className="flex items-center gap-2 text-sm font-medium border border-gray-200 rounded-xl px-4 py-2.5 text-gray-600 hover:border-teal-300 hover:text-teal-600 transition-colors disabled:opacity-50">
                  {heroUploading
                    ? <><i className="ri-loader-4-line animate-spin"></i> Đang tải...</>
                    : <><i className="ri-upload-2-line"></i> Chọn ảnh</>}
                </button>
                {values.hero_image && (
                  <button type="button" onClick={() => handleChange('hero_image', '')}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 border border-red-100 hover:border-red-200 rounded-xl px-3 py-2.5 transition-colors">
                    <i className="ri-delete-bin-line"></i> Xóa
                  </button>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-1.5">JPG, PNG, WebP · tối đa 5 MB · khuyến nghị 1920×1080px</p>
              <input ref={heroFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleHeroUpload} />
            </div>

            {/* URL input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hoặc dán URL ảnh</label>
              <input type="url" placeholder="https://example.com/hero.jpg"
                value={values.hero_image || ''}
                onChange={e => handleChange('hero_image', e.target.value)}
                className={inputCls} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 border-t border-gray-100"></div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Bảo mật tài khoản</span>
          <div className="flex-1 border-t border-gray-100"></div>
        </div>

        <PasswordCard />
      </div>

      {/* Floating save button — only when top button scrolled out AND there are unsaved changes */}
      {showFloating && isDirty && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 shadow-xl rounded-full">
          <button onClick={handleDiscard}
            className="text-sm text-gray-600 font-medium bg-white border border-gray-200 rounded-full px-4 py-2.5 shadow hover:bg-gray-50 transition-colors">
            Bỏ qua
          </button>
          {saveBtn('rounded-full', 'px-6 py-2.5')}
        </div>
      )}
    </AdminShell>
  );
}
