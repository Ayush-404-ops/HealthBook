import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHeart, FiLogOut, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/doctor';
    return '/patient';
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to={isAuthenticated ? getDashboardPath() : '/'} className="navbar-logo">
          <div className="navbar-logo-icon">
            <FiHeart color="#080d1a" size={20} />
          </div>
          <span>Health<span className="text-gradient">Book</span></span>
        </Link>

        <nav className="navbar-links">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/login"
                className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          ) : (
            <div className="navbar-user">
              <span className={`badge badge-${user.role === 'admin' ? 'danger' : user.role === 'doctor' ? 'info' : 'primary'}`}>
                {user.role?.toUpperCase()}
              </span>
              <div className="navbar-avatar" title={user.name}>
                {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                title="Sign Out"
                style={{ marginLeft: '8px' }}
              >
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
