import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { Home, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shadow-xl shadow-rose-500/10">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              404
            </h1>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Page Not Found
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The page or resource you requested does not exist or has been relocated.
            </p>
          </div>

          <Link to="/" className="inline-block">
            <Button variant="primary" icon={Home} size="lg">
              Back to Home Page
            </Button>
          </Link>
        </motion.div>
      </div>
    </PublicLayout>
  );
};

export default NotFound;
