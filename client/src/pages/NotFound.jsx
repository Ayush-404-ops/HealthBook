import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              404
            </h1>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Page Not Found
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The page or resource you requested does not exist or has been relocated.
            </p>
          </div>

          <Link to="/" className="inline-block">
            <Button variant="primary" icon={Home} size="md">
              Back to Home Page
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFound;
