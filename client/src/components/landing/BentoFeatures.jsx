import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  MapPin,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Lock
} from 'lucide-react';

export const BentoFeatures = () => {
  // Mini Slot Picker interactive state
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [slotBooked, setSlotBooked] = useState(false);

  // Mini AI Symptom Navigator interactive state
  const [activeSymptom, setActiveSymptom] = useState('Chest tightness');
  const symptomResults = {
    'Chest tightness': {
      specialty: 'Cardiologist',
      match: '98%',
      urgency: 'Moderate Priority',
      badgeColor: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
      reason: 'Recommended clinical evaluation for myocardial vascular health and ECG screening.',
    },
    'Severe Migraine': {
      specialty: 'Neurologist',
      match: '96%',
      urgency: 'Routine Clinical',
      badgeColor: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900',
      reason: 'Neuro-vascular analysis to identify triggers and target preventive care.',
    },
    'Skin Rash & Itch': {
      specialty: 'Dermatologist',
      match: '94%',
      urgency: 'Standard Care',
      badgeColor: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900',
      reason: 'Evaluation for acute contact dermatitis or allergic histaminic response.',
    },
  };

  const currentResult = symptomResults[activeSymptom];

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSlotBooked(true);
    setTimeout(() => setSlotBooked(false), 2400);
  };

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Features & Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Engineered for Speed, Reliability, and Patient Care
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Interactive preview of instant slot scheduling, AI specialty classification, and emergency routing.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Live Interactive Slot Booking */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Real-Time Slots
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Instant Confirmation
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Precision Real-Time Slot Locking
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero double-bookings. Slots lock automatically with millisecond conflict avoidance.
              </p>
            </div>

            {/* Interactive Widget Box */}
            <div className="mt-5 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Dr. Aarav Mehta, MD
                    </h4>
                    <p className="text-[11px] text-slate-400">Chief Cardiologist • ₹800</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded">
                  Available Today
                </span>
              </div>

              {/* Slot Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Select consultation time:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['09:30 AM', '10:30 AM', '02:00 PM', '04:30 PM'].map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSelectSlot(slot)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Status Toast inside widget */}
              {slotBooked && (
                <div className="mt-3 p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Slot {selectedSlot} held for 10 mins • Razorpay Ready</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: AI Clinical Triage Navigator */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Gemini AI
                </span>
                <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                AI Symptom Navigator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Unsure which specialist to book? Type what you feel; our clinical AI points you to the exact department.
              </p>
            </div>

            {/* Interactive Widget Box */}
            <div className="mt-5 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
                Sample symptom scenarios:
              </span>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.keys(symptomResults).map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => setActiveSymptom(symptom)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                      activeSymptom === symptom
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    Target: {currentResult.specialty}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${currentResult.badgeColor}`}>
                    {currentResult.match} Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {currentResult.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Dijkstra Emergency Hospital Radar */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Critical Response
                </span>
                <MapPin className="w-4 h-4 text-rose-500" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Nearby Hospitals with Live Shortest Route
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                GPS-linked OpenStreetMap and Dijkstra route optimization identify immediate emergency care in seconds.
              </p>
            </div>

            {/* Radar Mini Simulator */}
            <div className="mt-5 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <Navigation className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      City Apex Emergency Trauma Care
                    </h4>
                    <p className="text-[10px] text-slate-400">ICU Available • 24/7 Ambulance</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">1.2 km</span>
                  <p className="text-[10px] text-slate-400">~ 3 min drive</p>
                </div>
              </div>

              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 w-3/4 rounded-full" />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dijkstra Route Active
                </span>
                <span className="font-mono text-[10px] text-slate-400">108 Hotline Ready</span>
              </div>
            </div>
          </div>

          {/* Card 4: Verified Escrow & Digital Receipts */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Razorpay Escrow
                </span>
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                100% Protected Payments & Instant Refunds
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All consultations are protected with HMAC SHA-256 payment signature verification and automatic cancellations.
              </p>
            </div>

            {/* Receipt Preview */}
            <div className="mt-5 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Verified Receipt</span>
                    <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded">SHA-256</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Order ID #HB-9402 • Instant PDF Export</p>
                </div>
              </div>

              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded">
                Paid ₹750
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoFeatures;
