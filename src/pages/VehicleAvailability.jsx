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

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

function jumpToMonth(year, month) {
  // ไปวันจันทร์แรกของสัปดาห์ที่มีวันที่ 1 ของเดือนนั้น
  return getMonday(new Date(year, month, 1));
}

function ChevronIcon({ dir = 'left' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
    </svg>
  );
}

function VanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 16V8a1 1 0 0 1 1-1h11l4 4v5a1 1 0 0 1-1 1h-1" />
      <path d="M3 16h1" />
      <circle cx="7.5" cy="16.5" r="1.8" />
      <circle cx="16.5" cy="16.5" r="1.8" />
      <path d="M9.3 16.5h5.4" />
    </svg>
  );
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

  // หัวข้อช่วงวันที่แสดงด้านบน
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const headerLabel = sameMonth
    ? `${weekStart.getDate()} - ${weekEnd.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear() + 543}`
    : `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear() + 543}`;

  // สรุปสถิติวันนี้
  const isTodayInWeek = weekDays.some((d) => isSameDay(d, today));
  const availableToday = isTodayInWeek
    ? vehicles.filter((v) => !isBooked(v.id, today)).length
    : null;
  const totalBookedThisWeek = vehicles.reduce(
    (sum, v) => sum + weekDays.filter((d) => isBooked(v.id, d)).length,
    0
  );
  const totalSlots = vehicles.length * 7;
  const busyRate = totalSlots > 0 ? Math.round((totalBookedThisWeek / totalSlots) * 100) : 0;

  return (
    <AppLayout title="ตารางสถานะรถตู้ว่าง" subtitle="ตรวจสอบว่ารถคันไหนว่างวันไหนก่อนยื่นคำขอ">

      {/* แถบสรุปสถิติ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-paper-100 border border-ink-900/8 rounded-lg px-4 py-3.5 flex items-center gap-3 shadow-card">
          <div className="w-9 h-9 rounded-md bg-navy-800/10 flex items-center justify-center text-navy-800">
            <VanIcon />
          </div>
          <div>
            <p className="text-xs text-ink-500">รถตู้ทั้งหมด</p>
            <p className="font-display text-lg text-ink-900 leading-tight">{vehicles.length} คัน</p>
          </div>
        </div>

        <div className="bg-paper-100 border border-ink-900/8 rounded-lg px-4 py-3.5 flex items-center gap-3 shadow-card">
          <div className="w-9 h-9 rounded-md bg-sage-100 border border-sage-600/40 flex items-center justify-center text-sage-700 font-display text-sm">
            {isTodayInWeek ? availableToday : '–'}
          </div>
          <div>
            <p className="text-xs text-ink-500">ว่างวันนี้</p>
            <p className="font-display text-lg text-ink-900 leading-tight">
              {isTodayInWeek ? `${availableToday} / ${vehicles.length} คัน` : 'ไม่อยู่ในสัปดาห์นี้'}
            </p>
          </div>
        </div>

        <div className="bg-paper-100 border border-ink-900/8 rounded-lg px-4 py-3.5 flex items-center gap-3 shadow-card">
          <div className="w-9 h-9 rounded-md bg-brick-100 border border-brick-600/40 flex items-center justify-center text-brick-700 font-display text-xs">
            {busyRate}%
          </div>
          <div>
            <p className="text-xs text-ink-500">อัตราการใช้งานสัปดาห์นี้</p>
            <p className="font-display text-lg text-ink-900 leading-tight">{totalBookedThisWeek} / {totalSlots} ช่วง</p>
          </div>
        </div>
      </div>

      {/* แถบควบคุมสัปดาห์ */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 bg-paper-100 border border-ink-900/8 rounded-lg px-2 py-1.5 shadow-card">
          <button
            onClick={goPrevWeek}
            aria-label="สัปดาห์ก่อนหน้า"
            className="w-8 h-8 flex items-center justify-center rounded-md text-ink-600 hover:bg-navy-800/8 hover:text-navy-800 transition-colors"
          >
            <ChevronIcon dir="left" />
          </button>

          <button
            onClick={goNextWeek}
            aria-label="สัปดาห์ถัดไป"
            className="w-8 h-8 flex items-center justify-center rounded-md text-ink-600 hover:bg-navy-800/8 hover:text-navy-800 transition-colors"
          >
            <ChevronIcon dir="right" />
          </button>

          <div className="w-px h-5 bg-ink-900/10 mx-1" />

          <button
            onClick={goThisWeek}
            className="text-xs text-navy-800 font-medium hover:bg-navy-800/8 rounded-md px-2.5 py-1.5 transition-colors"
          >
            สัปดาห์นี้
          </button>

          <div className="w-px h-5 bg-ink-900/10 mx-1" />

          {/* กระโดดไปวันที่เจาะจงด้วย native date picker */}
          <input
            type="date"
            value={toISODate(weekStart)}
            onChange={(e) => {
              if (e.target.value) setWeekStart(getMonday(new Date(e.target.value)));
            }}
            className="text-xs text-ink-600 bg-transparent border border-ink-900/10 rounded-md px-2 py-1.5 outline-none hover:border-navy-600 cursor-pointer"
          />
        </div>

        <p className="font-display text-base text-ink-900">{headerLabel}</p>

        <div className="flex items-center gap-4 text-xs text-ink-600 bg-paper-100 border border-ink-900/8 rounded-lg px-3.5 py-2 shadow-card">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sage-100 border border-sage-600 inline-block" /> ว่าง
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-brick-100 border border-brick-600 inline-block" /> ไม่ว่าง
          </span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2.5 mb-4 flex items-start gap-2">
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </p>
      )}

      {loading ? (
        <div className="bg-paper-100 border border-ink-900/8 rounded-xl shadow-card px-6 py-16 flex flex-col items-center gap-3">
          <svg className="w-6 h-6 animate-spin text-navy-700" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-ink-500">กำลังโหลดข้อมูล...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-sm text-ink-500 border border-dashed border-ink-900/15 rounded-xl px-6 py-16 text-center bg-paper-100">
          <div className="w-12 h-12 rounded-full bg-navy-800/8 text-navy-800 flex items-center justify-center mx-auto mb-3">
            <VanIcon />
          </div>
          ยังไม่มีรถตู้ในระบบ
        </div>
      ) : (
        <div className="overflow-x-auto bg-paper-100 border border-ink-900/8 rounded-xl shadow-card">
          <table className="border-collapse w-full text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-navy-900 border-b border-r border-navy-900/40 px-4 py-3.5 text-left text-white/70 font-medium w-32 text-xs tracking-wide">
                  รถตู้
                </th>
                {weekDays.map((d, i) => {
                  const isToday = isSameDay(d, today);
                  const isWeekend = i >= 5;
                  return (
                    <th
                      key={i}
                      className={`border-b border-navy-900/40 px-2 py-2.5 text-center ${
                        isToday ? 'bg-navy-800' : isWeekend ? 'bg-navy-900/95' : 'bg-navy-900'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[11px] ${isWeekend ? 'text-white/50' : 'text-white/60'}`}>{DAY_LABELS[i]}</span>
                        <span
                          className={`w-8 h-8 flex items-center justify-center rounded-full font-display text-sm ${
                            isToday ? 'bg-white text-navy-900 font-semibold' : 'text-white'
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
              {vehicles.map((v, rowIdx) => (
                <tr key={v.id} className="group">
                  <td className={`sticky left-0 z-10 border-r border-b border-ink-900/8 px-4 py-3 text-ink-900 font-medium whitespace-nowrap group-hover:bg-navy-50 transition-colors ${
                    rowIdx % 2 === 0 ? 'bg-paper-100' : 'bg-paper-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-navy-800/8 text-navy-800 flex items-center justify-center shrink-0">
                        <VanIcon />
                      </span>
                      {v.plateNumber}
                    </div>
                  </td>
                  {weekDays.map((d, i) => {
                    const booked = isBooked(v.id, d);
                    const isToday = isSameDay(d, today);
                    return (
                      <td key={i} className={`border-b border-ink-900/5 p-1.5 ${isToday ? 'bg-navy-50/60' : ''}`}>
                        <div
                          title={booked ? 'ไม่ว่าง' : 'ว่าง'}
                          className={`w-full h-9 rounded-md border transition-transform hover:scale-[1.03] cursor-default ${
                            booked
                              ? 'bg-brick-100 border-brick-600/40'
                              : 'bg-sage-100 border-sage-600/30'
                          }`}
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