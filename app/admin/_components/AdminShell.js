'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const nav = [
  { href: '/admin/dashboard',    label: 'Tổng quan',    icon: 'ri-dashboard-line' },
  { href: '/admin/appointments', label: 'Lịch hẹn',    icon: 'ri-calendar-check-line' },
  { href: '/admin/services',     label: 'Dịch vụ',     icon: 'ri-heart-pulse-line' },
  { href: '/admin/doctors',      label: 'Bác sĩ',      icon: 'ri-user-heart-line' },
  { href: '/admin/contacts',     label: 'Liên hệ',     icon: 'ri-mail-line' },
  { href: '/admin/settings',     label: 'Cài đặt',     icon: 'ri-settings-3-line' },
];

export default function AdminShell({ children, active }) {
  const router = useRouter();
  const [siteName, setSiteName] = useState('');
  const [siteTagline, setSiteTagline] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.site_name) setSiteName(d.site_name);
        if (d.site_tagline) setSiteTagline(d.site_tagline);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin');
  }

  const letter = siteName ? siteName[0].toUpperCase() : 'A';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: '#0D9488' }}>
              {letter}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-gray-900 text-sm leading-tight truncate">{siteName || 'Admin'}</div>
              <div className="text-gray-400 text-[10px] uppercase tracking-wide truncate">{siteTagline || 'Admin Panel'}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(item => {
            const segment = item.href.split('/')[2];
            const isActive = active === segment;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <i className={`${item.icon} text-base ${isActive ? 'text-teal-600' : 'text-gray-400'}`}></i>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 space-y-1">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <i className="ri-external-link-line text-base text-gray-400"></i> Xem website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <i className="ri-logout-box-r-line text-base"></i> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
