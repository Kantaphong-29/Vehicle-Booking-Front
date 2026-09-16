import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from "../components/AppLayout.jsx";
import StatusStamp from "../components/StatusStamp.jsx";
import DownloadPdfButton from "../components/DownloadPdfButton.jsx";
import { useAuth } from "../api/AuthContext.jsx";
import { api } from "../api/client.js";
import { PURPOSE_LABELS, TRIP_TYPE_LABELS } from "../constants.js";

export default function BookingDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const isStaff = user?.role === "STAFF" || user?.role === "ADMIN";

  useEffect(() => {
    api
      .getBooking(token, id)
      .then(setBooking)
      .finally(() => setLoading(false));
    if (isStaff) {
      api
        .getVehicles(token)
        .then(setVehicles)
        .catch(() => { });
      api
        .getDrivers(token)
        .then(setDrivers)
        .catch(() => { });
    }
  }, [token, id, isStaff]);

  async function handleApprove() {
    setBusy(true);
    setError("");
    try {
      const updated = await api.approveBooking(token, id, {
        vehicleId: vehicleId ? Number(vehicleId) : undefined,
        driverId: driverId ? Number(driverId) : undefined,
      });
      setBooking(updated.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    setBusy(true);
    setError("");
    try {
      const updated = await api.rejectBooking(token, id, rejectReason);
      setBooking(updated.booking);
      setShowReject(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setBusy(true);
    setError("");
    try {
      const updated = await api.cancelBooking(token, id);
      setBooking(updated.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <AppLayout title="รายละเอียดคำขอ">
        <p className="text-sm text-ink-500">กำลังโหลดข้อมูล...</p>
      </AppLayout>
    );
  }
  if (!booking) {
    return (
      <AppLayout title="ไม่พบข้อมูล">
        <p className="text-sm text-ink-500">ไม่พบคำขอนี้ในระบบ</p>
      </AppLayout>
    );
  }

  const isOwner = booking.requesterId === user?.id;
  const fmt = (d) =>
    new Date(d).toLocaleString("th-TH", {
      dateStyle: "long",
      timeStyle: "short",
    });

  return (
    <AppLayout
      title="รายละเอียดคำขอใช้รถ"
      subtitle={`เลขที่คำขอ #${String(booking.id).padStart(5, "0")}`}
    >
      <div className="bg-paper-100 border border-ink-900/8 rounded-lg shadow-card p-7 max-w-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="font-display text-lg text-ink-900">{PURPOSE_LABELS[booking.purpose] || booking.purpose}</p>
            <p className="text-sm text-ink-500 mt-1">{booking.destination}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusStamp status={booking.status} />
            {booking.status === 'APPROVED' && (
              <DownloadPdfButton bookingId={booking.id} token={token} />
            )}
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm mb-6">
          <Detail label="วัน-เวลาไป" value={fmt(booking.startDateTime)} />
          <Detail label="วัน-เวลากลับ" value={fmt(booking.endDateTime)} />
          <Detail
            label="รูปแบบการเดินทาง"
            value={TRIP_TYPE_LABELS[booking.tripType]}
          />
          <Detail label="ขอให้รถออกจาก" value={booking.pickupLocation || "—"} />
          <Detail label="ถนน" value={booking.street || "—"} />
          <Detail label="จังหวัด" value={booking.province || "—"} />
          {booking.route && (
            <Detail label="เส้นทางที่ขอให้รถผ่าน" value={booking.route} />
          )}
          {booking.speakerName && (
            <Detail label="ชื่อวิทยากร" value={booking.speakerName} />
          )}
          {booking.speakerPhone && (
            <Detail label="เบอร์โทรวิทยากร" value={booking.speakerPhone} />
          )}
          <Detail
            label="ผู้ควบคุมการไปราชการ"
            value={booking.controllerName || "—"}
          />
          <Detail
            label="เบอร์โทรผู้ควบคุม"
            value={booking.controllerPhone || "—"}
          />
          <Detail label="แหล่งงบประมาณ" value={booking.budgetSource || "—"} />
          {booking.requester && (
            <Detail
              label="ผู้ยื่นคำขอ"
              value={`${booking.requester.name} (${booking.requester.department || "-"})`}
            />
          )}
        </dl>

        {booking.passengers?.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-ink-500 mb-2">
              ผู้ร่วมเดินทาง ({booking.passengers.length} คน)
            </p>
            <ul className="flex flex-wrap gap-2">
              {booking.passengers.map((p) => (
                <li
                  key={p.id}
                  className="px-2.5 py-1 bg-paper-50 border border-ink-900/8 rounded-full text-xs text-ink-600"
                >
                  {p.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(booking.vehicle || booking.driver) && (
          <div className="mb-6 px-4 py-3 bg-sage-100 rounded-md text-sm text-sage-600">
            {booking.vehicle && (
              <p>รถที่มอบหมาย: {booking.vehicle.plateNumber}</p>
            )}
            {booking.driver && (
              <p>
                พนักงานขับรถ: {booking.driver.name} ({booking.driver.phone})
              </p>
            )}
          </div>
        )}

        {booking.status === "REJECTED" && booking.rejectReason && (
          <div className="mb-6 px-4 py-3 bg-brick-100 rounded-md text-sm text-brick-600">
            เหตุผลที่ปฏิเสธ: {booking.rejectReason}
          </div>
        )}

        {error && (
          <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {/* USER: แก้ไข/ยกเลิกคำขอของตัวเอง */}
        {isOwner && ["PENDING", "APPROVED"].includes(booking.status) && (
          <div className="flex items-center gap-4">
            {booking.status === "PENDING" && (
              <Link
                to={`/bookings/${booking.id}/edit`}
                className="text-sm text-navy-700 font-medium hover:underline"
              >
                แก้ไขคำขอ
              </Link>
            )}
            <button
              onClick={handleCancel}
              disabled={busy}
              className="text-sm text-brick-600 font-medium hover:underline disabled:opacity-60"
            >
              ยกเลิกคำขอนี้
            </button>
          </div>
        )}

        {/* STAFF/ADMIN: อนุมัติ/ปฏิเสธ */}
        {isStaff && booking.status === "PENDING" && (
          <div className="space-y-4 pt-4 border-t border-ink-900/8">
            <h3 className="font-display text-sm text-navy-800">
              มอบหมายและพิจารณาคำขอ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  รถตู้
                </label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-ink-900/15 bg-white text-sm outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600"
                >
                  <option value="">ไม่ระบุ</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} {v.brand ? `(${v.brand})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  พนักงานขับรถ
                </label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-ink-900/15 bg-white text-sm outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600"
                >
                  <option value="">ไม่ระบุ</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleApprove}
                disabled={busy}
                className="bg-sage-600 text-white rounded-md px-5 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "กำลังดำเนินการ..." : "อนุมัติคำขอ"}
              </button>
              <button
                onClick={() => setShowReject(!showReject)}
                className="border border-brick-600 text-brick-600 rounded-md px-5 py-2 text-sm font-medium hover:bg-brick-100"
              >
                ปฏิเสธคำขอ
              </button>
            </div>

            {showReject && (
              <div className="space-y-2">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="ระบุเหตุผลที่ปฏิเสธคำขอ"
                  className="w-full px-3.5 py-2.5 rounded-md border border-ink-900/15 bg-white text-sm outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600"
                  rows={3}
                />
                <button
                  onClick={handleReject}
                  disabled={busy}
                  className="bg-brick-600 text-white rounded-md px-5 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
                >
                  ยืนยันการปฏิเสธ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="text-ink-900 mt-0.5">{value}</dd>
    </div>
  );
}