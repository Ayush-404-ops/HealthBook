import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleUtils';

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state animate-fade-up">
        <div className="empty-state-icon" style={{ fontSize: '4rem', opacity: 1 }}>
          🚫
        </div>
        <h2>Access Denied</h2>
        <p style={{ maxWidth: '400px', margin: '8px auto 24px auto' }}>
          You do not have permission to view this page.
        </p>
        <Link to={user ? getRoleDashboardPath(user) : '/'} className="btn btn-primary">
          <FiHome /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
