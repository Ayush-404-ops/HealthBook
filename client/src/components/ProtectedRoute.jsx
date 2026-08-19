import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner fullPage message="Verifying authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Role mismatch, route to appropriate dashboard
    const redirectPath =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'doctor'
        ? '/doctor'
        : '/patient';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
