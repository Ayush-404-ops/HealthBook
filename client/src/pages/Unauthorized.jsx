import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleUtils';
import { motion } from 'framer-motion';

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/10">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              403 — Access Denied
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You do not have the required role permissions to access this administrative portal.
            </p>
          </div>

          <Link to={user ? getRoleDashboardPath(user) : '/'} className="inline-block">
            <Button variant="primary" icon={Home} size="lg">
              Return to Your Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
