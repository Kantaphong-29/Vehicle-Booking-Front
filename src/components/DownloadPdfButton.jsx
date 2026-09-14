import React, { useState } from 'react';
import { api } from '../api/client.js';

// ปุ่มดาวน์โหลด PDF ฟอร์มจริง — เดิมสร้างไฟล์ฝั่ง browser เอง (ต้องพึ่งฟอนต์/รูปภาพใน public
// ซึ่งขาดหายไปเลยดาวน์โหลดไม่ได้) ตอนนี้เปลี่ยนไปเรียกไฟล์ PDF ที่ backend กรอกฟอร์มจริงให้แล้วแทน
export default function DownloadPdfButton({ bookingId, token }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = await api.getBookingPdfBlob(token, bookingId);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `คำขอใช้รถ_${bookingId}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดาวน์โหลด PDF:', error);
      alert(error.message || 'ไม่สามารถดาวน์โหลด PDF ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={downloading}
      className="px-4 py-2 bg-navy-800 text-white rounded-md hover:bg-navy-900 transition-colors text-sm font-medium disabled:opacity-60"
    >
      {downloading ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF (ฟอร์มจริง)'}
    </button>
  );
}
