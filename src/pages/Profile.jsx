import React, { useRef, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../api/AuthContext.jsx';
import { api } from '../api/client.js';
import { DEPARTMENT_GROUPS } from '../constants.js';

const ROLE_LABELS = { USER: 'อาจารย์ / บุคลากร', STAFF: 'ผู้ควบคุมหน่วยยานพาหนะ', ADMIN: 'ผู้ดูแลระบบ' };
const MAX_AVATAR_MB = 2;

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      setProfileError(`ไฟล์รูปภาพต้องมีขนาดไม่เกิน ${MAX_AVATAR_MB}MB`);
      return;
    }

    setProfileError('');
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);
    try {
      const payload = { ...profileForm };
      if (avatarPreview !== user?.avatarUrl) payload.avatarUrl = avatarPreview;

      const data = await api.updateProfile(token, payload);
      updateUser(data.user);
      setProfileSuccess('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setSavingPassword(true);
    try {
      await api.changePassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  const initial = user?.name?.charAt(0) || '?';

  return (
    <AppLayout title="โปรไฟล์ของฉัน" subtitle="จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชี">
      <div className="max-w-2xl space-y-6">

        {/* ข้อมูลโปรไฟล์ */}
        <form onSubmit={handleProfileSubmit} className="bg-paper-100 border border-ink-900/8 rounded-lg shadow-card p-7 space-y-5">
          <h2 className="font-display text-lg text-ink-900">ข้อมูลโปรไฟล์</h2>

          <div className="flex items-center gap-5">
            {avatarPreview ? (
              <img src={avatarPreview} alt="รูปโปรไฟล์" className="w-20 h-20 rounded-full object-cover border border-ink-900/10" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-navy-800 text-white font-display flex items-center justify-center text-2xl">
                {initial}
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-md border border-ink-900/15 text-sm font-medium text-navy-800 hover:bg-navy-50"
              >
                เปลี่ยนรูปโปรไฟล์
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <p className="text-xs text-ink-500 mt-2">JPG, PNG ขนาดไม่เกิน {MAX_AVATAR_MB}MB</p>
            </div>
          </div>

          <div>
            <label className="block text-xs text-ink-500 mb-1.5">ชื่อ-นามสกุล</label>
            <input
              value={profileForm.name} required
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-ink-500 mb-1.5">อีเมล</label>
            <input
              value={user?.email || ''} disabled
              className="w-full px-4 py-3 rounded-md border border-ink-900/15 bg-paper-50 text-sm text-ink-500 cursor-not-allowed"
            />
            <p className="text-xs text-ink-500 mt-1">ไม่สามารถแก้ไขอีเมลที่ใช้เข้าสู่ระบบได้</p>
          </div>

          <div>
            <label className="block text-xs text-ink-500 mb-1.5">เบอร์โทรศัพท์</label>
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-ink-500 mb-1.5">ภาควิชา / หน่วยงาน</label>
            <select
              value={profileForm.department}
              onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
            >
              <option value="">ไม่ระบุ</option>
              {DEPARTMENT_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {profileError && <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2">{profileError}</p>}
          {profileSuccess && <p className="text-sm text-sage-600 bg-sage-100 rounded-md px-3 py-2">{profileSuccess}</p>}

          <button
            type="submit" disabled={savingProfile}
            className="bg-navy-800 text-white rounded-md px-5 py-2.5 text-sm font-medium hover:bg-navy-900 transition-colors disabled:opacity-60"
          >
            {savingProfile ? 'กำลังบันทึก...' : 'บันทึกข้อมูลโปรไฟล์'}
          </button>
        </form>

        {/* เปลี่ยนรหัสผ่าน */}
        <form onSubmit={handlePasswordSubmit} className="bg-paper-100 border border-ink-900/8 rounded-lg shadow-card p-7 space-y-5">
          <h2 className="font-display text-lg text-ink-900">เปลี่ยนรหัสผ่าน</h2>

          <div>
            <label className="block text-xs text-ink-500 mb-1.5">รหัสผ่านเดิม</label>
            <input
              type="password" required value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-ink-500 mb-1.5">รหัสผ่านใหม่</label>
            <input
              type="password" required minLength={6} value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
            />
            <p className="text-xs text-ink-500 mt-1">อย่างน้อย 6 ตัวอักษร</p>
          </div>

          <div>
            <label className="block text-xs text-ink-500 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password" required value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-ink-900/15 bg-white text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 outline-none"
            />
          </div>

          {passwordError && <p className="text-sm text-brick-600 bg-brick-100 rounded-md px-3 py-2">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-sage-600 bg-sage-100 rounded-md px-3 py-2">{passwordSuccess}</p>}

          <button
            type="submit" disabled={savingPassword}
            className="bg-navy-800 text-white rounded-md px-5 py-2.5 text-sm font-medium hover:bg-navy-900 transition-colors disabled:opacity-60"
          >
            {savingPassword ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}