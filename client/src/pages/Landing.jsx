import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicLayout } from "../components/layout/PublicLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { getRoleDashboardPath } from "../utils/roleUtils";
import {
  HeartPulse,
  Bot,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Search,
  MapPin,
  ChevronDown,
  Users,
  Award,
  Stethoscope,
  Phone,
} from "lucide-react";

const SPECIALTIES = [
  {
    name: "General Medicine",
    desc: "Primary care, fevers, seasonal infections & full body wellness checkups.",
    icon: Stethoscope,
  },
  {
    name: "Cardiology",
    desc: "Heart care, blood pressure management, ECG & vascular consultations.",
    icon: HeartPulse,
  },
  {
    name: "Dermatology",
    desc: "Skin care, allergies, rashes, acne treatment & clinical dermatology.",
    icon: Award,
  },
  {
    name: "Pediatrics",
    desc: "Infant and child healthcare, routine vaccinations & growth monitoring.",
    icon: Users,
  },
  {
    name: "Orthopedics",
    desc: "Joint pain, bone fractures, sports injuries & rehabilitation care.",
    icon: ShieldCheck,
  },
  {
    name: "Neurology",
    desc: "Migraines, nerve conditions, spine analysis & chronic headache care.",
    icon: Bot,
  },
];

const FAQS = [
  {
    q: "How do I book an appointment on HealthBook?",
    a: "Select your required specialty, browse verified doctors and their fees, pick an available date and time slot, and confirm your booking.",
  },
  {
    q: "Can I cancel or reschedule a consultation?",
    a: "Yes. You can manage and cancel your upcoming appointments directly from your Patient Dashboard with automated refund processing.",
  },
  {
    q: "What is the AI Symptom Navigator?",
    a: "If you are unsure which specialist you need, our clinical AI assistant analyzes your symptoms and suggests the most relevant department.",
  },
  {
    q: "How does the Emergency Hospital finder work?",
    a: "Using GPS and OpenStreetMap routing, it displays nearby emergency hospitals and trauma centers sorted by driving distance from your location.",
  },
];

export const Landing = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(getRoleDashboardPath(user));
    } else {
      navigate("/register");
    }
  };

  return (
    <PublicLayout>
      {/* ─── Hero Section ─── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-6">
            Healthcare Scheduling Platform
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Book appointments with trusted doctors
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Find verified specialists, check real consultation availability, and schedule your appointment without waiting in clinic queues.
          </p>

          {/* Clean Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-3xl mx-auto p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Doctor name or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="sm:w-56">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full h-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All Specialties">All Specialties</option>
                <option value="General Physician">General Physician</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Orthopedist">Orthopedist</option>
                <option value="Dentist">Dentist</option>
              </select>
            </div>

            <Button type="submit" variant="primary" size="md" className="px-6">
              Find Doctors
            </Button>
          </form>

          {/* Quick Specialty Links */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Popular:</span>
            {["General Physician", "Cardiologist", "Dermatologist", "Pediatrician", "Dentist"].map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => {
                  setSelectedSpecialty(spec);
                  if (isAuthenticated) {
                    navigate(getRoleDashboardPath(user));
                  } else {
                    navigate("/register");
                  }
                }}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Platform Pillars / Key Features ─── */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Healthcare services built around you
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Everything you need to manage your consultations smoothly and reliably.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-5">
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                Verified Doctors
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect with qualified medical professionals with verified clinical registrations and transparent fees.
              </p>
            </Card>

            <Card className="p-5">
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                Real-Time Slot Booking
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Select from real open consultation times. Appointments are confirmed immediately with no overlap.
              </p>
            </Card>

            <Card className="p-5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                AI Symptom Helper
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Describe your symptoms in plain words. Our AI assistant helps recommend the most appropriate specialty.
              </p>
            </Card>

            <Card className="p-5">
              <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                Emergency Hospital Finder
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Find nearby trauma centers and hospitals with direct driving routes when urgent care is needed.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Medical Specialties ─── */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Browse by Medical Specialty
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Find dedicated specialists for your specific clinical needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIALTIES.map((spec) => {
              const Icon = spec.icon;
              return (
                <Card key={spec.name} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {spec.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {spec.desc}
                      </p>
                      <Link
                        to={isAuthenticated ? getRoleDashboardPath(user) : "/register"}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 mt-3"
                      >
                        <span>Find Doctors</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How it Works (3 Steps) ─── */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              How to book an appointment
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Scheduling doctor visits in three clear steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Step 1
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2 mb-1.5">
                Find Your Doctor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Filter by medical specialty, experience, and consultation fees to choose the doctor right for you.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Step 2
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2 mb-1.5">
                Pick Date & Time
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                View real-time doctor availability and select a convenient 30-minute consultation slot.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Step 3
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2 mb-1.5">
                Confirm & Attend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Complete your booking securely, download your receipt, and attend your scheduled consultation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Emergency Assistance Banner ─── */}
      <section className="py-12 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                In case of a medical emergency
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Locate the nearest trauma center with driving route directions, or call emergency response.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/nearby-hospitals">
              <Button size="sm" variant="outline" className="border-rose-300 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50">
                Hospital Map
              </Button>
            </Link>
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 108 / 112</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Common questions about booking and appointments.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 ${isOpen ? "rotate-180 text-teal-600" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to schedule your consultation?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Create an account to browse certified specialists and book convenient appointment times.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/register">
              <Button size="md" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6">
                Create Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="md" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Landing;
