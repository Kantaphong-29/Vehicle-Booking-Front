import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import BookingRow from '../components/BookingRow.jsx';
import { useAuth } from '../api/AuthContext.jsx';
import { api } from '../api/client.js';
import { STATUS_CONFIG } from '../constants.js';

export default function BookingList() {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  useEffect(() => {
    setLoading(true);
    api.getBookings(token, status || undefined).then(setBookings).finally(() => setLoading(false));
  }, [token, status]);

  function selectStatus(next) {
    setSearchParams(next ? { status: next } : {});
  }

  return (
    <AppLayout
      title={isStaff ? 'คำขอใช้รถทั้งหมด' : 'คำขอของฉัน'}
      subtitle="ติดตามสถานะและประวัติการจองรถตู้"
    >
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip active={status === ''} onClick={() => selectStatus('')}>ทั้งหมด</FilterChip>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <FilterChip key={key} active={status === key} onClick={() => selectStatus(key)}>
            {cfg.label}
          </FilterChip>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-500">กำลังโหลดข้อมูล...</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-ink-500 border border-dashed border-ink-900/15 rounded-lg px-6 py-10 text-center">
          ไม่พบคำขอในหมวดนี้
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} showRequester={isStaff} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-navy-800 text-paper-50 border-navy-800'
          : 'bg-paper-100 text-ink-600 border-ink-900/10 hover:border-navy-800/40'
      }`}
    >
      {children}
    </button>
  );
}