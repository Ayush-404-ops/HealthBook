import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleUtils';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  HeartPulse,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Activity,
  Award,
  IndianRupee,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialty: '',
    fee: '',
    experienceYears: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', score: 0, color: 'bg-slate-200 dark:bg-slate-800' };
    if (pass.length < 6) return { label: 'Weak', score: 33, color: 'bg-rose-500' };
    if (pass.length < 10 || !/\d/.test(pass))
      return { label: 'Medium', score: 66, color: 'bg-amber-500' };
    return { label: 'Strong', score: 100, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Valid email is required';

    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Minimum 6 characters required';

    if (role === 'doctor') {
      if (!formData.specialty) errs.specialty = 'Specialty is required for doctors';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
        ...(role === 'doctor' && {
          specialty: formData.specialty,
          fee: Number(formData.fee) || 0,
          experienceYears: Number(formData.experienceYears) || 0,
        }),
      };

      const newUser = await register(payload);
      toast.success(`Account created! Welcome, ${newUser.name}`);
      navigate(getRoleDashboardPath(newUser), { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const specialtyOptions = [
    { value: '', label: 'Select Specialty' },
    { value: 'General Physician', label: 'General Physician' },
    { value: 'Cardiologist', label: 'Cardiologist' },
    { value: 'Dermatologist', label: 'Dermatologist' },
    { value: 'Neurologist', label: 'Neurologist' },
    { value: 'Orthopedist', label: 'Orthopedist' },
    { value: 'Pediatrician', label: 'Pediatrician' },
    { value: 'Psychiatrist', label: 'Psychiatrist' },
    { value: 'Gastroenterologist', label: 'Gastroenterologist' },
    { value: 'ENT Specialist', label: 'ENT Specialist' },
    { value: 'Dentist', label: 'Dentist' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left Branding */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-teal-900 via-slate-900 to-blue-950 p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.15),transparent_60%)] pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Health<span className="text-teal-400">Book</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-lg space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Join 25,000+ Active Users
            </span>
            <h2 className="text-4xl font-black text-white leading-tight mt-4">
              Begin Your Seamless Healthcare Journey
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Whether you are a patient looking for care or a medical professional expanding your practice, HealthBook provides the tools you need.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <User className="w-6 h-6 text-teal-400 mb-2" />
              <h4 className="text-xs font-bold text-white">For Patients</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">AI symptom triage & online booking</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Activity className="w-6 h-6 text-blue-400 mb-2" />
              <h4 className="text-xs font-bold text-white">For Doctors</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated queue & availability grid</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 relative z-10">
          © {new Date().getFullYear()} HealthBook Platform. All rights reserved.
        </p>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6 my-auto"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Create an Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select your role and fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Animated Segmented Control Role Selector */}
            <div className="p-1 bg-slate-100 dark:bg-slate-900 rounded-xl grid grid-cols-2 gap-1 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`relative py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  role === 'patient'
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {role === 'patient' && (
                  <motion.div
                    layoutId="roleSegment"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Patient
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`relative py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  role === 'doctor'
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {role === 'doctor' && (
                  <motion.div
                    layoutId="roleSegment"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Doctor
                </span>
              </button>
            </div>

            <Input
              label="Full Name *"
              name="name"
              placeholder={role === 'doctor' ? 'Dr. Sarah Jenkins' : 'Alex Mercer'}
              icon={User}
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <Input
              label="Email Address *"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+91 9876543210"
              icon={Phone}
              value={formData.phone}
              onChange={handleChange}
            />

            {/* Doctor Extra Fields */}
            {role === 'doctor' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-1"
              >
                <Select
                  label="Specialty *"
                  name="specialty"
                  options={specialtyOptions}
                  value={formData.specialty}
                  onChange={handleChange}
                  error={errors.specialty}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Consultation Fee (₹)"
                    name="fee"
                    type="number"
                    placeholder="500"
                    icon={IndianRupee}
                    value={formData.fee}
                    onChange={handleChange}
                  />
                  <Input
                    label="Experience (Years)"
                    name="experienceYears"
                    type="number"
                    placeholder="5"
                    icon={Award}
                    value={formData.experienceYears}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>
            )}

            <div>
              <Input
                label="Password *"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                endIcon={showPassword ? EyeOff : Eye}
                onEndIconClick={() => setShowPassword(!showPassword)}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password strength:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              className="w-full shadow-lg shadow-teal-500/20 mt-2"
            >
              Create {role === 'doctor' ? 'Doctor Account' : 'Patient Account'}
            </Button>
          </form>

          <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
