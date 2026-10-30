import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Shield, Lock, Mail, ArrowRight, Loader2, Sparkles, UserCheck } from 'lucide-react';
import type { UserRole } from '../types/index.ts';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = async (role: UserRole) => {
    setError(null);
    try {
      await quickLogin(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950 relative">
      {/* Background ambient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 mx-auto mb-3 shadow-md shadow-cyan-950">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to TrustShield AI</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access enterprise AI threat telemetry, scanner &amp; audit records
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mb-6 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">
            <Sparkles size={13} />
            <span>Instant Demo Access (1-Click)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('Admin')}
              className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 hover:text-cyan-300 text-xs font-semibold text-slate-300 transition-colors"
            >
              SecOps Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('Auditor')}
              className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-blue-500 hover:text-blue-300 text-xs font-semibold text-slate-300 transition-colors"
            >
              Compliance
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('Developer')}
              className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 text-xs font-semibold text-slate-300 transition-colors"
            >
              AI Developer
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating JWT...</span>
              </>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Need a new TrustShield account?{' '}
          <Link to="/register" className="text-cyan-400 font-bold hover:underline">
            Register Organization
          </Link>
        </p>
      </div>
    </div>
  );
};
