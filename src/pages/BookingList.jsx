import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../api/AuthContext.jsx';
import { api } from '../api/client.js';
import { PURPOSE_LABELS, TRIP_TYPE_LABELS } from '../constants.js';

const MAX_PASSENGERS = 10;

const PICKUP_OPTIONS = [
  'ที่จอดรถคณะศึกษาศาสตร์',
  'สำนักงานอธิการบดี วิทยาเขตพระราชวังสนามจันทร์',
  'อื่น ๆ'
];

function emptyForm() {
  return {
    purpose: 'SUPERVISION',
    purposeDetail: '',
    destination: '',
    street: '',
    province: '',
    route: '',
    startDateTime: '',
    endDateTime: '',
    pickupLocation: PICKUP_OPTIONS[0],
    pickupLocationOther: '',
    tripType: 'ROUND_TRIP',
    speakerName: '',
    speakerPhone: '',
    controllerName: '',
    controllerPhone: '',
    budgetSource: ''
  };
}

// แปลง ISO datetime จาก backend ให้เข้ากับ input type="datetime-local" (ตัดวินาที/timezone offset ออก)
function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewBooking() {
  const { id } = useParams(); // มีค่าก็ต่อเมื่อเข้าทาง route /bookings/:id/edit
  const isEditMode = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm());
  const [passengers, setPassengers] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(isEditMode);

  // โหมดแก้ไข: โหลดคำขอเดิมมาเติมในฟอร์ม
  useEffect(() => {
    if (!isEditMode) return;
    setLoadingBooking(true);
    setError('');
    api.getBooking(token, id)
      .then((booking) => {
        // กันแก้ไขคำขอที่ไม่ใช่สถานะ PENDING หรือไม่ใช่ของตัวเอง (เผื่อ backend เช็คไม่ครบ)
        if (booking.status !== 'PENDING') {
          setError('ไม่สามารถแก้ไขคำขอนี้ได้ เนื่องจากถูกพิจารณาไปแล้ว');
        }
        const isOtherPickup = booking.pickupLocation && !PICKUP_OPTIONS.slice(0, -1).includes(booking.pickupLocation);
        setForm({
          purpose: booking.purpose || 'SUPERVISION',
          purposeDetail: booking.purposeDetail || '',
          destination: booking.destination || '',
          street: booking.street || '',
          province: booking.province || '',
          route: booking.route || '',
          startDateTime: toDatetimeLocalValue(booking.startDateTime),
          endDateTime: toDatetimeLocalValue(booking.endDateTime),
          pickupLocation: isOtherPickup ? 'อื่น ๆ' : (booking.pickupLocation || PICKUP_OPTIONS[0]),
          pickupLocationOther: isOtherPickup ? booking.pickupLocation : '',
          tripType: booking.tripType || 'ROUND_TRIP',
          speakerName: booking.speakerName || '',
          speakerPhone: booking.speakerPhone || '',
          controllerName: booking.controllerName || '',
          controllerPhone: booking.controllerPhone || '',
          budgetSource: booking.budgetSource || ''
        });
        setPassengers(
          booking.passengers?.length ? booking.passengers.map((p) => p.name) : ['']
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingBooking(false));
  }, [id, isEditMode, token]);

  function set(key) {
    return (e) => setForm({ ...form, [key]: e.target.value });
  }

  function updatePassenger(i, value) {
    const next = [...passengers];
    next[i] = value;
    setPassengers(next);
  }

  function addPassenger() {
    if (passengers.length < MAX_PASSENGERS) setPassengers([...passengers, '']);
  }

  function removePassenger(i) {
    setPassengers(passengers.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const pickupLocation = form.pickupLocation === 'อื่น ๆ'
        ? form.pickupLocationOther
        : form.pickupLocation;

      const payload = {
        ...form,
        pickupLocation,
        passengers: passengers.map((p) => p.trim()).filter(Boolean)
      };

      if (isEditMode) {
        await api.updateBooking(token, id, payload);
        navigate(`/bookings/${id}`);
      } else {
        await api.createBooking(token, payload);
        navigate('/bookings');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isSpeakerPurpose = form.purpose === 'PICKUP_SPEAKER';

  if (loadingBooking) {
    return (
      <AppLayout title="แก้ไขคำขอใช้รถตู้">
        <p className="text-sm text-ink-500">กำลังโหลดข้อมูลคำขอ...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={isEditMode ? 'แก้ไขคำขอใช้รถตู้' : 'ยื่นคำขอใช้รถตู้'}
      subtitle={isEditMode ? `แก้ไขรายละเอียดคำขอ #${String(id).padStart(5, '0')}` : 'กรอกรายละเอียดภารกิจให้ครบถ้วนเพื่อการพิจารณาอนุมัติ'}
    >
      <form onSubmit={handleSubmit} className="bg-paper-100 border border-ink-900/8 rounded-lg shadow-card p-7 max-w-2xl space-y-6">

        <Section title="วัตถุประสงค์การเดินทาง">
          <Select label="วัตถุประสงค์" value={form.purpose} onChange={set('purpose')} required>
            {Object.entries(PURPOSE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
          {form.purpose === 'OTHER' && (
            <Field label="ระบุรายละเอียด" value={form.purposeDetail} onChange={set('purposeDetail')} />
          )}

          {isSpeakerPurpose && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="ชื่อวิทยากร" value={form.speakerName} onChange={set('speakerName')} />
              <Field label="เบอร์โทรศัพท์วิทยากร" value={form.speakerPhone} onChange={set('speakerPhone')} />
            </div>
          )}
        </Section>

        <Section title="สถานที่ไปราชการ">
          <Field label="สถานที่ไปราชการ" value={form.destination} onChange={set('destination')} required
            placeholder="เช่น มหาวิทยาลัยศิลปากร" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ถนน" value={form.street} onChange={set('street')} />
            <Field label="จังหวัด" value={form.province} onChange={set('province')} />
          </div>
          <Field label="เส้นทางที่ขอให้รถผ่าน" value={form.route} onChange={set('route')}
            placeholder="ระบุเส้นทางโดยสังเขป (ถ้ามี)" />
        </Section>

        <Section title="รายละเอียดการเดินทาง">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="วัน-เวลาไป" type="datetime-local" value={form.startDateTime} onChange={set('startDateTime')} required />
            <Field label="วัน-เวลากลับ" type="datetime-local" value={form.endDateTime} onChange={set('endDateTime')} required />
          </div>

          <Select label="ขอให้รถออกจาก" value={form.pickupLocation} onChange={set('pickupLocation')}>
            {PICKUP_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </Select>
          {form.pickupLocation === 'อื่น ๆ' && (
            <Field label="ระบุจุดที่ขอให้รถออก" value={form.pickupLocationOther} onChange={set('pickupLocationOther')} />
          )}

          <Select label="รูปแบบการเดินทาง" value={form.tripType} onChange={set('tripType')}>
            {Object.entries(TRIP_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
        </Section>

        <Section title="ผู้ควบคุมการไปราชการ">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ชื่อผู้ควบคุม" value={form.controllerName} onChange={set('controllerName')} />
            <Field label="เบอร์โทรศัพท์" value={form.controllerPhone} onChange={set('controllerPhone')} />
          </div>
        </Section>

        <Section title={`รายชื่อผู้ร่วมเดินทาง (ไม่เกิน ${MAX_PASSENGERS} คน)`}>
          <div className="space-y-2">
            {passengers.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={p} onChange={(e) => updatePassenger(i, e.target.value)}
                  placeholder={`ผู้ร่วมเดินทางคนที่ ${i + 1}`}
                  className="flex-1 px-3.5 py-2.5 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
                />
                {passengers.length > 1 && (
                  <button type="button" onClick={() => removePassenger(i)}
                    className="px-3 text-ink-500 hover:text-brick-600 text-sm">✕</button>
                )}
              </div>
            ))}
          </div>
          {passengers.length < MAX_PASSENGERS && (
            <button type="button" onClick={addPassenger} className="text-sm text-navy-800 font-medium hover:underline">
              + เพิ่มผู้ร่วมเดินทาง
            </button>
          )}
        </Section>

        <Section title="แหล่งเบิกจ่ายงบประมาณ">
          <Field label="แหล่งงบประมาณ" value={form.budgetSource} onChange={set('budgetSource')}
            placeholder="เช่น งบประมาณคณะ / ภาควิชา / สาขาวิชา / โรงเรียนสาธิต" />
        </Section>

        {error && <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 bg-navy-800 text-white rounded-md py-2.5 text-sm font-medium hover:bg-navy-900 transition-colors disabled:opacity-60">
            {loading
              ? (isEditMode ? 'กำลังบันทึก...' : 'กำลังส่งคำขอ...')
              : (isEditMode ? 'บันทึกการแก้ไข' : 'ส่งคำขอใช้รถ')}
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={() => navigate(`/bookings/${id}`)}
              className="px-5 py-2.5 rounded-md border border-ink-900/15 text-sm font-medium text-ink-600 hover:bg-paper-50"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </form>
    </AppLayout>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3 pb-6 border-b border-ink-900/8 last:border-0 last:pb-0">
      <h3 className="font-display text-sm text-navy-800 tracking-wide">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs text-ink-500 mb-1.5">{label}</label>
      <input {...props} className="w-full px-3.5 py-2.5 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none" />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="block text-xs text-ink-500 mb-1.5">{label}</label>
      <select {...props} className="w-full px-3.5 py-2.5 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none">
        {children}
      </select>
    </div>
  );
}