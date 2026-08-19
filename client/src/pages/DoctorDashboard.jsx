import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiCalendar, FiClock, FiCheckSquare } from 'react-icons/fi';

const DoctorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-header animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1>Doctor Portal — <span className="text-gradient">{user?.name}</span></h1>
              <p>Manage your clinical schedule, patient consultations, and appointment requests.</p>
            </div>
            <span className="badge badge-info" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Doctor Portal
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="stats-grid animate-fade-up">
          <div className="stat-card">
            <div className="stat-card-icon blue">
              <FiCalendar color="var(--clr-accent)" />
            </div>
            <div className="stat-card-value">0</div>
            <div className="stat-card-label">Appointments Today</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon teal">
              <FiUsers color="var(--clr-primary)" />
            </div>
            <div className="stat-card-value">0</div>
            <div className="stat-card-label">Total Patients</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon gold">
              <FiClock color="var(--clr-warning)" />
            </div>
            <div className="stat-card-value">30m</div>
            <div className="stat-card-label">Default Slot Duration</div>
          </div>
        </div>

        {/* Phase 1 placeholder info card */}
        <div className="card card-glass animate-fade-up" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📋</div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Doctor Workspace Ready</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 24px auto' }}>
            In Phase 2, this portal will feature full profile configuration (specialty, consultation fee, bio, years of experience) and weekly recurring availability rule setup.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-success">✓ Doctor Account Verified</span>
            <span className="badge badge-info">✓ Protected Route Verified</span>
            <span className="badge badge-warning">⏳ Schedule Management Coming in Phase 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
