import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiUsers, FiActivity, FiDollarSign } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-header animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1>Administration Console</h1>
              <p>Platform overview, doctor verification pipeline, and revenue metrics.</p>
            </div>
            <span className="badge badge-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Admin Access: {user?.email}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid animate-fade-up">
          <div className="stat-card">
            <div className="stat-card-icon teal">
              <FiUsers color="var(--clr-primary)" />
            </div>
            <div className="stat-card-value">0</div>
            <div className="stat-card-label">Total Registered Users</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon blue">
              <FiActivity color="var(--clr-accent)" />
            </div>
            <div className="stat-card-value">0</div>
            <div className="stat-card-label">Pending Doctor Approvals</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon gold">
              <FiDollarSign color="var(--clr-warning)" />
            </div>
            <div className="stat-card-value">₹0</div>
            <div className="stat-card-label">Platform Gross Volume</div>
          </div>
        </div>

        {/* Phase 1 placeholder info card */}
        <div className="card card-glass animate-fade-up" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Admin Control Center Ready</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 24px auto' }}>
            In Phase 4, this console will feature the live doctor approval pipeline, user audit logs, and global booking analytics directly connected to MongoDB aggregations.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-success">✓ Admin Role Guard Active</span>
            <span className="badge badge-danger">✓ Root Seed Account Connected</span>
            <span className="badge badge-warning">⏳ Approval Management Coming in Phase 4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
