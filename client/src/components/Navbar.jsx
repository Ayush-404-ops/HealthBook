import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show navbar on auth pages
  const hideOn = ['/login', '/register', '/unauthorized'];
  if (hideOn.includes(location.pathname)) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'doctor') return '/doctor';
    if (user?.role === 'admin') return '/admin';
    return '/patient';
  };

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <button
        onClick={() => navigate(getDashboardPath())}
        className="text-xl font-bold text-blue-600 hover:text-blue-700 transition"
      >
        HealthBook
      </button>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Emergency button — visible to all logged-in users */}
        {user && (
          <button
            onClick={() => navigate('/nearby-hospitals')}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition animate-pulse"
          >
            🚨 Nearby Hospitals
          </button>
        )}

        {user && (
          <span className="text-sm text-gray-600 hidden sm:block">
            {user.name} &nbsp;
            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full capitalize">
              {user.role}
            </span>
          </span>
        )}

        {user && (
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-red-300 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
