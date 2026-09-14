import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';

const ROLE_LABELS = { USER: 'อาจารย์ / บุคลากร', STAFF: 'ผู้ควบคุมหน่วยยานพาหนะ', ADMIN: 'ผู้ดูแลระบบ' };

export default function Topbar({ title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const initial = user?.name?.charAt(0) || '?';

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-ink-900/10 bg-paper-50/80 backdrop-blur">
      <div>
        <h1 className="font-display text-2xl text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>

      {user && (
        <div className="relative" ref={menuRef}>
          <button onClick={() => setOpen(!open)} className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-ink-900">{user.name}</p>
              <p className="text-xs text-ink-500">{ROLE_LABELS[user.role] || user.role}</p>
            </div>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-ink-900/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-navy-800 text-white font-display flex items-center justify-center text-sm">
                {initial}
              </div>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-52 bg-paper-100 border border-ink-900/10 rounded-lg shadow-card py-1.5 z-20">
              <div className="px-4 py-2 border-b border-ink-900/8 sm:hidden">
                <p className="text-sm font-medium text-ink-900">{user.name}</p>
                <p className="text-xs text-ink-500">{ROLE_LABELS[user.role] || user.role}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-ink-600 hover:bg-navy-50 hover:text-navy-800"
              >
                โปรไฟล์ของฉัน
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-brick-600 hover:bg-brick-100"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}