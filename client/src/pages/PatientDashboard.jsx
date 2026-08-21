import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiCalendar,
  FiClock,
  FiUserCheck,
  FiDollarSign,
  FiAward,
  FiX,
  FiChevronRight,
  FiCheckCircle,
} from 'react-icons/fi';

const SPECIALTIES = [
  'All Specialties',
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

const PatientDashboard = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [maxFee, setMaxFee] = useState('');

  // Selected doctor modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, maxFee]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSpecialty && selectedSpecialty !== 'All Specialties') {
        params.specialty = selectedSpecialty;
      }
      if (maxFee) {
        params.maxFee = maxFee;
      }

      const res = await api.get('/doctors', { params });
      if (res.data?.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch doctor directory');
    } finally {
      setLoading(false);
    }
  };

  // Client-side search by doctor name
  const filteredDoctors = doctors.filter((doc) => {
    const name = doc.user?.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
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
              <h1>
                Welcome, <span className="text-gradient">{user?.name}</span>
              </h1>
              <p>Explore verified specialists, check availability, and schedule appointments.</p>
            </div>
            <span className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Patient Portal
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div
          className="card animate-fade-up"
          style={{ marginBottom: '32px', padding: '20px' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              alignItems: 'end',
            }}
          >
            {/* Search Input */}
            <div className="input-group">
              <label htmlFor="search">Search Doctor</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="search"
                  type="text"
                  className="input"
                  placeholder="Search by doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Specialty Dropdown */}
            <div className="input-group">
              <label htmlFor="specialty-filter">Specialty</label>
              <select
                id="specialty-filter"
                className="input"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                {SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Fee Filter */}
            <div className="input-group">
              <label htmlFor="max-fee">Max Consultation Fee (₹)</label>
              <input
                id="max-fee"
                type="number"
                min="0"
                step="100"
                className="input"
                placeholder="e.g. 1000"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
              />
            </div>

            {/* Reset Button */}
            <div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: '100%' }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('All Specialties');
                  setMaxFee('');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Listing Grid */}
        {loading ? (
          <Spinner message="Searching medical specialists..." />
        ) : filteredDoctors.length === 0 ? (
          <div className="card empty-state animate-fade-up">
            <div className="empty-state-icon">🩺</div>
            <h3>No Verified Doctors Found</h3>
            <p>Try adjusting your search query or clearing filters.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="card animate-fade-up"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
                        Dr. {doctor.user?.name}
                      </h3>
                      <span className="badge badge-info">{doctor.specialty || 'General Practitioner'}</span>
                    </div>
                    <span
                      className="badge badge-primary"
                      style={{ fontSize: '0.9rem', fontWeight: 700 }}
                    >
                      ₹{doctor.fee}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {doctor.bio || 'No bio provided.'}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '0.82rem',
                      color: 'var(--clr-text-muted)',
                      marginBottom: '16px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiAward color="var(--clr-primary)" /> {doctor.experienceYears || 0} Yrs Exp.
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiClock color="var(--clr-accent)" /> {doctor.slotDurationMinutes || 30}m Slot
                    </span>
                  </div>

                  {/* Availability Days */}
                  <div>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--clr-text-muted)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Working Days:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {doctor.availability && doctor.availability.length > 0 ? (
                        doctor.availability.map((a, i) => (
                          <span
                            key={i}
                            className="badge badge-primary"
                            style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                          >
                            {a.day.slice(0, 3)} ({a.startTime})
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-dim)' }}>
                          Schedule not listed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  View Details & Schedule <FiChevronRight />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Doctor Details Modal */}
        {selectedDoctor && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(8, 13, 26, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              className="card animate-fade-up"
              style={{
                width: '100%',
                maxWidth: '560px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="btn btn-ghost btn-sm"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '6px',
                }}
              >
                <FiX size={20} />
              </button>

              <h2 style={{ marginBottom: '4px' }}>Dr. {selectedDoctor.user?.name}</h2>
              <span className="badge badge-info" style={{ marginBottom: '16px' }}>
                {selectedDoctor.specialty || 'General Practitioner'}
              </span>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  marginBottom: '20px',
                  background: 'var(--clr-surface)',
                  padding: '12px',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Fee</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-primary)' }}>
                    ₹{selectedDoctor.fee}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                    Experience
                  </span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                    {selectedDoctor.experienceYears} Years
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                    Consultation
                  </span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-accent)' }}>
                    {selectedDoctor.slotDurationMinutes} Mins
                  </p>
                </div>
              </div>

              <h4 style={{ marginBottom: '8px' }}>About Practitioner</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>
                {selectedDoctor.bio || 'No bio specified by the doctor.'}
              </p>

              <h4 style={{ marginBottom: '8px' }}>Weekly Working Hours</h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '24px',
                }}
              >
                {selectedDoctor.availability && selectedDoctor.availability.length > 0 ? (
                  selectedDoctor.availability.map((rule, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'var(--clr-surface)',
                        borderRadius: 'var(--r-sm)',
                        fontSize: '0.88rem',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{rule.day}</span>
                      <span style={{ color: 'var(--clr-primary)' }}>
                        {rule.startTime} - {rule.endTime}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                    No weekly working schedule set yet.
                  </p>
                )}
              </div>

              <div className="alert alert-success" style={{ marginBottom: '16px' }}>
                <FiCheckCircle size={18} />
                <span>
                  Booking engine (slot picker & payment) will be connected in Phase 3!
                </span>
              </div>

              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: '100%' }}
                onClick={() => setSelectedDoctor(null)}
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
