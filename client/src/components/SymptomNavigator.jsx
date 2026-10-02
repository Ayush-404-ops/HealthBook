import React, { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Badge } from './ui/Badge';
import { Bot, ArrowRight, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EXAMPLE_CHIPS = [
  "Persistent dry cough with mild fever and fatigue",
  "Sudden chest tightness and radiating arm pain",
  "Red itchy skin rash after eating seafood",
  "Severe throbbing headache with light sensitivity",
  "Sharp knee pain when climbing stairs",
];

const SymptomNavigator = ({ onApplySpecialty }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!symptoms || symptoms.trim().length < 5) {
      toast.error('Please describe your symptoms in at least 5 characters');
      return;
    }

    setLoading(true);
    setIsTyping(true);
    setResult(null);

    try {
      const res = await api.post('/ai/navigate', { symptoms });
      if (res.data?.success) {
        setResult(res.data.data);
        toast.success(`AI recommended: ${res.data.data.specialty}`);
      }
    } catch (err) {
      // Fallback result on API error
      const fallback = {
        specialty: 'General Physician',
        reasoning:
          'Based on standard primary care guidelines, a General Physician is recommended for comprehensive initial examination.',
        isFallback: true,
      };
      setResult(fallback);
      toast.error(err.message || 'AI service unavailable, showing fallback recommendation.');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleApply = () => {
    if (result?.specialty && onApplySpecialty) {
      onApplySpecialty(result.specialty);
      toast.success(`Applied filter: ${result.specialty}`);
    }
  };

  return (
    <Card glass className="border-teal-500/30 dark:border-teal-500/20 shadow-xl overflow-hidden mb-8">
      <CardHeader className="bg-gradient-to-r from-teal-500/10 via-blue-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>AI Symptom Navigator</CardTitle>
              <Badge variant="primary">Powered by Gemini AI</Badge>
            </div>
            <CardDescription>
              Unsure which doctor to visit? Describe your symptoms for instant intelligent specialty recommendations.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Example symptom chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Try an example prompt:
          </span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSymptoms(chip)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-left"
              >
                &ldquo;{chip}&rdquo;
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-3">
          <Textarea
            rows={3}
            placeholder="Describe what you are experiencing in detail..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!symptoms.trim()}
              icon={Sparkles}
            >
              {loading ? 'Analyzing Symptoms...' : 'Analyze Symptoms'}
            </Button>
          </div>
        </form>

        {/* Typing animation indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Gemini AI is processing your clinical symptoms...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Card */}
        <AnimatePresence>
          {result && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-900 dark:to-slate-900 border border-teal-200 dark:border-teal-800/80 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Recommended Specialty:
                  </span>
                  <Badge status="confirmed" className="text-sm px-3 py-1">
                    {result.specialty}
                  </Badge>
                  {result.isFallback && (
                    <span className="text-[10px] text-amber-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Fallback
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleApply}
                  icon={ArrowRight}
                >
                  Find {result.specialty} Doctors
                </Button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <strong className="text-slate-900 dark:text-slate-100">Clinical Reasoning:</strong>{' '}
                {result.reasoning}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default SymptomNavigator;
