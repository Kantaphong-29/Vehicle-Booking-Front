import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../api/AuthContext.jsx';
import { DEPARTMENT_GROUPS } from '../constants.js';

function RulePattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.07]" preserveAspectRatio="none">
      <defs>
        <pattern id="rule-lines-register" width="100%" height="40" patternUnits="userSpaceOnUse">
          <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke="white" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rule-lines-register)" />
    </svg>
  );
}

function FieldIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 text-ink-400">
      <path d={path} />
    </svg>
  );
}

const ICON_USER = 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0';
const ICON_MAIL = 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1ZM3.5 7l8.5 6 8.5-6';
const ICON_LOCK = 'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z';
const ICON_PHONE = 'M7 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A17 17 0 0 1 5.5 5.1 1.5 1.5 0 0 1 7 3.5Z';
const ICON_BUILDING = 'M4 21V6l8-3 8 3v15M4 21h16M9 21v-4h6v4M9 10h.01M9 14h.01M15 10h.01M15 14h.01';

function BrandPanel() {
  return (
    <div className="relative hidden md:flex md:w-[40%] bg-navy-900 flex-col justify-between overflow-hidden px-12 py-14">
      <div className="relative">
        <p className="text-xs text-white/50 tracking-wide">ระบบสารบรรณอิเล็กทรอนิกส์</p>
      </div>

      <div className="relative">
        <div className="mb-7">
          <img src="/logo.png" alt="โลโก้คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร" className="h-14 w-auto" />
        </div>
        <p className="font-display text-3xl text-white leading-snug">
          ระบบบริการ<br />จองรถตู้ออนไลน์
        </p>
        <p className="text-sm text-white/60 mt-3 max-w-[24ch] leading-relaxed">
          คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร
        </p>
      </div>

      <div className="relative">
        <div className="h-px bg-white/15 mb-4" />
        <p className="text-xs text-white/40 leading-relaxed">
          กรอกข้อมูลให้ครบถ้วนเพื่อใช้ยื่นคำขอใช้รถตู้ในนามหน่วยงานของท่าน
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function set(key) {
    return (e) => setForm({ ...form, [key]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.register(form);
      const data = await api.login({ email: form.email, password: form.password });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-navy-900 md:bg-paper-50">
      <BrandPanel />

      <div className="flex-1 flex items-center justify-center px-4 py-10 md:px-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 md:hidden flex flex-col items-center">
            <img src="/logo.png" alt="โลโก้คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร" className="h-12 w-auto" />
            <p className="font-display text-xl text-white mt-4">ระบบบริการจองรถตู้ออนไลน์</p>
            <p className="text-sm text-white/70 mt-1.5">คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-paper-100 md:bg-transparent rounded-xl md:rounded-none shadow-card md:shadow-none border border-ink-900/6 md:border-0 px-8 py-9 md:px-0 md:py-0 space-y-4"
          >
            <div className="mb-2">
              <h2 className="font-display text-2xl text-ink-900">สมัครสมาชิก</h2>
              <p className="text-sm text-ink-500 mt-1">กรอกข้อมูลของท่านให้ครบถ้วนเพื่อสร้างบัญชีใหม่</p>
            </div>

            <Field label="ชื่อ-นามสกุล" icon={ICON_USER} value={form.name} onChange={set('name')} required />
            <Field label="อีเมล" icon={ICON_MAIL} type="email" value={form.email} onChange={set('email')} required placeholder="name@su.ac.th" />

            <div>
              <label className="block text-xs text-ink-500 mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <FieldIcon path={ICON_LOCK} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'} required value={form.password}
                  onChange={set('password')}
                  className="w-full pl-10 pr-14 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-navy-800 text-xs font-medium"
                >
                  {showPassword ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </div>

            <Field label="เบอร์โทรศัพท์" icon={ICON_PHONE} value={form.phone} onChange={set('phone')} />

            <div>
              <label className="block text-xs text-ink-500 mb-1.5">ภาควิชา / หน่วยงาน</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <FieldIcon path={ICON_BUILDING} />
                </span>
                <select
                  value={form.department} onChange={set('department')} required
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none appearance-none transition-colors"
                >
                  <option value="" disabled>เลือกภาควิชา / หน่วยงาน</option>
                  {DEPARTMENT_GROUPS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2.5 flex items-start gap-2">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-navy-800 text-white rounded-md py-3 text-sm font-medium hover:bg-navy-900 active:bg-navy-950 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Spinner />}
              {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>

            <p className="text-center text-sm text-ink-500">
              มีบัญชีอยู่แล้ว? <Link to="/login" className="text-navy-700 font-medium hover:underline">เข้าสู่ระบบ</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, ...props }) {
  return (
    <div>
      <label className="block text-xs text-ink-500 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
          <FieldIcon path={icon} />
        </span>
        <input
          {...props}
          className="w-full pl-10 pr-4 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none transition-colors"
        />
      </div>
    </div>
  );
}