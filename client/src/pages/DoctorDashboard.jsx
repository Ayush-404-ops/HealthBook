import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiClock,
  FiCalendar,
  FiDollarSign,
  FiAward,
  FiSave,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedist',
  'Pulmonologist',
  'Gastroenterologist',
  'Endocrinologist',
  'Psychiatrist',
  'ENT Specialist',
  'Ophthalmologist',
  'Gynecologist',
  'Pediatrician',
  'Urologist',
  'Nephrologist',
  'Oncologist',
  'Rheumatologist',
  'Dentist',
];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    specialty: '',
    fee: 0,
    bio: '',
    experienceYears: 0,
    slotDurationMinutes: 30,
    availability: [],
    isApproved: false,
  });

  // Fetch doctor profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors/me/profile');
      if (res.data?.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: name === 'fee' || name === 'experienceYears' || name === 'slotDurationMinutes'
        ? Number(value)
        : value,
    }));
  };

  const handleAddAvailability = () => {
    // Find first weekday not already added
    const usedDays = profile.availability.map((a) => a.day);
    const availableDay = WEEKDAYS.find((d) => !usedDays.includes(d)) || 'Monday';

    setProfile((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        { day: availableDay, startTime: '09:00', endTime: '17:00' },
      ],
    }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    setProfile((prev) => {
      const updated = [...prev.availability];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, availability: updated };
    });
  };

  const handleRemoveAvailability = (index) => {
    setProfile((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/doctors/profile', profile);
      if (res.data?.success) {
        setProfile(res.data.data);
        toast.success('Doctor profile and availability updated!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner fullPage message="Loading doctor dashboard..." />;
  }

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
              <h1>
                Doctor Workspace — <span className="text-gradient">Dr. {user?.name}</span>
              </h1>
              <p>Manage your medical profile, consultation fees, and weekly schedule.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                className={`badge ${
                  profile.isApproved ? 'badge-success' : 'badge-warning'
                }`}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                {profile.isApproved ? (
                  <>
                    <FiCheckCircle style={{ marginRight: '4px' }} /> Approved Practitioner
                  </>
                ) : (
                  <>
                    <FiAlertCircle style={{ marginRight: '4px' }} /> Approval Pending (Admin)
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {!profile.isApproved && (
          <div className="alert alert-error animate-fade-up" style={{ marginBottom: '24px' }}>
            <FiAlertCircle size={20} />
            <div>
              <strong>Account Pending Admin Verification:</strong> Complete your profile and schedule below. Once an administrator approves your account, patients can discover and book consultations with you.
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid animate-fade-up">
          <div className="stat-card">
            <div className="stat-card-icon teal">
              <FiAward color="var(--clr-primary)" />
            </div>
            <div className="stat-card-value">{profile.experienceYears || 0} Yrs</div>
            <div className="stat-card-label">Medical Experience</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon gold">
              <FiDollarSign color="var(--clr-warning)" />
            </div>
            <div className="stat-card-value">₹{profile.fee || 0}</div>
            <div className="stat-card-label">Consultation Fee</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon blue">
              <FiClock color="var(--clr-accent)" />
            </div>
            <div className="stat-card-value">{profile.slotDurationMinutes || 30}m</div>
            <div className="stat-card-label">Slot Duration</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon teal">
              <FiCalendar color="var(--clr-primary)" />
            </div>
            <div className="stat-card-value">{profile.availability?.length || 0} Days</div>
            <div className="stat-card-label">Active Working Days</div>
          </div>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            {/* Left Card: Clinical Profile */}
            <div className="card animate-fade-up">
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiUser color="var(--clr-primary)" /> Clinical Details
              </h3>

              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="specialty">Medical Specialty *</label>
                <select
                  id="specialty"
                  name="specialty"
                  className="input"
                  value={profile.specialty}
                  onChange={handleProfileChange}
                  required
                >
                  <option value="">Select Specialty</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                <div className="input-group">
                  <label htmlFor="fee">Consultation Fee (₹) *</label>
                  <input
                    id="fee"
                    name="fee"
                    type="number"
                    min="0"
                    step="50"
                    className="input"
                    placeholder="500"
                    value={profile.fee}
                    onChange={handleProfileChange}
                    required
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
                    value={profile.experienceYears}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="slotDurationMinutes">Slot Duration (Minutes)</label>
                <select
                  id="slotDurationMinutes"
                  name="slotDurationMinutes"
                  className="input"
                  value={profile.slotDurationMinutes}
                  onChange={handleProfileChange}
                >
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="bio">Professional Bio & Qualifications</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className="input"
                  placeholder="Describe your medical education, hospital affiliations, specialized treatments..."
                  value={profile.bio}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            {/* Right Card: Weekly Availability */}
            <div className="card animate-fade-up">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCalendar color="var(--clr-accent)" /> Weekly Schedule Rules
                </h3>
                <button
                  type="button"
                  onClick={handleAddAvailability}
                  className="btn btn-outline btn-sm"
                  disabled={profile.availability?.length >= 7}
                >
                  <FiPlus /> Add Day
                </button>
              </div>

              {profile.availability?.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 16px' }}>
                  <div className="empty-state-icon">🗓️</div>
                  <p>No availability rules set yet.</p>
                  <button
                    type="button"
                    onClick={handleAddAvailability}
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: '12px' }}
                  >
                    Add Working Hours
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {profile.availability.map((rule, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1fr 1fr auto',
                        gap: '8px',
                        alignItems: 'center',
                        background: 'var(--clr-surface)',
                        padding: '12px',
                        borderRadius: 'var(--r-md)',
                        border: '1px solid var(--clr-border)',
                      }}
                    >
                      <select
                        className="input"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                        value={rule.day}
                        onChange={(e) =>
                          handleAvailabilityChange(idx, 'day', e.target.value)
                        }
                      >
                        {WEEKDAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>

                      <input
                        type="time"
                        className="input"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                        value={rule.startTime}
                        onChange={(e) =>
                          handleAvailabilityChange(idx, 'startTime', e.target.value)
                        }
                      />

                      <input
                        type="time"
                        className="input"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                        value={rule.endTime}
                        onChange={(e) =>
                          handleAvailabilityChange(idx, 'endTime', e.target.value)
                        }
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveAvailability(idx)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.4rem 0.6rem' }}
                        title="Remove Day"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Action Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
            }}
          >
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving}
            >
              {saving ? (
                'Saving Profile...'
              ) : (
                <>
                  <FiSave /> Save Doctor Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorDashboard;
