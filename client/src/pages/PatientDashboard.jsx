import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiClock, FiCheckCircle, FiSearch } from 'react-icons/fi';

const PatientDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-header animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1>Welcome back, <span className="text-gradient">{user?.name}</span></h1>
              <p>Find specialized doctors, navigate symptoms with AI, and track appointments.</p>
            </div>
            <span className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Patient Portal
            </span>
          </div>
        </div>

        {/* Quick stats banner */}
        <div className="stats-grid animate-fade-up">
          <div className="stat-card">
            <div className="stat-card-icon teal">
              <FiCalendar color="var(--clr-primary)" />
            </div>
            <div className="stat-card-value">0</div>
            <div className="stat-card-label">Upcoming Appointments</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon blue">
              <FiClock color="var(--clr-accent)" />
            </div>
            <div className="stat-card-value">0</div>
            <div className="stat-card-label">Pending Confirmation</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon pink">
              <FiCheckCircle color="var(--clr-success)" />
            </div>
            <div className="stat-card-value">0</div>
            <div className="stat-card-label">Completed Consultations</div>
          </div>
        </div>

        {/* Phase 1 placeholder info card */}
        <div className="card card-glass animate-fade-up" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🩺</div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Phase 1 Initialized Successfully</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 24px auto' }}>
            Your account is authenticated via HttpOnly cookie. In Phase 2 & 3, this dashboard will feature full doctor discovery, real-time slot selection, AI symptom triage, and Razorpay checkout.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-success">✓ Auth State Active</span>
            <span className="badge badge-info">✓ Cookie-Based Sessions</span>
            <span className="badge badge-warning">⏳ Booking Loop Coming in Phase 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
