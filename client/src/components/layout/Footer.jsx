import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Shield, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Health<span className="text-teal-400">Book</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering healthcare accessibility with real-time appointment booking, AI-driven symptom navigation, and emergency hospital routing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/nearby-hospitals" className="hover:text-teal-400 transition-colors">
                  Emergency Hospitals
                </Link>
              </li>
              <li>
                <Link to="/patient" className="hover:text-teal-400 transition-colors">
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link to="/doctor" className="hover:text-teal-400 transition-colors">
                  Doctor Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-teal-400 transition-colors">
                  Admin Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Key Specialties
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>Cardiology</li>
              <li>Dermatology</li>
              <li>Pediatrics</li>
              <li>Neurology</li>
              <li>General Medicine</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Emergency & Contact
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2 text-rose-400 font-semibold">
                <Phone className="w-4 h-4" /> 24/7 Helpline: 108 / 112
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" /> support@healthbook.care
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" /> Medical Hub, Tech Park, IN
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} HealthBook Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-teal-400" /> HIPAA Compliant Architecture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
