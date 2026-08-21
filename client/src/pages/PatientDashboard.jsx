import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import SlotPicker from '../components/SlotPicker';
import SymptomNavigator from '../components/SymptomNavigator';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiUser,
  FiDollarSign,
  FiAward,
  FiX,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiCreditCard,
  FiCpu,
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
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'appointments'

  // Directory State
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [maxFee, setMaxFee] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Appointments State
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [payingApptId, setPayingApptId] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchMyAppointments();
  }, [selectedSpecialty, maxFee]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
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
      setLoadingDoctors(false);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const res = await api.get('/appointments/mine');
      if (res.data?.success) {
        setMyAppointments(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch your appointments');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await api.patch(`/appointments/${id}/cancel`);
      if (res.data?.success) {
        toast.success('Appointment cancelled');
        fetchMyAppointments();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
    }
  };

  // Phase 5: Razorpay Checkout Handler
  const handlePayNow = async (appointmentId) => {
    setPayingApptId(appointmentId);
    try {
      // 1. Create Razorpay order on backend
      const orderRes = await api.post('/payments/create-order', { appointmentId });
      if (!orderRes.data?.success) {
        throw new Error(orderRes.data?.message || 'Order creation failed');
      }

      const { orderId, amount, currency, keyId } = orderRes.data.data;

      // 2. Configure Razorpay Modal Options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'HealthBook Medical',
        description: 'Doctor Consultation Checkout',
        order_id: orderId,
        handler: async (response) => {
          try {
            // 3. Verify Payment Signature
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId,
            });

            if (verifyRes.data?.success) {
              toast.success('Payment verified & consultation confirmed! 🎉');
              fetchMyAppointments();
            }
          } catch (err) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#00d4aa',
        },
      };

      if (!window.Razorpay) {
        toast.error('Razorpay SDK failed to load. Please refresh the page.');
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setPayingApptId(null);
    }
  };

  const handleBookingSuccess = (newAppointment) => {
    setSelectedDoctor(null);
    fetchMyAppointments();
    setActiveTab('appointments');
  };

  // Client-side search by doctor name
  const filteredDoctors = doctors.filter((doc) => {
    const name = doc.user?.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
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
                Patient Portal — <span className="text-gradient">{user?.name}</span>
              </h1>
              <p>Explore specialists, navigate symptoms with AI, and manage consultations.</p>
            </div>
            <span className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Patient Account
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            borderBottom: '1px solid var(--clr-border)',
            paddingBottom: '12px',
          }}
        >
          <button
            className={`btn ${activeTab === 'directory' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('directory')}
          >
            <FiSearch /> Find Specialists ({doctors.length})
          </button>
          <button
            className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('appointments')}
          >
            <FiCalendar /> My Appointments ({myAppointments.length})
          </button>
        </div>

        {/* TAB 1: Doctor Directory & AI Symptom Navigator */}
        {activeTab === 'directory' && (
          <>
            {/* Phase 6: AI Symptom Navigator */}
            <SymptomNavigator
              onApplySpecialty={(spec) => {
                setSelectedSpecialty(spec);
              }}
            />

            {/* Filter Bar */}
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
                <div className="input-group">
                  <label htmlFor="search">Search Doctor Name</label>
                  <input
                    id="search"
                    type="text"
                    className="input"
                    placeholder="Search doctor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="specialty-filter">Specialty Filter</label>
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

                <div className="input-group">
                  <label htmlFor="max-fee">Max Fee (₹)</label>
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

            {/* Doctor Cards Grid */}
            {loadingDoctors ? (
              <Spinner message="Searching verified specialists..." />
            ) : filteredDoctors.length === 0 ? (
              <div className="card empty-state animate-fade-up">
                <div className="empty-state-icon">🩺</div>
                <h3>No Verified Doctors Found</h3>
                <p>Try adjusting your search terms or fee filter.</p>
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
                          Working Schedule:
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
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '8px' }}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      Book Consultation <FiChevronRight />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB 2: My Appointments & Razorpay Pay Now */}
        {activeTab === 'appointments' && (
          <div>
            {loadingAppointments ? (
              <Spinner message="Fetching your appointments..." />
            ) : myAppointments.length === 0 ? (
              <div className="card empty-state animate-fade-up">
                <div className="empty-state-icon">🗓️</div>
                <h3>No Appointments Yet</h3>
                <p>Browse our verified specialists and book your first consultation slot.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: '16px' }}
                  onClick={() => setActiveTab('directory')}
                >
                  Find a Doctor
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {myAppointments.map((appt) => {
                  const statusClass =
                    appt.status === 'confirmed'
                      ? 'badge-success'
                      : appt.status === 'completed'
                      ? 'badge-info'
                      : appt.status === 'cancelled'
                      ? 'badge-danger'
                      : 'badge-warning';

                  const isUnpaid = appt.payment?.status === 'unpaid' && appt.status !== 'cancelled';

                  return (
                    <div
                      key={appt._id}
                      className="card animate-fade-up"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <h3 style={{ fontSize: '1.2rem' }}>
                            Dr. {appt.doctor?.user?.name || 'Practitioner'}
                          </h3>
                          <span className={`badge ${statusClass}`}>
                            {appt.status?.toUpperCase()}
                          </span>
                          <span
                            className={`badge ${
                              appt.payment?.status === 'paid' ? 'badge-success' : 'badge-warning'
                            }`}
                          >
                            {appt.payment?.status === 'paid' ? 'PAID ✓' : 'UNPAID'}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', marginBottom: '8px' }}>
                          <strong style={{ color: 'var(--clr-text)' }}>Specialty:</strong>{' '}
                          {appt.doctor?.specialty || 'General'}
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            fontSize: '0.88rem',
                            color: 'var(--clr-text-muted)',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiCalendar color="var(--clr-primary)" /> {appt.date}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiClock color="var(--clr-accent)" /> {appt.startTime}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiDollarSign color="var(--clr-warning)" /> ₹{appt.payment?.amount || appt.doctor?.fee}
                          </span>
                        </div>

                        {appt.notes && (
                          <p
                            style={{
                              marginTop: '8px',
                              fontSize: '0.85rem',
                              fontStyle: 'italic',
                              color: 'var(--clr-text-dim)',
                            }}
                          >
                            Note: "{appt.notes}"
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Phase 5: Razorpay Pay Now button */}
                        {isUnpaid && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={payingApptId === appt._id}
                            onClick={() => handlePayNow(appt._id)}
                          >
                            <FiCreditCard /> {payingApptId === appt._id ? 'Processing...' : `Pay Now (₹${appt.payment?.amount || appt.doctor?.fee})`}
                          </button>
                        )}

                        {['pending', 'confirmed'].includes(appt.status) && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelAppointment(appt._id)}
                          >
                            <FiXCircle /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Doctor Booking Modal */}
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
                maxWidth: '600px',
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

              {/* SlotPicker */}
              <SlotPicker doctor={selectedDoctor} onBookingSuccess={handleBookingSuccess} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
