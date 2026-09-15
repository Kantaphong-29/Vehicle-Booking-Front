import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';

const ICONS = {
  home: 'M3 11.5 12 4l9 7.5M5 10v9.5h5V15h4v4.5h5V10',
  plus: 'M12 5v14M5 12h14',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  approve: 'M9 12.5 11.5 15 16 9M12 21c4.97-1 8-5 8-10V5l-8-3-8 3v6c0 5 3.03 9 8 10Z',
  fleet: 'M3 17h1l1-5 1.5-1h9L17 12l1 5h1M6 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM18 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M11 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM21 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  collapse: 'M15 6 9 12l6 6',
  expand: 'M9 6l6 6-6 6',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  dashboard: 'M3 13h8V3H3v10ZM13 21h8V11h-8v10ZM13 3v6h8V3h-8ZM3 21h8v-6H3v6Z',
};

function Icon({ path, className = 'w-5 h-5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('vb_sidebar_collapsed') === '1');
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  function toggleCollapsed() {
    setCollapsed((prev) => {
      localStorage.setItem('vb_sidebar_collapsed', !prev ? '1' : '0');
      return !prev;
    });
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-md text-sm font-medium transition-colors ${
      collapsed ? 'md:justify-center md:px-0 md:py-2.5 px-4 py-2.5' : 'px-4 py-2.5'
    } ${
      isActive
        ? 'bg-navy-100 text-navy-800 border-l-[3px] border-navy-700 -ml-[3px] pl-[19px]'
        : 'text-ink-600 hover:bg-navy-50 hover:text-navy-800 border-l-[3px] border-transparent -ml-[3px] pl-[19px]'
    } ${collapsed ? 'md:!pl-0 md:!ml-0 md:!border-0' : ''}`;

  const navItems = [
    { to: '/', end: true, icon: ICONS.home, label: 'ภาพรวม', show: true },
    { to: '/new', icon: ICONS.plus, label: 'ยื่นคำขอใช้รถ', show: !isStaff },
    { to: '/bookings', icon: ICONS.list, label: isStaff ? 'คำขอทั้งหมด' : 'คำขอของฉัน', show: true },
    { to: '/approvals', icon: ICONS.approve, label: 'รออนุมัติ', show: isStaff },
    { to: '/manage-fleet', icon: ICONS.fleet, label: 'จัดการรถ/คนขับ', show: isStaff },
    { to: '/manage-users', icon: ICONS.users, label: 'จัดการผู้ใช้งาน', show: isAdmin },
    { to: '/availability', icon: ICONS.calendar, label: 'ตารางรถว่าง', show: true },
    { to: '/admin-dashboard', icon: ICONS.dashboard, label: 'Admin Dashboard', show: isAdmin },
  ];

  return (
    <>
      {/* ฉากหลังมืดตอนเปิดเมนูบนมือถือ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        bg-navy-100 border-r border-ink-900/8 flex flex-col min-h-screen transition-all duration-200
        fixed inset-y-0 left-0 z-50 w-60
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0 md:shrink-0
        ${collapsed ? 'md:w-16' : 'md:w-60'}
      `}>
        <div className={`py-5 border-b border-ink-900/8 flex items-center px-5 justify-between ${collapsed ? 'md:px-2 md:justify-center' : ''}`}>
          <div className={`min-w-0 ${collapsed ? 'md:hidden' : ''}`}>
            <p className="font-display text-base leading-tight text-navy-800 truncate">ระบบจองรถตู้</p>
            <p className="text-xs text-ink-500 mt-1 leading-relaxed">
              คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร
            </p>
          </div>
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
            className="shrink-0 w-7 h-7 hidden md:flex items-center justify-center rounded-md text-ink-500 hover:bg-navy-50 hover:text-navy-800 transition-colors"
          >
            <Icon path={collapsed ? ICONS.expand : ICONS.collapse} className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex md:hidden items-center justify-center rounded-md text-ink-500 hover:bg-navy-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="w-4 h-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4 px-4 md:px-2 space-y-1" onClick={onClose}>
          {navItems.filter((item) => item.show).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} title={collapsed ? item.label : undefined}>
              <Icon path={item.icon} />
              <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}