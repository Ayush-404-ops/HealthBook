import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleUtils';
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
} from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const { isAuthenticated, user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { label: 'Verified Doctors', value: '500+', icon: Award },
    { label: 'Appointments Booked', value: '25,000+', icon: Calendar },
    { label: 'Patient Satisfaction', value: '99.4%', icon: Star },
    { label: 'Emergency Response', value: '< 15 mins', icon: Clock },
  ];

  const specialties = [
    { name: 'Cardiology', desc: 'Heart care, ECG & vascular wellness', icon: HeartPulse, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
    { name: 'Dermatology', desc: 'Skin health, laser therapy & allergy', icon: Sparkles, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
    { name: 'Pediatrics', desc: 'Child health, immunization & growth', icon: Users, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
    { name: 'Neurology', desc: 'Brain, spine & nerve treatments', icon: Bot, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
    { name: 'General Medicine', desc: 'Primary care, checkups & fever care', icon: Stethoscope, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40' },
    { name: 'Orthopedics', desc: 'Bone, joint & sports rehabilitation', icon: Award, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Describe Symptoms or Select Specialty',
      desc: 'Use our AI Symptom Navigator or browse verified medical specialists by specialty and consultation fee.',
    },
    {
      num: '02',
      title: 'Choose Available Slot',
      desc: 'Pick your preferred date and 30-minute time slot from the live availability grid with zero overlap.',
    },
    {
      num: '03',
      title: 'Instant Confirmation & Care',
      desc: 'Pay securely via Razorpay, get instant appointment confirmation, and receive digital consultation receipts.',
    },
  ];

  const testimonials = [
    {
      quote: "The AI Symptom Navigator recommended a Cardiologist when I had sudden chest tightness. I booked within 2 minutes!",
      name: "Ananya R.",
      role: "Patient from Bengaluru",
      rating: 5,
    },
    {
      quote: "As a doctor, HealthBook simplified my queue management and slot scheduling tremendously. Highly recommended!",
      name: "Dr. Vikram Seth",
      role: "Senior Neurologist",
      rating: 5,
    },
    {
      quote: "The Emergency Hospitals map with Dijkstra shortest-path routing saved crucial time during an emergency.",
      name: "Rohan M.",
      role: "Patient from Delhi",
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: "How does the AI Symptom Navigator work?",
      a: "Our Gemini AI model analyzes your symptoms description and recommends the most appropriate doctor specialty along with clinical reasoning.",
    },
    {
      q: "Is payment on HealthBook secure?",
      a: "Yes! All consultation payments are processed via Razorpay with HMAC SHA256 signature verification.",
    },
    {
      q: "Can I cancel an appointment and get a refund?",
      a: "Yes, you can cancel any upcoming appointment from your Patient Dashboard and automated refunds will be initiated.",
    },
    {
      q: "How does emergency hospital routing work?",
      a: "Our Nearby Hospitals feature uses OpenStreetMap Overpass API and Dijkstra's algorithm via OSRM to calculate the fastest emergency route.",
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-teal-500/5 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-6 tracking-wide shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span>Next-Gen Smart Healthcare Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight"
            >
              Smart Doctor Bookings Powered by{' '}
              <span className="text-gradient">AI Navigation</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto"
            >
              HealthBook bridges patients and top medical professionals. Describe your symptoms to get instant AI recommendations, book verified slots, and access emergency hospital routes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {isAuthenticated ? (
                <Link to={getRoleDashboardPath(user)}>
                  <Button size="lg" variant="primary" icon={ArrowRight}>
                    Go to Your Dashboard ({user?.name})
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" variant="primary" icon={Calendar}>
                      Book Appointment Now
                    </Button>
                  </Link>
                  <Link to="/nearby-hospitals">
                    <Button size="lg" variant="outline" icon={MapPin} className="border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                      Emergency Hospitals
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* Stats Counters Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            {stats.map((st) => {
              const Icon = st.icon;
              return (
                <Card key={st.label} glass className="p-6 text-center hover:scale-105 transition-transform">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                    {st.value}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {st.label}
                  </div>
                </Card>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Specialties Grid */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Explore Medical Specialties
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Find experienced healthcare providers across all major clinical disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((spec) => {
              const Icon = spec.icon;
              return (
                <Card
                  key={spec.name}
                  className="p-6 group cursor-pointer hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${spec.color} shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {spec.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
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

      {/* How it Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
              How HealthBook Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st) => (
              <Card key={st.num} glass className="p-8 relative overflow-hidden group">
                <div className="text-5xl font-black text-slate-200 dark:text-slate-800 absolute right-4 top-4 select-none group-hover:text-teal-500/20 transition-colors">
                  {st.num}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold text-base mb-6 shadow-md shadow-teal-500/20">
                    {st.num}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-100/60 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Trusted by Patients & Doctors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    &quot;{t.quote}&quot;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.name}</p>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-teal-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Landing;
