import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../api/AuthContext.jsx';
import { api } from '../api/client.js';

export default function ManageFleet() {
  const { user, token } = useAuth();
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  if (user && !isStaff) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppLayout title="จัดการรถตู้และคนขับ" subtitle="เพิ่ม แก้ไข หรือลบข้อมูลรถตู้และพนักงานขับรถในระบบ">
      <div className="space-y-8">
        <VehicleSection token={token} />
        <DriverSection token={token} />
      </div>
    </AppLayout>
  );
}

/* ========================= รถตู้ ========================= */

function VehicleSection({ token }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyVehicle());
  const [showAddForm, setShowAddForm] = useState(false);

  function emptyVehicle() {
    return { plateNumber: '', brand: '', model: '', seats: '', status: 'AVAILABLE' };
  }

  async function load() {
    setLoading(true);
    try {
      const data = await api.getVehicles(token);
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  function startAdd() {
    setForm(emptyVehicle());
    setEditingId(null);
    setShowAddForm(true);
  }

  function startEdit(v) {
    setForm({ plateNumber: v.plateNumber, brand: v.brand || '', model: v.model || '', seats: v.seats || '', status: v.status });
    setEditingId(v.id);
    setShowAddForm(true);
  }

  function cancelForm() {
    setShowAddForm(false);
    setEditingId(null);
    setForm(emptyVehicle());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, seats: form.seats ? Number(form.seats) : undefined };
      if (editingId) {
        await api.updateVehicle(token, editingId, payload);
      } else {
        await api.createVehicle(token, payload);
      }
      cancelForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('ต้องการลบรถคันนี้ใช่หรือไม่?')) return;
    setError('');
    try {
      await api.deleteVehicle(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="bg-paper-100 border border-ink-900/8 rounded-lg shadow-card p-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-lg text-ink-900">รถตู้ทั้งหมด</h2>
        {!showAddForm && (
          <button onClick={startAdd} className="text-sm text-navy-800 font-medium hover:underline">
            + เพิ่มรถตู้
          </button>
        )}
      </div>

      {error && <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2 mb-4">{error}</p>}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-paper-50 border border-ink-900/8 rounded-lg p-5 mb-5 space-y-4">
          <h3 className="font-display text-sm text-navy-800">{editingId ? 'แก้ไขข้อมูลรถตู้' : 'เพิ่มรถตู้ใหม่'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ทะเบียนรถ" value={form.plateNumber} onChange={(v) => setForm({ ...form, plateNumber: v })} required />
            <Field label="จำนวนที่นั่ง" type="number" value={form.seats} onChange={(v) => setForm({ ...form, seats: v })} />
            <Field label="ยี่ห้อ" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
            <Field label="รุ่น" value={form.model} onChange={(v) => setForm({ ...form, model: v })} />
          </div>
          {editingId && (
            <SelectField
              label="สถานะ" value={form.status} onChange={(v) => setForm({ ...form, status: v })}
              options={[
                ['AVAILABLE', 'พร้อมใช้งาน'],
                ['IN_USE', 'กำลังใช้งาน'],
                ['MAINTENANCE', 'ซ่อมบำรุง']
              ]}
            />
          )}
          <div className="flex gap-3">
            <button type="submit" className="bg-navy-800 text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-navy-900">
              {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มรถตู้'}
            </button>
            <button type="button" onClick={cancelForm} className="text-sm text-ink-500 hover:text-ink-900">ยกเลิก</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-500">กำลังโหลดข้อมูล...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-sm text-ink-500 border border-dashed border-ink-900/15 rounded-lg px-6 py-8 text-center">
          ยังไม่มีรถตู้ในระบบ
        </p>
      ) : (
        <div className="space-y-2">
          {vehicles.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-4 py-3 bg-paper-50 border border-ink-900/8 rounded-md">
              <div>
                <p className="text-sm font-medium text-ink-900">{v.plateNumber} {v.brand ? `· ${v.brand} ${v.model || ''}` : ''}</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {v.seats ? `${v.seats} ที่นั่ง · ` : ''}{VEHICLE_STATUS_LABELS[v.status] || v.status}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => startEdit(v)} className="text-xs text-navy-800 font-medium hover:underline">แก้ไข</button>
                <button onClick={() => handleDelete(v.id)} className="text-xs text-brick-600 font-medium hover:underline">ลบ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const VEHICLE_STATUS_LABELS = { AVAILABLE: 'พร้อมใช้งาน', IN_USE: 'กำลังใช้งาน', MAINTENANCE: 'ซ่อมบำรุง' };

/* ========================= คนขับ ========================= */

function DriverSection({ token }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyDriver());
  const [showAddForm, setShowAddForm] = useState(false);

  function emptyDriver() {
    return { name: '', phone: '', status: 'AVAILABLE' };
  }

  async function load() {
    setLoading(true);
    try {
      const data = await api.getDrivers(token);
      setDrivers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  function startAdd() {
    setForm(emptyDriver());
    setEditingId(null);
    setShowAddForm(true);
  }

  function startEdit(d) {
    setForm({ name: d.name, phone: d.phone, status: d.status });
    setEditingId(d.id);
    setShowAddForm(true);
  }

  function cancelForm() {
    setShowAddForm(false);
    setEditingId(null);
    setForm(emptyDriver());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateDriver(token, editingId, form);
      } else {
        await api.createDriver(token, form);
      }
      cancelForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('ต้องการลบพนักงานขับรถคนนี้ใช่หรือไม่?')) return;
    setError('');
    try {
      await api.deleteDriver(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="bg-paper-100 border border-ink-900/8 rounded-lg shadow-card p-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-lg text-ink-900">พนักงานขับรถทั้งหมด</h2>
        {!showAddForm && (
          <button onClick={startAdd} className="text-sm text-navy-800 font-medium hover:underline">
            + เพิ่มพนักงานขับรถ
          </button>
        )}
      </div>

      {error && <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2 mb-4">{error}</p>}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-paper-50 border border-ink-900/8 rounded-lg p-5 mb-5 space-y-4">
          <h3 className="font-display text-sm text-navy-800">{editingId ? 'แก้ไขข้อมูลพนักงานขับรถ' : 'เพิ่มพนักงานขับรถใหม่'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ชื่อ-นามสกุล" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="เบอร์โทรศัพท์" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
          </div>
          {editingId && (
            <SelectField
              label="สถานะ" value={form.status} onChange={(v) => setForm({ ...form, status: v })}
              options={[
                ['AVAILABLE', 'พร้อมปฏิบัติงาน'],
                ['ON_DUTY', 'กำลังปฏิบัติงาน'],
                ['OFF', 'ไม่พร้อมปฏิบัติงาน']
              ]}
            />
          )}
          <div className="flex gap-3">
            <button type="submit" className="bg-navy-800 text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-navy-900">
              {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มพนักงานขับรถ'}
            </button>
            <button type="button" onClick={cancelForm} className="text-sm text-ink-500 hover:text-ink-900">ยกเลิก</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-500">กำลังโหลดข้อมูล...</p>
      ) : drivers.length === 0 ? (
        <p className="text-sm text-ink-500 border border-dashed border-ink-900/15 rounded-lg px-6 py-8 text-center">
          ยังไม่มีพนักงานขับรถในระบบ
        </p>
      ) : (
        <div className="space-y-2">
          {drivers.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-4 py-3 bg-paper-50 border border-ink-900/8 rounded-md">
              <div>
                <p className="text-sm font-medium text-ink-900">{d.name}</p>
                <p className="text-xs text-ink-500 mt-0.5">{d.phone} · {DRIVER_STATUS_LABELS[d.status] || d.status}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => startEdit(d)} className="text-xs text-navy-800 font-medium hover:underline">แก้ไข</button>
                <button onClick={() => handleDelete(d.id)} className="text-xs text-brick-600 font-medium hover:underline">ลบ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const DRIVER_STATUS_LABELS = { AVAILABLE: 'พร้อมปฏิบัติงาน', ON_DUTY: 'กำลังปฏิบัติงาน', OFF: 'ไม่พร้อมปฏิบัติงาน' };

/* ========================= ฟอร์มย่อยใช้ร่วมกัน ========================= */

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="block text-xs text-ink-500 mb-1.5">{label}</label>
      <input
        type={type} value={value} required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs text-ink-500 mb-1.5">{label}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
      >
        {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
      </select>
    </div>
  );
}
