import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Sparkles,
  Bot,
  MapPin,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Flame,
  Zap,
  ArrowRight,
  CreditCard,
  Lock,
  ChevronRight,
  Activity
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
      badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
      reason: 'Recommended clinical evaluation for myocardial vascular health and ECG screening.',
    },
    'Severe Migraine': {
      specialty: 'Neurologist',
      match: '96%',
      urgency: 'Routine Clinical',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      reason: 'Neuro-vascular analysis to identify triggers and target preventive care.',
    },
    'Skin Rash & Itch': {
      specialty: 'Dermatologist',
      match: '94%',
      urgency: 'Standard Care',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
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
    <section className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-4 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-teal-500" />
            <span>Interactive Product Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Engineered for speed, clarity, and{' '}
            <span className="doodle-underline text-gradient">uncompromised care</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Explore live interactive slices of HealthBook. Try out the slot picker, test AI triage, and see emergency routing in action.
          </p>
        </div>

        {/* Bento Grid Layout (Plane & Cal.com style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Card 1: Live Interactive Slot Booking (Span 2) */}
          <div className="md:col-span-2 lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
                  Live Mini Preview
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Instant Synchronization
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                Precision Real-Time Slot Locking
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                Zero double-bookings. Slots lock automatically with millisecond conflict avoidance.
              </p>
            </div>

            {/* Interactive Widget Box */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Dr. Aarav Mehta, MD
                    </h4>
                    <p className="text-[11px] text-slate-400">Chief Cardiologist • ₹800</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md">
                  Available Today
                </span>
              </div>

              {/* Slot Pills */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400">Select consultation time:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['09:30 AM', '10:30 AM', '02:00 PM', '04:30 PM'].map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSelectSlot(slot)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30 scale-105'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Status Toast inside widget */}
              <AnimatePresence>
                {slotBooked && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Slot {selectedSlot} held for 10 mins • Razorpay Ready</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Card 2: AI Clinical Triage Navigator (Span 2) */}
          <div className="md:col-span-1 lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-teal-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800">
                  Gemini Intelligence
                </span>
                <Bot className="w-5 h-5 text-teal-500" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                AI Symptom Navigator
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                Unsure which specialist to book? Type what you feel; our clinical AI points you to the exact department.
              </p>
            </div>

            {/* Interactive Widget Box */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 mb-2 block">
                Test a symptom scenario:
              </span>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.keys(symptomResults).map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => setActiveSymptom(symptom)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      activeSymptom === symptom
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-teal-400'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSymptom}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                      Target: {currentResult.specialty}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${currentResult.badgeColor}`}>
                      {currentResult.match} Match
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {currentResult.reason}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Card 3: Dijkstra Emergency Hospital Radar (Span 2) */}
          <div className="md:col-span-2 lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800">
                  Critical Response Routing
                </span>
                <MapPin className="w-5 h-5 text-rose-500" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                Nearby Hospitals with Live Shortest Route
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                GPS-linked OpenStreetMap and Dijkstra route optimization identify immediate emergency care in seconds.
              </p>
            </div>

            {/* Radar Mini Simulator */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                    <Navigation className="w-4 h-4 animate-spin text-rose-500" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      City Apex Emergency Trauma Care
                    </h4>
                    <p className="text-[10px] text-slate-400">ICU Available • 24/7 Ambulance</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400">1.2 km</span>
                  <p className="text-[10px] text-slate-400">~ 3 min drive</p>
                </div>
              </div>

              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 w-3/4 rounded-full animate-pulse" />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> OSRM Dijkstra Shortest Route Active
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-400">108 Hotline Ready</span>
              </div>
            </div>
          </div>

          {/* Card 4: Verified Escrow & Digital Receipts (Span 2) */}
          <div className="md:col-span-1 lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
                  Razorpay Escrow & Cryptographic Receipts
                </span>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                100% Protected Payments & Instant Refunds
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                All consultations are protected with HMAC SHA256 payment signature verification and automatic cancellations.
              </p>
            </div>

            {/* Receipt Preview */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Verified Receipt</span>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 px-1.5 py-0.2 rounded font-bold">SHA-256</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Order ID #HB-9402 • Instant PDF Export</p>
                </div>
              </div>

              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-lg">
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
