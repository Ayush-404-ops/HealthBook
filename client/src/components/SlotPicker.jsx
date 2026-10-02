import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { Skeleton } from './ui/Skeleton';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Clock, Check, FileText } from 'lucide-react';

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

  const fetchSlots = useCallback(async () => {
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
    } catch {
      toast.error('Failed to load slots for this date');
    } finally {
      setLoadingSlots(false);
    }
  }, [doctor?._id, date]);

  useEffect(() => {
    if (doctor?._id && date) {
      fetchSlots();
    }
  }, [doctor?._id, date, fetchSlots]);

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
        toast.success('Appointment reserved successfully!');
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
    <div className="space-y-5 pt-2">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <CalendarIcon className="w-5 h-5 text-teal-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Select Date & Consultation Slot
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
                  onClick={() => setSelectedSlot(slot)}
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
