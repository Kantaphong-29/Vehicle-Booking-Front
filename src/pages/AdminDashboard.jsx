import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../api/AuthContext.jsx';
import { api } from '../api/client.js';

export default function AdminDashboard() {
  const { user, token } = useAuth();

  if (user && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAdminStats(token)
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AppLayout title="Admin Dashboard" subtitle="ภาพรวมสถิติการใช้งานระบบทั้งหมด">
      {error && <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-500">กำลังโหลดข้อมูล...</p>
      ) : stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="จำนวนคำขอวันนี้" value={stats.todayRequests} accent="navy" to="/bookings" />
            <StatCard label="รถตู้ที่พร้อมใช้งาน" value={stats.availableVehicles} accent="sage" to="/manage-fleet" />
            <StatCard label="คำขอรออนุมัติ" value={stats.pendingApprovals} accent="amber" to="/approvals" />
          </div>

          <div className="bg-paper-100 border border-ink-900/8 rounded-lg shadow-card p-7">
            <h2 className="font-display text-lg text-ink-900 mb-1">กราฟสรุปสถิติการใช้รถตู้รายเดือน</h2>
            <p className="text-xs text-ink-500 mb-6">นับจากคำขอที่ได้รับการอนุมัติแล้ว ย้อนหลัง 6 เดือน</p>

            <MonthlyBarChart data={stats.monthlyUsage} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/manage-users" className="text-sm text-navy-800 font-medium hover:underline">
              จัดการผู้ใช้งาน →
            </Link>
            <span className="text-ink-300">|</span>
            <Link to="/manage-fleet" className="text-sm text-navy-800 font-medium hover:underline">
              จัดการรถ/คนขับ →
            </Link>
          </div>
        </>
      )}
    </AppLayout>
  );
}

// กราฟแท่งอย่างง่ายด้วย Tailwind ล้วน ๆ ไม่ต้องพึ่ง library เพิ่ม
function MonthlyBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1); // กันหาร 0

  return (
    <div className="flex items-end justify-between gap-3 h-48 px-2">
      {data.map((d, i) => {
        const heightPercent = (d.count / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-xs text-ink-600 font-medium mb-1.5">{d.count}</span>
            <div className="w-full max-w-[40px] flex items-end justify-center" style={{ height: '160px' }}>
              <div
                className="w-full bg-navy-700 rounded-t-sm transition-all"
                style={{ height: `${Math.max(heightPercent, 3)}%` }}
                title={`${d.month}: ${d.count} คำขอ`}
              />
            </div>
            <span className="text-xs text-ink-500 mt-2">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}