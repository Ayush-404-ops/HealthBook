import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHeart, FiUser, FiActivity, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialty: '',
    fee: '',
    experienceYears: '',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
        ...(role === 'doctor' && {
          specialty: formData.specialty,
          fee: Number(formData.fee) || 0,
          experienceYears: Number(formData.experienceYears) || 0,
        }),
      };

      const newUser = await register(payload);
      toast.success(`Account created! Welcome, ${newUser.name}`);

      const dest =
        newUser.role === 'admin'
          ? '/admin'
          : newUser.role === 'doctor'
          ? '/doctor'
          : '/patient';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <FiHeart color="#080d1a" />
          </div>
          <div>
            <h2 className="auth-logo-text">Health<span className="text-gradient">Book</span></h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Create your account to get started</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role selector */}
          <div className="input-group">
            <label>Register as</label>
            <div className="role-selector">
              <div
                className={`role-option ${role === 'patient' ? 'active' : ''}`}
                onClick={() => setRole('patient')}
              >
                <span className="role-icon">👤</span>
                <span className="role-label">Patient</span>
              </div>
              <div
                className={`role-option ${role === 'doctor' ? 'active' : ''}`}
                onClick={() => setRole('doctor')}
              >
                <span className="role-icon">🩺</span>
                <span className="role-label">Doctor</span>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              placeholder={role === 'doctor' ? 'Dr. Sarah Jenkins' : 'Alex Mercer'}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {role === 'doctor' && (
            <>
              <div className="input-group">
                <label htmlFor="specialty">Specialty *</label>
                <select
                  id="specialty"
                  name="specialty"
                  className="input"
                  value={formData.specialty}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Specialty</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Orthopedist">Orthopedist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                  <option value="ENT Specialist">ENT Specialist</option>
                  <option value="Dentist">Dentist</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label htmlFor="fee">Consult Fee (₹)</label>
                  <input
                    id="fee"
                    name="fee"
                    type="number"
                    min="0"
                    step="50"
                    className="input"
                    placeholder="500"
                    value={formData.fee}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="experienceYears">Experience (Years)</label>
                  <input
                    id="experienceYears"
                    name="experienceYears"
                    type="number"
                    min="0"
                    className="input"
                    placeholder="5"
                    value={formData.experienceYears}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <label htmlFor="password">Password (min 6 characters) *</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              <>
                Create Account <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
