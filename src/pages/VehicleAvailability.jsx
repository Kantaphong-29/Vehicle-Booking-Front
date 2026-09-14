import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../api/AuthContext.jsx';
import { api } from '../api/client.js';

const DAY_LABELS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']; // เริ่มจันทร์ ตามปฏิทินไทย
const MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// หาวันจันทร์ของสัปดาห์ที่มีวันที่ d อยู่
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0=อาทิตย์ ... 6=เสาร์
  const diff = day === 0 ? -6 : 1 - day; // ถ้าเป็นอาทิตย์ ให้ถอยไป 6 วัน
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function VehicleAvailability() {
  const { token } = useAuth();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const weekEnd = weekDays[6];
  const today = new Date();

  useEffect(() => {
    setLoading(true);
    setError('');
    api.getVehicleCalendar(token, toISODate(weekStart), toISODate(weekEnd))
      .then((data) => {
        setVehicles(data.vehicles);
        setBookings(data.bookings);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, weekStart]);

  function goPrevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }
  function goNextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }
  function goThisWeek() {
    setWeekStart(getMonday(new Date()));
  }

  function isBooked(vehicleId, day) {
    const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
    return bookings.some((b) => {
      if (b.vehicleId !== vehicleId) return false;
      const bStart = new Date(b.startDateTime);
      const bEnd = new Date(b.endDateTime);
      return bStart <= dayEnd && bEnd >= dayStart;
    });
  }

  // หัวข้อช่วงวันที่แสดงด้านบน เช่น "8 - 14 กันยายน 2569" หรือ "29 ส.ค. - 4 ก.ย. 2569" ถ้าข้ามเดือน
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const headerLabel = sameMonth
    ? `${weekStart.getDate()} - ${weekEnd.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear() + 543}`
    : `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear() + 543}`;

  return (
    <AppLayout title="ตารางสถานะรถตู้ว่าง" subtitle="ตรวจสอบว่ารถคันไหนว่างวันไหนก่อนยื่นคำขอ">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={goPrevWeek}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-ink-900/15 text-ink-600 hover:bg-navy-50"
          >
            ‹
          </button>
          <p className="font-display text-lg text-ink-900 min-w-[14rem] text-center">{headerLabel}</p>
          <button
            onClick={goNextWeek}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-ink-900/15 text-ink-600 hover:bg-navy-50"
          >
            ›
          </button>
          <button
            onClick={goThisWeek}
            className="text-xs text-navy-800 font-medium hover:underline ml-1"
          >
            สัปดาห์นี้
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-ink-600">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-sage-100 border border-sage-600 inline-block" /> ว่าง</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brick-100 border border-brick-600 inline-block" /> ไม่ว่าง</span>
        </div>
      </div>

      {error && <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink-500">กำลังโหลดข้อมูล...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-sm text-ink-500 border border-dashed border-ink-900/15 rounded-lg px-6 py-10 text-center">
          ยังไม่มีรถตู้ในระบบ
        </p>
      ) : (
        <div className="overflow-x-auto bg-paper-100 border border-ink-900/8 rounded-lg shadow-card">
          <table className="border-collapse w-full text-sm">
            <thead>
              <tr>
                <th className="border-b border-r border-ink-900/10 px-3 py-3 text-left text-ink-600 font-medium w-32">
                  รถตู้
                </th>
                {weekDays.map((d, i) => {
                  const isToday = isSameDay(d, today);
                  return (
                    <th key={i} className="border-b border-ink-900/10 px-2 py-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] text-ink-500">{DAY_LABELS[i]}</span>
                        <span
                          className={`w-8 h-8 flex items-center justify-center rounded-full font-display text-sm ${
                            isToday ? 'border-2 border-navy-700 text-navy-800 font-semibold' : 'text-ink-900'
                          }`}
                        >
                          {d.getDate()}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="border-r border-b border-ink-900/10 px-3 py-3 text-ink-900 font-medium whitespace-nowrap">
                    {v.plateNumber}
                  </td>
                  {weekDays.map((d, i) => {
                    const booked = isBooked(v.id, d);
                    return (
                      <td key={i} className="border-b border-ink-900/5 p-1.5">
                        <div
                          title={booked ? 'ไม่ว่าง' : 'ว่าง'}
                          className={`w-full h-9 rounded-md ${booked ? 'bg-brick-100 border border-brick-600/40' : 'bg-sage-100 border border-sage-600/30'}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}