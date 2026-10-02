import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { CommandPalette } from './components/ui/CommandPalette';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Unauthorized = lazy(() => import('./pages/Unauthorized.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard.jsx'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const NearbyHospitals = lazy(() => import('./pages/NearbyHospitals.jsx'));

const PageFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-teal-600 dark:text-teal-400">
    <Loader2 className="w-8 h-8 animate-spin mb-2" />
    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading page...</span>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <CommandPalette />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

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
          <Route
            path="/nearby-hospitals"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
                <NearbyHospitals />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
