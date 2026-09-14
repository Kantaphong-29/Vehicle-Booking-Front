import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import StatCard from '../components/StatCard.jsx';
import BookingRow from '../components/BookingRow.jsx';
import { useAuth } from '../api/AuthContext.jsx';
import { api } from '../api/client.js';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  useEffect(() => {
    api.getBookings(token).then(setBookings).finally(() => setLoading(false));
  }, [token]);

  const counts = {
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    approved: bookings.filter((b) => b.status === 'APPROVED').length,
    total: bookings.length
  };

  return (
    <AppLayout
      title={`สวัสดี, ${user?.name || ''}`}
      subtitle={isStaff ? 'ภาพรวมคำขอใช้รถทั้งหมดในระบบ' : 'ภาพรวมคำขอใช้รถของคุณ'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="คำขอทั้งหมด" value={counts.total} accent="navy" to="/bookings" />
        <StatCard label="รออนุมัติ" value={counts.pending} accent="amber" to="/bookings?status=PENDING" />
        <StatCard label="อนุมัติแล้ว" value={counts.approved} accent="sage" to="/bookings?status=APPROVED" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-ink-900">
          {isStaff ? 'คำขอล่าสุด' : 'คำขอของฉันล่าสุด'}
        </h2>
        {!isStaff && (
          <Link to="/new" className="text-sm text-navy-800 font-medium hover:underline">
            + ยื่นคำขอใหม่
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-ink-500">กำลังโหลดข้อมูล...</p>
      ) : bookings.length === 0 ? (
        <EmptyState isStaff={isStaff} />
      ) : (
        <div className="space-y-3">
          {bookings.slice(0, 5).map((b) => (
            <BookingRow key={b.id} booking={b} showRequester={isStaff} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function EmptyState({ isStaff }) {
  return (
    <div className="border border-dashed border-ink-900/15 rounded-lg px-6 py-10 text-center">
      <p className="text-ink-900 font-medium mb-1">ยังไม่มีคำขอใช้รถ</p>
      <p className="text-sm text-ink-500 mb-4">
        {isStaff ? 'เมื่อมีผู้ยื่นคำขอ รายการจะปรากฏที่นี่' : 'เริ่มยื่นคำขอใช้รถตู้สำหรับภารกิจของคุณได้เลย'}
      </p>
      {!isStaff && (
        <Link to="/new" className="inline-block bg-navy-800 text-paper-50 rounded-md px-4 py-2 text-sm font-medium hover:bg-navy-700">
          ยื่นคำขอใช้รถ
        </Link>
      )}
    </div>
  );
}
