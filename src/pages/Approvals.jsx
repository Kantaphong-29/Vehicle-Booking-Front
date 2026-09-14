import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import BookingRow from '../components/BookingRow.jsx';
import { useAuth } from '../api/AuthContext.jsx';
import { api } from '../api/client.js';

export default function Approvals() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBookings(token, 'PENDING').then(setBookings).finally(() => setLoading(false));
  }, [token]);

  return (
    <AppLayout title="คำขอที่รออนุมัติ" subtitle="ตรวจสอบ มอบหมายรถและคนขับ แล้วอนุมัติหรือปฏิเสธคำขอ">
      {loading ? (
        <p className="text-sm text-ink-500">กำลังโหลดข้อมูล...</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-ink-500 border border-dashed border-ink-900/15 rounded-lg px-6 py-10 text-center">
          ไม่มีคำขอที่รออนุมัติในขณะนี้
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} showRequester />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
