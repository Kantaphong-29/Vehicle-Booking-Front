import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../api/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(form);
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

        <form onSubmit={handleSubmit} className="bg-paper-100 rounded-xl shadow-card border border-ink-900/6 px-8 py-9 space-y-5">
          <h2 className="font-display text-lg text-ink-900">เข้าสู่ระบบ</h2>

          <div>
            <label className="block text-xs text-ink-500 mb-1.5">อีเมล</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
              placeholder="name@su.ac.th"
            />
          </div>

          <div>
            <label className="block text-xs text-ink-500 mb-1.5">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 pr-11 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
                placeholder="••••••••"
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

          {error && <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-navy-800 text-white rounded-md py-3 text-sm font-medium hover:bg-navy-900 transition-colors disabled:opacity-60"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>

          <p className="text-center text-sm text-ink-500">
            ยังไม่มีบัญชี? <Link to="/register" className="text-navy-700 font-medium hover:underline">สมัครสมาชิก</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
