import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleUtils';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { HeartPulse, Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';

    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      toast.success(`Welcome back, ${loggedUser.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(getRoleDashboardPath(loggedUser), { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header Controls */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left Branding - Clean, minimal & static */}
      <div className="hidden lg:flex flex-1 relative bg-[#061318] border-r border-slate-800/80 p-12 xl:p-16 flex-col justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#007B8A] flex items-center justify-center text-white shadow-sm">
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Health<span className="text-[#6BCBEB]">Book</span>
          </span>
        </Link>

        {/* Minimal clean feature overview */}
        <div className="max-w-md w-full space-y-8 my-auto py-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase bg-[#007B8A]/15 text-[#6BCBEB] border border-[#007B8A]/30">
              Healthcare Platform
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-3 leading-tight">
              Modern healthcare scheduling, simplified.
            </h1>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Connect with top board-certified doctors, explore intelligent AI symptom triage, and manage your health seamlessly.
            </p>
          </div>

          <div className="space-y-5 pt-6 border-t border-slate-800/80">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-[#6BCBEB] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Verified Specialists</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Board-certified doctors across multiple clinical specialties.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-[#6BCBEB] flex items-center justify-center shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">AI Symptom Guidance</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Quick preliminary triage to route you to the right department.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-[#6BCBEB] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Private & Secure</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Encrypted health records and verified transactions.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-900">
          <span>© {new Date().getFullYear()} HealthBook Platform</span>
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#007B8A]" /> 256-bit Encrypted
          </span>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50/60 dark:bg-slate-950">
        <div className="w-full max-w-md p-8 sm:p-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          {/* Mobile Logo Header */}
          <div className="lg:hidden text-center space-y-2 mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                Health<span className="text-teal-500">Book</span>
              </span>
            </Link>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Please enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              endIcon={showPassword ? EyeOff : Eye}
              onEndIconClick={() => setShowPassword(!showPassword)}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              className="w-full shadow-lg shadow-teal-500/20 mt-2"
            >
              Sign In to HealthBook
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="font-bold text-[#007B8A] dark:text-[#6BCBEB] hover:underline">
                Create Account Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
