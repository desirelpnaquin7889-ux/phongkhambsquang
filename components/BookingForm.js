'use client';
import { useState } from 'react';

export default function BookingForm({ services = [] }) {
  const [form, setForm] = useState({
    patientName: '', phone: '', service: '', date: '', timeSlot: 'Sáng (7:00 – 12:00)', notes: '',
  });
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setState('success');
        setMessage('Đặt lịch thành công! Chúng tôi sẽ gọi xác nhận trong 30 phút.');
        setForm({ patientName: '', phone: '', service: '', date: '', timeSlot: 'Sáng (7:00 – 12:00)', notes: '' });
      } else {
        setState('error');
        setMessage(data.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch {
      setState('error');
      setMessage('Không thể kết nối, vui lòng thử lại.');
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {state === 'success' && (
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-green-700 text-sm flex items-start gap-2">
          <span>✓</span> {message}
        </div>
      )}
      {state === 'error' && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
          <input type="text" required placeholder="Nguyễn Văn A" value={form.patientName} onChange={set('patientName')} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
          <input type="tel" required placeholder="0901 234 567" value={form.phone} onChange={set('phone')} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Dịch vụ cần khám</label>
        <select value={form.service} onChange={set('service')} className={inputCls + ' bg-white text-gray-700'}>
          <option value="">— Chọn dịch vụ —</option>
          {services.length > 0 ? (
            services.map(s => {
              const nameStr = typeof s === 'string' ? s : s.name;
              return (
                <option key={nameStr} value={nameStr}>
                  {nameStr}
                </option>
              );
            })
          ) : (
            <>
              <option>Siêu âm tổng quát</option>
              <option>Siêu âm thai sản</option>
              <option>Tầm soát ung thư</option>
              <option>Siêu âm tim mạch</option>
              <option>Xét nghiệm sinh hóa</option>
              <option>Tư vấn chuyên khoa</option>
            </>
          )}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày khám</label>
          <input type="date" value={form.date} onChange={set('date')} className={inputCls + ' text-gray-700'} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Buổi khám</label>
          <select value={form.timeSlot} onChange={set('timeSlot')} className={inputCls + ' bg-white text-gray-700'}>
            <option>Sáng (7:00 – 12:00)</option>
            <option>Chiều (13:00 – 17:00)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
        <textarea rows="3" placeholder="Triệu chứng hoặc yêu cầu đặc biệt..." value={form.notes} onChange={set('notes')}
          className={inputCls + ' resize-none'} />
      </div>

      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full text-white font-semibold rounded-full py-3.5 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: state === 'loading' ? '#9CA3AF' : '#0D9488' }}
      >
        {state === 'loading' ? <><i className="ri-loader-4-line animate-spin"></i> Đang gửi...</> : <><i className="ri-calendar-check-line"></i> Đặt lịch ngay</>}
      </button>
      <p className="text-center text-gray-400 text-xs">Chúng tôi sẽ gọi xác nhận trong vòng 30 phút</p>
    </form>
  );
}
