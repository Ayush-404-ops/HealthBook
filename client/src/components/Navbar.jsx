import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getRoleDashboardPath } from '../utils/roleUtils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show navbar on auth pages or landing
  const hideOn = ['/login', '/register', '/unauthorized', '/'];
  if (hideOn.includes(location.pathname)) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <button
          onClick={() => navigate(getRoleDashboardPath(user))}
          className="navbar-logo"
          style={{ background: 'none', border: 'none' }}
        >
          <span className="navbar-logo-icon">🩺</span>
          <span>HealthBook</span>
        </button>

        {/* Right side */}
        <div className="navbar-user">
          {/* Emergency button — visible to all logged-in users */}
          {user && (
            <button
              onClick={() => navigate('/nearby-hospitals')}
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 107, 107, 0.15)',
                color: 'var(--clr-danger)',
                border: '1.5px solid rgba(255, 107, 107, 0.35)',
                borderRadius: 'var(--r-full)',
                fontWeight: 700,
                animation: 'pulse-glow 2s infinite',
              }}
            >
              🚨 Nearby Hospitals
            </button>
          )}

          {user && (
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
              {user.name}{' '}
              <span className="badge badge-primary" style={{ marginLeft: '4px', textTransform: 'capitalize' }}>
                {user.role}
              </span>
            </span>
          )}

          {user && (
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
