const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
  }
  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),
  updateProfile: (token, payload) =>
    request("/auth/me", { method: "PATCH", body: payload, token }),
  changePassword: (token, payload) =>
    request("/auth/me/password", { method: "PATCH", body: payload, token }),

  getBookings: (token, status) =>
    request(`/bookings${status ? `?status=${status}` : ""}`, { token }),
  getBooking: (token, id) => request(`/bookings/${id}`, { token }),
  createBooking: (token, payload) =>
    request("/bookings", { method: "POST", body: payload, token }),
  approveBooking: (token, id, payload) =>
    request(`/bookings/${id}/approve`, {
      method: "PATCH",
      body: payload,
      token,
    }),
  rejectBooking: (token, id, reason) =>
    request(`/bookings/${id}/reject`, {
      method: "PATCH",
      body: { reason },
      token,
    }),
  cancelBooking: (token, id) =>
    request(`/bookings/${id}/cancel`, { method: "PATCH", token }),
  // ดึงไฟล์ PDF ฟอร์มจริงที่กรอกข้อมูลแล้ว (ไม่ใช่ JSON เลยไม่ผ่านฟังก์ชัน request() ด้านบน)
  getBookingPdfBlob: async (token, id) => {
    const res = await fetch(`${BASE_URL}/bookings/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "ไม่สามารถสร้างไฟล์ PDF ได้");
    }
    return res.blob();
  },
  getAvailableVehicles: (token, startDateTime, endDateTime) =>
    request(
      `/bookings/vehicles/available?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
      { token },
    ),

  getVehicles: (token) => request("/vehicles", { token }),
  getUsers: (token) => request("/users", { token }),
  updateUserRole: (token, id, role) =>
    request(`/users/${id}/role`, { method: "PATCH", body: { role }, token }),
  deleteUser: (token, id) =>
    request(`/users/${id}`, { method: "DELETE", token }),
  getDrivers: (token) => request("/drivers", { token }),

  getVehicleCalendar: (token, startDate, endDate) => request(`/bookings/calendar?start=${startDate}&end=${endDate}`, { token }),

  getAdminStats: (token) => request('/bookings/stats', { token }),

  updateBooking: (token, id, data) =>
    request(`/bookings/${id}`, {
      method: 'PATCH',
      token,
      body: data,
    }),
};
