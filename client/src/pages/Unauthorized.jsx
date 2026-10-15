import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleUtils';

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              403 — Access Denied
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You do not have the required role permissions to access this administrative portal.
            </p>
          </div>

          <Link to={user ? getRoleDashboardPath(user) : '/'} className="inline-block">
            <Button variant="primary" icon={Home} size="md">
              Return to Your Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
