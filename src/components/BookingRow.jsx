import React from 'react';
import { Link } from 'react-router-dom';
import StatusStamp from './StatusStamp.jsx';
import { PURPOSE_LABELS } from '../constants.js';

function formatDateRange(start, end) {
  const opts = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  const s = new Date(start).toLocaleString('th-TH', opts);
  const e = new Date(end).toLocaleString('th-TH', opts);
  return `${s} – ${e}`;
}

export default function BookingRow({ booking, showRequester }) {
  return (
    <Link
      to={`/bookings/${booking.id}`}
      className="block bg-paper-100 border border-ink-900/8 rounded-lg px-5 py-4 shadow-card hover:border-navy-600/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs text-ink-500 mb-1">คำขอเลขที่ #{String(booking.id).padStart(5, '0')}</p>
          <p className="font-display text-base text-ink-900 truncate">
            {PURPOSE_LABELS[booking.purpose] || booking.purpose}
          </p>
          <p className="text-sm text-ink-500 mt-1">{booking.destination}</p>
          <p className="text-xs text-ink-500/80 mt-1 font-mono">
            {formatDateRange(booking.startDateTime, booking.endDateTime)}
          </p>
          {showRequester && booking.requester && (
            <p className="text-xs text-navy-700 mt-2">
              ผู้ขอ: {booking.requester.name} {booking.requester.department ? `· ${booking.requester.department}` : ''}
            </p>
          )}
        </div>
        <StatusStamp status={booking.status} />
      </div>
    </Link>
  );
}
