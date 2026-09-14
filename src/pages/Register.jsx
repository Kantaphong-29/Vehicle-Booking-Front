import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../api/AuthContext.jsx';
import { DEPARTMENT_GROUPS } from '../constants.js';

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
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="โลโก้คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร" className="h-24 mx-auto mb-4" />
          <p className="font-display text-2xl text-white">ระบบบริการจองรถตู้ออนไลน์</p>
          <p className="text-sm text-white mt-2">คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-paper-100 rounded-xl shadow-card border border-ink-900/6 px-8 py-9 space-y-4">
          <h2 className="font-display text-lg text-ink-900">สมัครสมาชิก</h2>

          <Field label="ชื่อ-นามสกุล" value={form.name} onChange={set('name')} required />
          <Field label="อีเมล" type="email" value={form.email} onChange={set('email')} required placeholder="name@su.ac.th" />

          <div>
            <label className="block text-xs text-ink-500 mb-1.5">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} required value={form.password}
                onChange={set('password')}
                className="w-full px-4 py-3 pr-11 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-navy-800 text-xs font-medium"
              >
                {showPassword ? 'ซ่อน' : 'แสดง'}
              </button>
            </div>
          </div>

          <Field label="เบอร์โทรศัพท์" value={form.phone} onChange={set('phone')} />

          <div>
            <label className="block text-xs text-ink-500 mb-1.5">ภาควิชา / หน่วยงาน</label>
            <select
              value={form.department} onChange={set('department')} required
              className="w-full px-4 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
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

          {error && <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-navy-800 text-white rounded-md py-3 text-sm font-medium hover:bg-navy-900 transition-colors disabled:opacity-60"
          >
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </button>

          <p className="text-center text-sm text-ink-500">
            มีบัญชีอยู่แล้ว? <Link to="/login" className="text-navy-700 font-medium hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs text-ink-500 mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
      />
    </div>
  );
}
