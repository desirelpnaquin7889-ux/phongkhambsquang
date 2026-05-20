'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const nav = [
  { href: '/admin/dashboard',    label: 'Tổng quan',    icon: '▤' },
  { href: '/admin/appointments', label: 'Lịch hẹn',    icon: '📅' },
  { href: '/admin/services',     label: 'Dịch vụ',     icon: '⚕' },
  { href: '/admin/doctors',      label: 'Bác sĩ',      icon: '👨‍⚕️' },
  { href: '/admin/contacts',     label: 'Liên hệ',     icon: '✉️' },
  { href: '/admin/settings',     label: 'Cài đặt',     icon: '⚙️' },
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: '#0D9488' }}>
              {siteName ? siteName[0].toUpperCase() : 'A'}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight">{siteName || 'An Bình'}</div>
              <div className="text-gray-400 text-[10px] uppercase tracking-wide">{siteTagline || 'Admin Panel'}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === item.href.split('/')[2]
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 mb-1">
            <span>🌐</span> Xem website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <span>→</span> Đăng xuất
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
