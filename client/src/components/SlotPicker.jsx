import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { Skeleton } from './ui/Skeleton';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Clock, Check, FileText, Timer } from 'lucide-react';

const SSE_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const SlotPicker = ({ doctor, onBookingSuccess }) => {
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

  // Hold state
  const [holdId, setHoldId] = useState(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const sseRef = useRef(null);
  const countdownRef = useRef(null);

  // ── SSE: live slot updates ─────────────────────────────────────────────
  const openSSE = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    if (!doctor?._id || !date) return;

    const url = `${SSE_BASE}/api/events/stream?doctorId=${doctor._id}&date=${date}`;
    const es = new EventSource(url, { withCredentials: true });

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        // Server sends { type, doctorId, date, slots } on SLOTS_UPDATED
        if (
          payload.type === 'SLOTS_UPDATED' &&
          payload.doctorId === doctor._id &&
          payload.date === date
        ) {
          setSlots(payload.slots || []);
        }
      } catch {
        // ignore non-JSON heartbeats
      }
    };

    es.onerror = () => {
      es.close();
    };

    sseRef.current = es;
  }, [doctor?._id, date]);

  // Close SSE on unmount or when doctor/date changes
  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, []);

  // ── Fetch slots (initial load) ─────────────────────────────────────────
  const fetchSlots = useCallback(async () => {
    try {
      setLoadingSlots(true);
      setSelectedSlot('');
      setMessage('');
      // Release any existing hold when date changes
      if (holdId) {
        api.post('/appointments/release-hold', { holdId }).catch(() => {});
        setHoldId(null);
        setHoldExpiresAt(null);
      }
      const res = await api.get(`/doctors/${doctor._id}/slots`, { params: { date } });
      if (res.data?.success) {
        setSlots(res.data.data || []);
        setWeekday(res.data.weekday || '');
        if (res.data.message) setMessage(res.data.message);
      }
    } catch {
      toast.error('Failed to load slots for this date');
    } finally {
      setLoadingSlots(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor?._id, date]);

  useEffect(() => {
    if (doctor?._id && date) {
      fetchSlots();
      openSSE();
    }
    // Close previous SSE when doctor or date changes
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, [doctor?._id, date, fetchSlots, openSSE]);

  // ── Countdown timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (!holdExpiresAt) {
      setCountdown(null);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        clearInterval(countdownRef.current);
        // Hold expired – release UI
        setHoldId(null);
        setHoldExpiresAt(null);
        setSelectedSlot('');
        toast.error('Hold expired. The slot was released. Please re-select.');
        fetchSlots();
      }
    };

    tick();
    countdownRef.current = setInterval(tick, 1000);

    return () => clearInterval(countdownRef.current);
  }, [holdExpiresAt, fetchSlots]);

  // ── Select slot → create hold ──────────────────────────────────────────
  const handleSelectSlot = async (slot) => {
    if (slot === selectedSlot) return;

    // Release previous hold if any
    if (holdId) {
      api.post('/appointments/release-hold', { holdId }).catch(() => {});
      setHoldId(null);
      setHoldExpiresAt(null);
    }

    setSelectedSlot(slot);

    try {
      const res = await api.post('/appointments/hold', {
        doctorId: doctor._id,
        date,
        startTime: slot,
        ttlMinutes: 5,
      });
      if (res.data?.success) {
        const hold = res.data.data;
        setHoldId(hold.id);
        setHoldExpiresAt(new Date(hold.expiresAt).getTime());
      }
    } catch (err) {
      // If slot just got booked, show message and refresh
      toast.error(err.message || 'Could not hold slot');
      setSelectedSlot('');
      fetchSlots();
    }
  };

  // ── Book appointment ───────────────────────────────────────────────────
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
        ...(holdId ? { holdId } : {}),
      });

      if (res.data?.success) {
        toast.success('Appointment reserved successfully!');
        setHoldId(null);
        setHoldExpiresAt(null);
        if (onBookingSuccess) onBookingSuccess(res.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  // ── Format countdown ───────────────────────────────────────────────────
  const fmtCountdown = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <CalendarIcon className="w-5 h-5 text-teal-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Select Date &amp; Consultation Slot
        </h3>
      </div>

      <Input
        label="Consultation Date"
        type="date"
        min={getTodayString()}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        icon={CalendarIcon}
      />

      {/* Hold countdown banner */}
      {countdown !== null && selectedSlot && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border ${
            countdown <= 60
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
          }`}
        >
          <Timer className="w-4 h-4 shrink-0" />
          <span>
            Slot <strong>{selectedSlot}</strong> held for{' '}
            <strong className={countdown <= 60 ? 'text-rose-600' : ''}>{fmtCountdown(countdown)}</strong>
            {' '}— complete booking before it expires
          </span>
        </div>
      )}

      {loadingSlots ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-xl" />
            ))}
          </div>
        </div>
      ) : message ? (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300">
          {message}
        </div>
      ) : slots.length === 0 ? (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
          No open consultation slots available for {weekday} ({date}). Please pick another date.
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Available Slots ({weekday})</span>
            <span className="text-teal-600 dark:text-teal-400 font-bold">{slots.length} Slots</span>
          </label>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <button
                  type="button"
                  key={slot}
                  onClick={() => handleSelectSlot(slot)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20 scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{slot}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Textarea
        label="Reason for Visit / Symptoms (Optional)"
        rows={2}
        placeholder="Briefly state your symptoms..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Button
        type="button"
        variant="primary"
        size="lg"
        loading={booking}
        disabled={!selectedSlot || slots.length === 0}
        onClick={handleBook}
        icon={Check}
        className="w-full shadow-lg shadow-teal-500/20"
      >
        Confirm Appointment ({selectedSlot || 'Select Slot'})
      </Button>
    </div>
  );
};

export default SlotPicker;
