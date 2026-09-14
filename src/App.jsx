import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BookingList from './pages/BookingList.jsx';
import NewBooking from './pages/NewBooking.jsx';
import BookingDetail from './pages/BookingDetail.jsx';
import Approvals from './pages/Approvals.jsx';
import Profile from './pages/Profile.jsx';
import ManageFleet from './pages/ManageFleet.jsx';
import ManageUsers from './pages/ManageUsers.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import BookingPrint from './pages/BookingPrint.jsx';
import VehicleAvailability from './pages/VehicleAvailability.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/new" element={<PrivateRoute><NewBooking /></PrivateRoute>} />
      <Route path="/bookings" element={<PrivateRoute><BookingList /></PrivateRoute>} />
      <Route path="/bookings/:id" element={<PrivateRoute><BookingDetail /></PrivateRoute>} />
      <Route path="/bookings/:id/print" element={<PrivateRoute><BookingPrint /></PrivateRoute>} />
      <Route path="/approvals" element={<PrivateRoute><Approvals /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/manage-fleet" element={<PrivateRoute><ManageFleet /></PrivateRoute>} />
      <Route path="/manage-users" element={<PrivateRoute><ManageUsers /></PrivateRoute>} />
      <Route path="/availability" element={<PrivateRoute><VehicleAvailability /></PrivateRoute>} />
      <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
    </Routes>
  );
}