import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleUtils';
import BentoFeatures from '../components/landing/BentoFeatures';
import HealthHabitHUD from '../components/ui/HealthHabitHUD';
import {
  HeartPulse,
  Bot,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Star,
  ChevronDown,
  Users,
  Award,
  Clock,
  Stethoscope,
  CheckCircle,
  Zap,
  Activity,
  PhoneCall,
  Search,
  CheckCircle2,
  TrendingUp,
  Flame,
  Droplets,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SPECIALTIES = [
  { name: 'Cardiology', desc: 'Heart care, ECG, hypertension & vascular diagnosis', icon: HeartPulse, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900' },
  { name: 'Dermatology', desc: 'Skin allergies, acne, eczema & laser consultation', icon: Sparkles, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900' },
  { name: 'Pediatrics', desc: 'Child healthcare, vaccinations & growth monitoring', icon: Users, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900' },
  { name: 'Neurology', desc: 'Migraine care, neuro-spine analysis & sleep health', icon: Bot, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900' },
  { name: 'General Medicine', desc: 'Primary care, fever, seasonal flu & full body checks', icon: Stethoscope, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900' },
  { name: 'Orthopedics', desc: 'Joint reconstruction, sports rehabilitation & fracture care', icon: Award, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900' },
];

const STATS = [
  { label: 'Board-Certified Specialists', value: '500+', icon: Award, change: '+12 this week' },
  { label: 'Fulfilled Consultations', value: '25,000+', icon: Calendar, change: '100% Verified' },
  { label: 'Patient Trust Rating', value: '99.4%', icon: Star, change: '4.9/5 from 8k reviews' },
  { label: 'Emergency Response Route', value: '< 15 mins', icon: Clock, change: 'OSRM Dijkstra GPS' },
];

const FAQS = [
  {
    q: 'How does the AI Symptom Navigator select the right doctor?',
    a: 'Powered by Gemini AI, our navigator clinically correlates symptoms, duration, and urgency against medical specialty taxonomies to recommend the most suitable clinical department in real time.',
  },
  {
    q: 'How does real-time slot locking prevent double bookings?',
    a: 'Every time you choose a consultation slot, HealthBook acquires an optimistic reservation lock in the backend database. If two patients attempt to book the exact same slot, the race condition is resolved instantly.',
  },
  {
    q: 'How does the Emergency Hospital shortest-route routing work?',
    a: 'Using OpenStreetMap Overpass spatial queries and Dijkstra route matrix optimization through OSRM, the nearest hospitals and trauma centers are sorted by real driving ETA from your current GPS coordinates.',
  },
  {
    q: 'Are consultation payments secure and refundable?',
    a: 'Yes. All payments utilize Razorpay with HMAC SHA-256 signature verification. If you cancel an upcoming consultation via your Patient Dashboard, automated refunds are issued instantly.',
  },
  {
    q: 'What is the Health Habit & Wellness Streak system?',
    a: 'Inspired by HabitKit and gaming progression, you earn Health XP for keeping appointments, tracking daily vitals, and maintaining daily hydration streaks to unlock clinical milestone badges.',
  },
];

const Landing = () => {
  const { isAuthenticated, user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <PublicLayout>
      {/* ── 1. HERO SECTION (Webflow + Linear Inspired) ── */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-24 lg:pb-36 glow-mesh border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-6 tracking-wide shadow-sm"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Next-Gen MERN Healthcare Ecosystem</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Powered
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.08]"
              >
                Intelligent Doctor Appointments &{' '}
                <span className="doodle-underline text-gradient">AI Health Care</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl"
              >
                Experience zero-wait doctor scheduling with verified board specialists, interactive AI symptom triage, live emergency trauma routing, and gamified wellness consistency tracking.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                {isAuthenticated ? (
                  <Link to={getRoleDashboardPath(user)}>
                    <Button size="lg" variant="primary" icon={ArrowRight} className="shadow-lg shadow-emerald-500/25">
                      Open Dashboard ({user?.name || user?.role})
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" variant="primary" icon={Calendar} className="shadow-lg shadow-emerald-500/25">
                        Book Doctor Appointment
                      </Button>
                    </Link>
                    <Link to="/nearby-hospitals">
                      <Button
                        size="lg"
                        variant="outline"
                        icon={MapPin}
                        className="border-rose-400 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-sm"
                      >
                        Emergency Hospitals Map
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-10 flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Razorpay HMAC Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Dijkstra Shortest Route</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  <span>Gemini AI Triage</span>
                </div>
              </motion.div>
            </div>

            {/* Right Hero: Live Interactive Product Mockup */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 p-6 shadow-2xl backdrop-blur-xl"
              >
                {/* Window header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="ml-2 font-mono text-[11px] text-slate-400">healthbook.app/triage</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <Zap className="w-3 h-3" /> Live Simulator
                  </span>
                </div>

                {/* Doctor Card Mockup */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/25">
                        DR
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            Dr. Priya Sundaram
                          </h4>
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Senior Cardiologist • AIIMS Gold Medalist
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> 4.9
                    </div>
                  </div>

                  {/* Consultation Pricing & Availability */}
                  <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Consultation Fee</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹750 / Session</span>
                  </div>

                  {/* Quick Select Times */}
                  <div>
                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      <span>Available 30-Min Slots</span>
                      <span className="text-emerald-500 font-bold">● 4 Slots Open</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 text-center rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                        10:00 AM
                      </div>
                      <div className="p-2 text-center rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        11:30 AM
                      </div>
                      <div className="p-2 text-center rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        03:00 PM
                      </div>
                    </div>
                  </div>

                  {/* Instant Confirmation CTA */}
                  <Link to="/register" className="block">
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm Appointment via Escrow</span>
                    </button>
                  </Link>
                </div>

                {/* Floating micro badges */}
                <div className="absolute -bottom-5 -left-5 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Zero Waiting Queue</p>
                    <p className="text-[10px] text-slate-400">Verified doctor availability</p>
                  </div>
                </div>

                <div className="absolute -top-5 -right-5 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Gemini Clinical Match</p>
                    <p className="text-[10px] text-slate-400">Instant accurate diagnosis</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {STATS.map((st) => {
              const Icon = st.icon;
              return (
                <Card key={st.label} glass className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      {st.change}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                    {st.value}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    {st.label}
                  </div>
                </Card>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── 2. INTERACTIVE BENTO GRID (Plane / Cal.com / Dribbble) ── */}
      <BentoFeatures />

      {/* ── 3. GAMIFIED WELLNESS HUD (HabitKit + Habitica + Forest App Inspiration) ── */}
      <section className="py-20 relative overflow-hidden bg-white dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-4 shadow-sm">
                <Trophy className="w-3.5 h-3.5" />
                <span>HabitKit & Habitica Gamification</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                Turn proactive healthcare into an{' '}
                <span className="text-gradient">engaging daily streak</span>
              </h2>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Health isn't just about visits when you are sick. HealthBook gamifies preventive wellness with GitHub-style activity heatmaps, daily health quests, and unlockable health achievements.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Consistency Heatmap
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Visualize check-in streaks, medication logs, and consultations across months.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      XP Rank & Vitality Levels
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Advance your patient tier from Novice to Vitality Sentinel as you fulfill appointments.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              {/* Live Interactive HUD */}
              <HealthHabitHUD showBadges={true} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CLINICAL SPECIALTIES SHOWCASE ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Comprehensive Care
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mt-2">
              Browse Verified Medical Specialties
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Every doctor is thoroughly verified with authenticated clinical licenses and transparent consultation fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIALTIES.map((spec) => {
              const Icon = spec.icon;
              return (
                <Card
                  key={spec.name}
                  className="p-6 group cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3.5 rounded-2xl border ${spec.color} shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {spec.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {spec.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. HOW HEALTHBOOK WORKS (Interactive 3-Step Flow) ── */}
      <section className="py-20 bg-slate-50/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Frictionless Consultation
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mt-2">
              How HealthBook Works in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Describe Symptoms with AI',
                desc: 'Enter your clinical sensations or pick a department directly. Gemini AI computes the exact specialist match.',
                icon: Bot,
              },
              {
                step: '02',
                title: 'Select 30-Min Real-Time Slot',
                desc: 'Inspect the live calendar matrix. Lock down your appointment with instant conflict resolution.',
                icon: Calendar,
              },
              {
                step: '03',
                title: 'Instant Escrow & Care',
                desc: 'Pay safely via Razorpay HMAC checkout, download digital consultation receipts, and meet your doctor.',
                icon: ShieldCheck,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} glass className="p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                  <div className="text-6xl font-black text-slate-200 dark:text-slate-800 absolute right-4 top-4 select-none group-hover:text-emerald-500/20 transition-colors">
                    {item.step}
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base mb-6 shadow-md shadow-emerald-500/20">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. FREQUENTLY ASKED QUESTIONS ── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Answers & Clarifications
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-emerald-500' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. FINAL CALL TO ACTION (CTA) ── */}
      <section className="py-20 bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950 text-white relative overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.3),rgba(255,255,255,0))]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Ready for seamless healthcare?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Schedule Your Next Doctor Consultation with Confidence
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join thousands of patients accessing instant verified doctor slots, emergency routes, and AI symptom triage today.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 shadow-xl shadow-emerald-500/30">
                Create Free Account
              </Button>
            </Link>
            <Link to="/nearby-hospitals">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Find Emergency Care
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Landing;
