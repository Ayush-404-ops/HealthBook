import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import {
  FiShield,
  FiUsers,
  FiActivity,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiAward,
  FiMail,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchDoctors();
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch platform statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await api.get('/admin/doctors', {
        params: { status: statusFilter },
      });
      if (res.data?.success) {
        setDoctors(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch doctor applications');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleApprove = async (doctorId) => {
    setActionId(doctorId);
    try {
      const res = await api.put(`/admin/doctors/${doctorId}/approve`);
      if (res.data?.success) {
        toast.success('Doctor account approved!');
        fetchDoctors();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve doctor');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (doctorId) => {
    setActionId(doctorId);
    try {
      const res = await api.put(`/admin/doctors/${doctorId}/reject`);
      if (res.data?.success) {
        toast.success('Doctor account set to pending/rejected');
        fetchDoctors();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update doctor status');
    } finally {
      setActionId(null);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const name = doc.user?.name || '';
    const email = doc.user?.email || '';
    const query = searchTerm.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  return (
    <div className="page">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header animate-fade-up">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h1>Administration Console</h1>
              <p>Platform metrics overview, practitioner approvals, and system management.</p>
            </div>
            <span className="badge badge-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Root Administrator: {user?.email}
            </span>
          </div>
        </div>

        {/* Platform Stats Grid */}
        <div className="stats-grid animate-fade-up">
          <div className="stat-card">
            <div className="stat-card-icon teal">
              <FiUsers color="var(--clr-primary)" />
            </div>
            <div className="stat-card-value">
              {loadingStats ? '...' : stats.totalPatients}
            </div>
            <div className="stat-card-label">Registered Patients</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon blue">
              <FiShield color="var(--clr-accent)" />
            </div>
            <div className="stat-card-value">
              {loadingStats ? '...' : stats.totalDoctors}
            </div>
            <div className="stat-card-label">Total Practitioners</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon pink">
              <FiActivity color="var(--clr-danger)" />
            </div>
            <div className="stat-card-value">
              {loadingStats ? '...' : stats.totalAppointments}
            </div>
            <div className="stat-card-label">Booked Appointments</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon gold">
              <FiDollarSign color="var(--clr-warning)" />
            </div>
            <div className="stat-card-value">
              {loadingStats ? '...' : `₹${stats.totalRevenue}`}
            </div>
            <div className="stat-card-label">Gross Platform Volume</div>
          </div>
        </div>

        {/* Doctor Verification Management Table */}
        <div className="card animate-fade-up" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Practitioner Verification Pipeline</h2>
              <p style={{ fontSize: '0.88rem' }}>Review doctor registration requests and grant scheduling permissions.</p>
            </div>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="input-group" style={{ width: '200px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Search doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="input"
                style={{ width: '180px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loadingDoctors ? (
            <Spinner message="Loading doctor accounts..." />
          ) : filteredDoctors.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="empty-state-icon">📋</div>
              <h3>No Doctors Match Filter</h3>
              <p>No doctor applications found for the selected criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--clr-border)',
                      textAlign: 'left',
                      color: 'var(--clr-text-muted)',
                    }}
                  >
                    <th style={{ padding: '12px' }}>Doctor Name</th>
                    <th style={{ padding: '12px' }}>Contact Email</th>
                    <th style={{ padding: '12px' }}>Specialty</th>
                    <th style={{ padding: '12px' }}>Fee (₹)</th>
                    <th style={{ padding: '12px' }}>Exp.</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doc) => (
                    <tr
                      key={doc._id}
                      style={{
                        borderBottom: '1px solid var(--clr-border)',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <td style={{ padding: '14px 12px', fontWeight: 600 }}>
                        Dr. {doc.user?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 12px', color: 'var(--clr-text-muted)' }}>
                        {doc.user?.email || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span className="badge badge-info">{doc.specialty || 'General'}</span>
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--clr-primary)' }}>
                        ₹{doc.fee}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        {doc.experienceYears} Yrs
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span
                          className={`badge ${
                            doc.isApproved ? 'badge-success' : 'badge-warning'
                          }`}
                        >
                          {doc.isApproved ? 'APPROVED' : 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            gap: '8px',
                            justifyContent: 'flex-end',
                          }}
                        >
                          {!doc.isApproved ? (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={actionId === doc._id}
                              onClick={() => handleApprove(doc._id)}
                            >
                              <FiCheckCircle /> Approve
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              disabled={actionId === doc._id}
                              onClick={() => handleReject(doc._id)}
                            >
                              <FiXCircle /> Revoke Approval
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
