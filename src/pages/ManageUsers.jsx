import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../api/AuthContext.jsx';
import { api } from '../api/client.js';

const ROLE_LABELS = { USER: 'อาจารย์ / บุคลากร', STAFF: 'ผู้ควบคุมหน่วยยานพาหนะ', ADMIN: 'ผู้ดูแลระบบ' };
const ROLE_OPTIONS = ['USER', 'STAFF', 'ADMIN'];

export default function ManageUsers() {
  const { user: currentUser, token } = useAuth();

  if (currentUser && currentUser.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  async function handleRoleChange(id, role) {
    setError('');
    setSavingId(id);
    try {
      await api.updateUserRole(token, id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id, name) {
    if (id === currentUser.id) {
      setError('ไม่สามารถลบบัญชีของตัวเองได้');
      return;
    }
    if (!confirm(`ต้องการลบบัญชีของ "${name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) return;

    setError('');
    try {
      await api.deleteUser(token, id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppLayout title="จัดการผู้ใช้งาน" subtitle="กำหนดสิทธิ์การเข้าถึงระบบและจัดการบัญชีผู้ใช้งาน">
      <div className="bg-paper-100 border border-ink-900/8 rounded-lg shadow-card p-7 max-w-4xl">
        {error && <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2 mb-5">{error}</p>}

        {loading ? (
          <p className="text-sm text-ink-500">กำลังโหลดข้อมูล...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-ink-500 text-center py-8">ไม่พบผู้ใช้งานในระบบ</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-paper-50 border border-ink-900/8 rounded-md">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">
                    {u.name} {u.id === currentUser.id && <span className="text-xs text-ink-500">(คุณ)</span>}
                  </p>
                  <p className="text-xs text-ink-500 mt-0.5 truncate">{u.email} {u.department ? `· ${u.department}` : ''}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={u.role}
                    disabled={savingId === u.id || u.id === currentUser.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="px-3 py-2 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none disabled:opacity-60"
                  >
                    {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                  <button
                    onClick={() => handleDelete(u.id, u.name)}
                    disabled={u.id === currentUser.id}
                    className="text-xs text-brick-600 font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}