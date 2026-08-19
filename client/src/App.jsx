import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Public route that redirects to dashboard if already authenticated
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && user) {
    const dest =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'doctor'
        ? '/doctor'
        : '/patient';
    return <Navigate to={dest} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Role-Based Portals */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f1629',
              color: '#e8edf5',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
