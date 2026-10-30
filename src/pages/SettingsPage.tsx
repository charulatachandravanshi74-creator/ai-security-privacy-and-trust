import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Settings,
  User,
  Shield,
  Key,
  Database,
  Lock,
  Copy,
  Check,
  Bell,
  Sliders,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import type { UserRole } from '../types/index.ts';

export const SettingsPage: React.FC = () => {
  const { user, quickLogin } = useAuth();
  const [copiedToken, setCopiedToken] = useState(false);
  const [maskingLevel, setMaskingLevel] = useState('strict');
  const [quarantineEnabled, setQuarantineEnabled] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://security-ops.enterprise.internal/webhooks/sentinel');
  const [savedSettings, setSavedSettings] = useState(false);

  // Generate simulated client token for CI/CD integration
  const generatedToken = user ? `tshield_sec_${btoa(user.id).replace(/=/g, '')}_${Date.now().toString(36)}` : '';

  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  const handleSwitchRole = async (newRole: UserRole) => {
    await quickLogin(newRole);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="text-cyan-400" />
          <span>Security &amp; Organization Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage user profile credentials, access roles, API integration tokens, and automated defense policies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Role (1 col) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-white text-sm truncate">{user?.fullName}</h3>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Current Role:</span>
                <span className="font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  {user?.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Organization:</span>
                <span className="font-semibold text-white">{user?.organization || 'TrustShield Cloud'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Account ID:</span>
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">{user?.id}</span>
              </div>
            </div>

            {/* Quick Role Switcher for Testing */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                <Sparkles size={12} />
                <span>Test Other Role Permissions</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Admin', 'Auditor', 'Developer'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSwitchRole(r)}
                    className={`py-1.5 text-center text-xs font-semibold rounded-lg border transition-colors ${
                      user?.role === r
                        ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Database & RLS Status Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database size={15} className="text-cyan-400" />
              <span>Data Isolation &amp; Ledger</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Row Level Security</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Audit Immutability</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Enforced
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Connection Engine</span>
                <span className="font-mono text-cyan-400 text-[11px]">pg.Pool / RLS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: API Tokens & Policies (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* API Token Management */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Key size={16} className="text-cyan-400" />
                  <span>CI/CD Automation API Token</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authorize GitHub Actions, GitLab CI, or pre-commit hooks to call <code className="font-mono text-cyan-400">/api/security/scan</code>
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                Active Token
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-slate-300 truncate">{generatedToken}</span>
              <button
                type="button"
                onClick={handleCopyToken}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 shrink-0"
              >
                {copiedToken ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
              </button>
            </div>
          </div>

          {/* Privacy Sentinel Defense Policies Form */}
          <form onSubmit={handleSavePolicies} className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders size={16} className="text-cyan-400" />
                <span>Automated Defense &amp; PII Redaction Policies</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure real-time threshold guardrails for incoming prompt and code streams
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  PII Masking Rigor Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMaskingLevel('strict')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      maskingLevel === 'strict'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-500'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-white">Strict Zero-Trust (Recommended)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Masks all SSNs, payment card numbers, patient health identifiers, and cloud keys at ingest.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMaskingLevel('moderate')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      maskingLevel === 'moderate'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-500'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-white">Selective Masking</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Redacts only High and Critical severity tokens while allowing internal identifiers.
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Critical Incident Webhook Dispatcher
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-hidden focus:border-cyan-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Dispatches JSON incident notifications whenever a scan risk score exceeds 80/100.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-xs">Automated Payload Quarantine</div>
                  <div className="text-[11px] text-slate-400">Block untrusted LLM prompts containing prompt injections</div>
                </div>
                <input
                  type="checkbox"
                  checked={quarantineEnabled}
                  onChange={(e) => setQuarantineEnabled(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {savedSettings && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>Security policies updated and synced across Sentinel cluster.</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950 transition-all"
              >
                Save Defense Policies
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
