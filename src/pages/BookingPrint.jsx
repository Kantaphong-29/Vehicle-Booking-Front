import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';
import { api } from '../api/client.js';

export default function BookingPrint() {
  const { id } = useParams();
  const { token } = useAuth();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let objectUrl;
    setLoading(true);
    setError('');

    api.getBookingPdfBlob(token, id)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // เคลียร์ object URL ทิ้งตอนออกจากหน้านี้ กัน memory leak
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token, id]);

  return (
    <div className="min-h-screen bg-paper-50 flex flex-col">
      {/* แถบเครื่องมือ */}
      <div className="bg-navy-900 text-white px-6 py-3 flex items-center justify-between">
        <Link to={`/bookings/${id}`} className="text-sm hover:underline">← กลับไปหน้ารายละเอียด</Link>
        {pdfUrl && (
          <a
            href={pdfUrl}
            download={`car-request-${id}.pdf`}
            className="bg-gold-500 text-navy-900 rounded-md px-4 py-1.5 text-sm font-medium hover:bg-gold-300"
          >
            ดาวน์โหลด PDF
          </a>
        )}
      </div>

      {loading && <p className="p-8 text-sm text-ink-500">กำลังสร้างไฟล์ PDF...</p>}
      {error && <p className="p-8 text-sm text-brick-600">{error}</p>}

      {/* แสดงฟอร์ม PDF จริงที่กรอกข้อมูลไว้แล้วโดยตรง (ไม่ใช่ภาพวางทับข้อมูลแบบเดิมอีกต่อไป) */}
      {pdfUrl && (
        <iframe
          title={`car-request-${id}`}
          src={pdfUrl}
          className="flex-1 w-full border-0"
          style={{ minHeight: '85vh' }}
        />
      )}
    </div>
  );
}
