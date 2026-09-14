import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';

export default function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-50 text-ink-500 text-sm">
        กำลังโหลด...
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
