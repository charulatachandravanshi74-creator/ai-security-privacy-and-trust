import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Shield,
  Scan,
  Lock,
  FileCheck2,
  Database,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Server,
  Layers,
  ChevronRight,
  Terminal,
  Activity
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge.tsx';

export const LandingPage: React.FC = () => {
  const { user, quickLogin } = useAuth();
  const [sandboxInput, setSandboxInput] = useState(
    'const aws_key = "AKIAIOSFODNN7EXAMPLE";\nconst customerSSN = "000-12-3456";\nconst query = "SELECT * FROM users WHERE id = " + req.body.id;'
  );
  const [sandboxResult, setSandboxResult] = useState<any>({
    risk_score: 94,
    threats: [
      { type: 'Hardcoded AWS Access Key', severity: 'Critical' },
      { type: 'SQL Injection Interpolation', severity: 'High' }
    ],
    pii: ['Social Security Number (***-**-3456)', 'AWS Credential (AKIA****************)']
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTestScan = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setSandboxResult({
        risk_score: 89,
        threats: [
          { type: 'Hardcoded Cloud Key Detected', severity: 'Critical' },
          { type: 'Unescaped SQL Dynamic Query', severity: 'High' }
        ],
        pii: ['SSN Identifier Masked', 'Cloud API Token Redacted']
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-600/15 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-800/50 text-xs font-semibold text-cyan-300 mb-6 shadow-sm">
          <Sparkles size={14} className="text-cyan-400" />
          <span>Next-Gen Enterprise AI Security Sentinel</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-slate-400">Powered by Gemini 3.8 Flash</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Enterprise Security, Privacy & <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">AI Trust Platform</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Safeguard your data streams against PII leakage, detect critical vulnerabilities in code and payloads, automate Privacy Impact Assessments (PIA), and enforce continuous compliance across GDPR, HIPAA, and SOC 2.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-950 transition-all scale-100 hover:scale-[1.02]"
            >
              <span>Go to Security Telemetry</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-950 transition-all scale-100 hover:scale-[1.02]"
              >
                <span>Launch Free Sentinel Trial</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => quickLogin('Admin')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors"
              >
                <span>Quick Demo as Admin</span>
                <ChevronRight size={15} />
              </button>
            </>
          )}
        </div>

        {/* Live Interactive Sandbox Preview */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden text-left">
          {/* Header Bar */}
          <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-400">interactive-sentinel-sandbox.ts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                Live AI Inspector
              </span>
              <button
                type="button"
                onClick={handleTestScan}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 disabled:opacity-50"
              >
                <Zap size={12} />
                <span>{isAnalyzing ? 'Scanning...' : 'Test Scan'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Input payload */}
            <div className="p-4 bg-slate-950/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Input Code / Data Payload
                </span>
                <span className="text-[11px] text-slate-400">Editable preview</span>
              </div>
              <textarea
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                rows={5}
                className="w-full bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Live Sentinel Results */}
            <div className="p-4 bg-slate-900/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sentinel Verdict
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-rose-400">
                    <span>Risk: {sandboxResult.risk_score}/100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Threats Detected:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {sandboxResult.threats.map((t: any, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950/70 border border-rose-800 text-rose-300">
                        <AlertTriangle size={11} />
                        {t.type}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 font-semibold uppercase mt-2">PII Safeguarded:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {sandboxResult.pii.map((p: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/70 border border-cyan-800 text-cyan-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={13} />
                  <span>Auto-remediation generated</span>
                </span>
                <Link to="/scanner" className="text-cyan-400 font-bold hover:underline flex items-center gap-0.5">
                  <span>Open Full Workspace</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="py-16 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">Enterprise Defense Architecture</h2>
            <p className="text-3xl font-extrabold text-white tracking-tight">
              Unified Security, Privacy, and Trust Stack
            </p>
            <p className="text-slate-400 text-sm mt-3">
              Four synchronized defense layers designed for enterprise scale, zero false negatives on critical secrets, and seamless compliance auditing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-cyan-800/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Scan size={24} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">AI-Powered Threat Sentinel</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detects OWASP vulnerabilities, prompt injection attacks, unescaped SQL templates, and exposed cryptographic keys in real time.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-blue-800/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Lock size={24} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">PII Safeguarding & Redaction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatic edge masking of SSNs, credit cards, protected health data (PHI), and API secrets before LLM ingestion.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-800/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileCheck2 size={24} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Automated PIA & Risk Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate structured compliance assessments mapped against GDPR, HIPAA, SOC 2, and ISO 27001 with pass/fail findings.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-purple-800/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Database size={24} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">PostgreSQL RLS & Audit Export</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Row-Level Security guarantees user isolation while admins inspect global logs. Export compliant audit records to JSON and CSV.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Domains & Compliance Badges */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Ready for Global Regulations</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
                Continuous Governance for Modern AI Workloads
              </h2>
              <p className="text-slate-400 text-sm mt-4 leading-relaxed">
                TrustShield AI bridges the gap between fast-moving AI developers and rigorous legal compliance officers. Maintain a verifiable, tamper-evident audit trail for every prompt, payload, and model deployment.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                  <span>GDPR Art. 17 & 25 Readiness</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                  <span>HIPAA 164.312 Transmission</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                  <span>SOC 2 Type II CC6 / CC7</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                  <span>ISO 27001:2022 Controls</span>
                </div>
              </div>
            </div>

            {/* Visual Telemetry Blueprint */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Activity size={14} />
                  <span>telemetry_stream.log</span>
                </span>
                <span className="text-[10px] text-emerald-400">200 OK</span>
              </div>
              <div className="text-slate-400 space-y-1">
                <div>[00:01:14] <span className="text-cyan-400">POST /api/security/scan</span> (24ms)</div>
                <div>[00:01:15] <span className="text-amber-400">ALERT</span>: Detected AWS Key in req.body -&gt; Masked</div>
                <div>[00:01:16] <span className="text-emerald-400">PERSIST</span>: Stored scan to postgres.security_scans</div>
                <div>[00:01:17] <span className="text-cyan-400">AUDIT</span>: Generated remediation steps &amp; CWE-798</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-cyan-400" />
            <span className="font-bold text-slate-300">TrustShield AI Sentinel</span>
            <span>— Enterprise AI Security &amp; Trust Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/login" className="hover:text-white">Sign In</Link>
            <Link to="/register" className="hover:text-white">Register</Link>
            <span>v2.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
