import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Spinner from './Spinner';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiCheck, FiFileText } from 'react-icons/fi';

const SlotPicker = ({ doctor, onBookingSuccess }) => {
  // Today's date in YYYY-MM-DD format
  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [date, setDate] = useState(getTodayString());
  const [slots, setSlots] = useState([]);
  const [weekday, setWeekday] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (doctor?._id && date) {
      fetchSlots();
    }
  }, [doctor?._id, date]);

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);
      setSelectedSlot('');
      setMessage('');
      const res = await api.get(`/doctors/${doctor._id}/slots`, {
        params: { date },
      });
      if (res.data?.success) {
        setSlots(res.data.data || []);
        setWeekday(res.data.weekday || '');
        if (res.data.message) {
          setMessage(res.data.message);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch available slots');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setBooking(true);
    try {
      const res = await api.post('/appointments', {
        doctorId: doctor._id,
        date,
        startTime: selectedSlot,
        notes,
      });

      if (res.data?.success) {
        toast.success('Appointment booked successfully!');
        if (onBookingSuccess) {
          onBookingSuccess(res.data.data);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FiCalendar color="var(--clr-primary)" /> Select Date & Time Slot
      </h3>

      {/* Date Picker */}
      <div className="input-group" style={{ marginBottom: '16px' }}>
        <label htmlFor="booking-date">Consultation Date</label>
        <input
          id="booking-date"
          type="date"
          className="input"
          min={getTodayString()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Time Slots */}
      {loadingSlots ? (
        <div style={{ padding: '24px 0' }}>
          <Spinner message="Checking doctor schedule..." />
        </div>
      ) : message ? (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {message}
        </div>
      ) : slots.length === 0 ? (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          No open slots available for {weekday} ({date}). Please try another date.
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--clr-text-muted)', display: 'block', marginBottom: '8px' }}>
            Available Time Slots ({weekday})
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '8px',
              maxHeight: '180px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--r-md)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: isSelected
                      ? '1.5px solid var(--clr-primary)'
                      : '1px solid var(--clr-border)',
                    background: isSelected
                      ? 'var(--clr-primary-glow)'
                      : 'var(--clr-surface)',
                    color: isSelected ? 'var(--clr-primary)' : 'var(--clr-text)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Symptoms / Visit Notes */}
      <div className="input-group" style={{ marginBottom: '20px' }}>
        <label htmlFor="notes" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiFileText color="var(--clr-accent)" /> Reason for Visit / Symptoms (Optional)
        </label>
        <textarea
          id="notes"
          className="input"
          rows={3}
          placeholder="Briefly describe your symptoms or reason for appointment..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Book Submit Button */}
      <button
        type="button"
        className="btn btn-primary btn-lg"
        style={{ width: '100%' }}
        disabled={!selectedSlot || booking || slots.length === 0}
        onClick={handleBook}
      >
        {booking ? (
          'Reserving Slot...'
        ) : (
          <>
            <FiCheck /> Confirm Appointment ({selectedSlot || 'Select Slot'})
          </>
        )}
      </button>
    </div>
  );
};

export default SlotPicker;
