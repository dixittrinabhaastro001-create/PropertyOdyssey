import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    // normalize roles to avoid casing mismatches
    const allowedNormalized = allowedRoles.map(r => r.toLowerCase());
    const userRole = (user.role || '').toLowerCase();
    if (!allowedNormalized.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
