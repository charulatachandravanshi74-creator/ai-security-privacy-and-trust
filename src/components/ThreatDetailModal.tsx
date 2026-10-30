import React from 'react';
import type { DetectedThreat } from '../types/index.ts';
import { RiskBadge } from './RiskBadge.tsx';
import { X, ShieldAlert, CheckCircle2, Copy, Check } from 'lucide-react';

interface ThreatDetailModalProps {
  threat: DetectedThreat | null;
  remediationSteps?: string[];
  onClose: () => void;
}

export const ThreatDetailModal: React.FC<ThreatDetailModalProps> = ({
  threat,
  remediationSteps = [],
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!threat) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Threat: ${threat.type}\nSeverity: ${threat.severity}\nDescription: ${threat.description}\nCWE: ${threat.cwe_id || 'N/A'}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <RiskBadge severity={threat.severity} size="sm" />
                {threat.cwe_id && (
                  <span className="text-xs font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                    {threat.cwe_id}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mt-1">{threat.type}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <div>
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
              Threat Vector Analysis
            </h4>
            <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {threat.description}
            </p>
          </div>

          {threat.location && (
            <div>
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                Detected Origin / Scope
              </h4>
              <p className="font-mono text-cyan-300 bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-800/40">
                {threat.location}
              </p>
            </div>
          )}

          {remediationSteps.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                Remediation Actions & Hardening
              </h4>
              <ul className="space-y-1.5">
                {remediationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Finding'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
