import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state animate-fade-up">
        <div className="empty-state-icon" style={{ color: 'var(--clr-danger)' }}>
          <FiAlertCircle />
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '8px' }}>404</h1>
        <h2>Page Not Found</h2>
        <p style={{ maxWidth: '400px', margin: '8px auto 24px auto' }}>
          The link you followed doesn't exist or was moved. Let's get you back on track.
        </p>
        <Link to="/" className="btn btn-primary">
          <FiHome /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
