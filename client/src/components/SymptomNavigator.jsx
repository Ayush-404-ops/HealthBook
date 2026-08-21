import React, { useState } from 'react';
import api from '../api/axios';
import Spinner from './Spinner';
import toast from 'react-hot-toast';
import { FiCpu, FiArrowRight, FiCheckCircle, FiHelpCircle } from 'react-icons/fi';

const SymptomNavigator = ({ onApplySpecialty }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms || symptoms.trim().length < 5) {
      toast.error('Please describe your symptoms in a few words (at least 5 characters)');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/navigate', { symptoms });
      if (res.data?.success) {
        setResult(res.data.data);
        toast.success(`AI recommends seeing a ${res.data.data.specialty}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result?.specialty && onApplySpecialty) {
      onApplySpecialty(result.specialty);
      toast.success(`Filter set to ${result.specialty}`);
    }
  };

  return (
    <div
      className="card card-glass animate-fade-up"
      style={{
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid rgba(0, 212, 170, 0.25)',
        boxShadow: '0 0 24px rgba(0, 212, 170, 0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#080d1a',
            fontSize: '1.3rem',
          }}
        >
          <FiCpu />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>AI Symptom Navigator</h2>
          <p style={{ fontSize: '0.88rem' }}>
            Unsure which specialist to see? Describe your symptoms to receive instant medical specialty recommendations.
          </p>
        </div>
      </div>

      <form onSubmit={handleAnalyze}>
        <div className="input-group" style={{ marginBottom: '16px' }}>
          <textarea
            className="input"
            rows={3}
            placeholder="e.g. I have a persistent dry cough, fever, and difficulty breathing when walking..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !symptoms.trim()}
          >
            {loading ? 'Analyzing Symptoms...' : (
              <>
                <FiCpu /> Analyze Symptoms <FiArrowRight />
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Recommendation Result Card */}
      {result && (
        <div
          className="animate-fade-up"
          style={{
            marginTop: '20px',
            padding: '16px 20px',
            borderRadius: 'var(--r-md)',
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-primary)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCheckCircle color="var(--clr-primary)" size={20} />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Recommended Specialist:</span>
              <span className="badge badge-primary" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                {result.specialty}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleApply}
            >
              Filter Doctors by {result.specialty}
            </button>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', lineHeight: '1.5' }}>
            <strong>AI Clinical Reasoning:</strong> {result.reasoning}
          </p>
        </div>
      )}
    </div>
  );
};

export default SymptomNavigator;
