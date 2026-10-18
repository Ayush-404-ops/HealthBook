import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Skeleton } from './Skeleton';
import toast from 'react-hot-toast';
import { Calendar, Clock, RefreshCw } from 'lucide-react';

const getTodayString = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * RescheduleModal
 * Props:
 *   appointment – full appointment object (must have .doctor._id and .doctor.user.name)
 *   isOpen      – boolean
 *   onClose     – () => void
 *   onSuccess   – () => void  (called after successful reschedule)
 */
const RescheduleModal = ({ appointment, isOpen, onClose, onSuccess }) => {
  const [date, setDate] = useState(getTodayString());
  const [slots, setSlots] = useState([]);
  const [weekday, setWeekday] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const doctorId = appointment?.doctor?._id;

  const fetchSlots = useCallback(async () => {
    if (!doctorId || !date) return;
    try {
      setLoadingSlots(true);
      setSelectedSlot('');
      setMessage('');
      const res = await api.get(`/doctors/${doctorId}/slots`, { params: { date } });
      if (res.data?.success) {
        // Exclude the current slot on the same date so the patient sees all free options
        const allSlots = res.data.data || [];
        setSlots(allSlots);
        setWeekday(res.data.weekday || '');
        if (res.data.message) setMessage(res.data.message);
      }
    } catch {
      toast.error('Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  }, [doctorId, date]);

  useEffect(() => {
    if (isOpen && doctorId) fetchSlots();
  }, [isOpen, doctorId, fetchSlots, date]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDate(getTodayString());
      setSlots([]);
      setSelectedSlot('');
      setMessage('');
    }
  }, [isOpen]);

  const handleReschedule = async () => {
    if (!selectedSlot) {
      toast.error('Please select a new time slot');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.patch(`/appointments/${appointment._id}/reschedule`, {
        date,
        startTime: selectedSlot,
      });
      if (res.data?.success) {
        toast.success('Appointment rescheduled successfully!');
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reschedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const doctorName = appointment?.doctor?.user?.name;
  const rescheduleCount = appointment?.rescheduleCount ?? 0;
  const remaining = 2 - rescheduleCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reschedule Appointment`}
      description={`Dr. ${doctorName} • ${remaining} reschedule${remaining !== 1 ? 's' : ''} remaining`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 pt-1">
        {/* Reschedule limit warning */}
        {remaining === 1 && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300">
            ⚠️ This is your last allowed reschedule for this appointment.
          </div>
        )}

        <Input
          label="New Consultation Date"
          type="date"
          min={getTodayString()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          icon={Calendar}
        />

        {loadingSlots ? (
          <div className="grid grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-xl" />
            ))}
          </div>
        ) : message ? (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300">
            {message}
          </div>
        ) : slots.length === 0 ? (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
            No open slots for {weekday} ({date}). Please try another date.
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Available Slots ({weekday})</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">{slots.length} open</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    selectedSlot === slot
                      ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20 scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
            Keep Original
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={RefreshCw}
            loading={submitting}
            disabled={!selectedSlot}
            onClick={handleReschedule}
            className="flex-1"
          >
            Confirm Reschedule
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RescheduleModal;
