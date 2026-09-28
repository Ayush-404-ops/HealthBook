import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiCalendar, FiShield, FiCpu, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleUtils';

const Landing = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="landing-hero">
      <div className="landing-glow-1" />
      <div className="landing-glow-2" />

      <div className="container">
        <div className="landing-content">
          <div className="landing-eyebrow">
            <FiShield /> Modern Healthcare Platform
          </div>

          <h1 className="landing-title">
            Smart doctor bookings, powered by <span className="text-gradient">AI navigation</span>.
          </h1>

          <p className="landing-subtitle">
            HealthBook bridges patients and top medical professionals effortlessly.
            Describe your symptoms to get instant specialty recommendations, book verified slots,
            and pay securely via Razorpay.
          </p>

          <div className="landing-actions">
            {isAuthenticated ? (
              <Link to={getRoleDashboardPath(user)} className="btn btn-primary btn-lg">
                Go to Your Dashboard <FiArrowRight />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Book an Appointment <FiArrowRight />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon" style={{ color: 'var(--clr-primary)' }}>
              <FiCpu />
            </div>
            <h3 className="feature-title">AI Care Navigator</h3>
            <p>
              Not sure which specialist to see? Simply describe what you are feeling and get intelligent, instant guidance.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ color: 'var(--clr-accent)' }}>
              <FiCalendar />
            </div>
            <h3 className="feature-title">Real-Time Slot Engine</h3>
            <p>
              View live availability for verified specialists and book confirmed 30-minute appointment slots with zero conflicts.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ color: 'var(--clr-success)' }}>
              <FiCheckCircle />
            </div>
            <h3 className="feature-title">Seamless Payments</h3>
            <p>
              Fast and secure consultation checkouts powered by Razorpay with automated payment verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
