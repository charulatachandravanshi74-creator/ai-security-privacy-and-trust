import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import type { ComplianceAudit, ComplianceFramework, ComplianceStatus } from '../types/index.ts';
import { RiskBadge } from '../components/RiskBadge.tsx';
import {
  FileCheck2,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Loader2,
  Printer,
  Download,
  Search,
  ChevronRight,
  Database,
  ArrowRight
} from 'lucide-react';

const FRAMEWORK_PRESETS = [
  {
    framework: 'GDPR' as ComplianceFramework,
    title: 'Customer Data Lake & Training Pipeline',
    scope: 'Batch ETL ingestion of multi-tenant user profiles, telemetry logs, and LLM fine-tuning datasets stored in S3/Cloud Storage.'
  },
  {
    framework: 'HIPAA' as ComplianceFramework,
    title: 'Telehealth Clinical API & EHR Gateway',
    scope: 'Patient portal microservices handling electronic Protected Health Information (ePHI), diagnostic telemetry, and lab results.'
  },
  {
    framework: 'SOC 2' as ComplianceFramework,
    title: 'Core Production Infrastructure & Auth IDP',
    scope: 'Production VPC, Kubernetes clusters, identity and access management (IAM), and continuous integration deployment pipelines.'
  },
  {
    framework: 'ISO 27001' as ComplianceFramework,
    title: 'Enterprise AI SaaS Security Boundary',
    scope: 'Multi-region cloud infrastructure, proprietary model weight encryption, and third-party vendor integration endpoints.'
  }
];

export const AssessmentsPage: React.FC = () => {
  const [framework, setFramework] = useState<ComplianceFramework>('GDPR');
  const [scopeDescription, setScopeDescription] = useState(FRAMEWORK_PRESETS[0].scope);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAudit, setActiveAudit] = useState<ComplianceAudit | null>(null);
  const [history, setHistory] = useState<ComplianceAudit[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await api.compliance.getReports();
      setHistory(res.audits);
      if (res.audits.length > 0 && !activeAudit) {
        setActiveAudit(res.audits[0]);
      }
    } catch (err) {
      console.error('Failed to fetch audits:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRunAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scopeDescription.length < 10) {
      setError('Scope description must be at least 10 characters.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await api.compliance.runAssessment({
        framework,
        scopeDescription
      });
      setActiveAudit(res.audit);
      setHistory((prev) => [res.audit, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to complete assessment.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="text-cyan-400" />
            <span>Privacy Impact Assessment (PIA) &amp; Risk Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated regulatory risk modeling mapped across GDPR, HIPAA, SOC 2, and ISO 27001
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeAudit && (
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Printer size={14} />
              <span>Print Assessment</span>
            </button>
          )}
        </div>
      </div>

      {/* Generator Form Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Generate Regulatory Audit</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Gemini 3.8 Flash Engine</span>
        </div>

        {/* Framework Preset Buttons */}
        <div className="mb-5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Regulatory Framework:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['GDPR', 'HIPAA', 'SOC 2', 'ISO 27001'] as ComplianceFramework[]).map((fw) => (
              <button
                key={fw}
                type="button"
                onClick={() => {
                  setFramework(fw);
                  const preset = FRAMEWORK_PRESETS.find((p) => p.framework === fw);
                  if (preset) setScopeDescription(preset.scope);
                }}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                  framework === fw
                    ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300 ring-1 ring-cyan-500 font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs">{fw}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRunAssessment} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                System Scope, Data Flows &amp; Architectural Context
              </label>
              <span className="text-[11px] text-slate-500">Min 10 characters</span>
            </div>
            <textarea
              required
              rows={4}
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              placeholder="Describe the application data flows, storage boundaries, API endpoints, and third-party processors..."
              className="w-full bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-cyan-500 font-mono leading-relaxed resize-y"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Database size={13} className="text-cyan-400" />
              <span>Report will be automatically saved to compliance_audits</span>
            </span>

            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Evaluating Controls &amp; Risks...</span>
                </>
              ) : (
                <>
                  <span>Run {framework} Assessment</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Main Assessment Output */}
      {activeAudit && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6 space-y-6">
          {/* Header Summary Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-300 px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                    {activeAudit.framework} Compliance Report
                  </span>
                  <RiskBadge severity={activeAudit.status} size="sm" />
                </div>
                <h3 className="text-lg font-bold text-white mt-2">Executive Compliance Evaluation</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {activeAudit.evaluation_summary}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-center shrink-0 min-w-[140px]">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Risk Score</div>
                <div
                  className={`text-3xl font-extrabold font-mono mt-0.5 ${
                    (activeAudit.report_details?.risk_score ?? 40) > 65
                      ? 'text-rose-400'
                      : (activeAudit.report_details?.risk_score ?? 40) > 35
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {activeAudit.report_details?.risk_score ?? 40}/100
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {(activeAudit.report_details?.risk_score ?? 40) < 30 ? 'Low Risk' : 'Remediation Required'}
                </div>
              </div>
            </div>
          </div>

          {/* Key Findings */}
          {activeAudit.report_details?.key_findings && activeAudit.report_details.key_findings.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Key Analytical Findings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeAudit.report_details.key_findings.map((f, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-300 leading-relaxed">
                    <div className="font-mono text-[10px] text-cyan-400 font-bold mb-1">Finding #{i + 1}</div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls Evaluated */}
          {activeAudit.report_details?.controls_evaluated && activeAudit.report_details.controls_evaluated.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Evaluated Control Articles &amp; Benchmarks
              </h4>
              <div className="space-y-3">
                {activeAudit.report_details.controls_evaluated.map((ctrl, i) => {
                  let statusBg = 'bg-slate-800 text-slate-300 border-slate-700';
                  let StatusIcon = AlertCircle;

                  if (ctrl.status === 'Pass') {
                    statusBg = 'bg-emerald-950/70 text-emerald-300 border-emerald-800';
                    StatusIcon = CheckCircle2;
                  } else if (ctrl.status === 'Fail') {
                    statusBg = 'bg-rose-950/70 text-rose-300 border-rose-800';
                    StatusIcon = XCircle;
                  } else if (ctrl.status === 'Partial') {
                    statusBg = 'bg-amber-950/70 text-amber-300 border-amber-800';
                    StatusIcon = AlertCircle;
                  }

                  return (
                    <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-white">
                            {ctrl.control_id}
                          </span>
                          <span className="text-xs font-bold text-white">{ctrl.title}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${statusBg}`}>
                          <StatusIcon size={12} />
                          <span>{ctrl.status}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="font-semibold text-slate-400 text-[10px] uppercase block mb-1">
                            Auditor Observation
                          </span>
                          <span className="text-slate-300">{ctrl.finding}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="font-semibold text-cyan-400 text-[10px] uppercase block mb-1">
                            Target Recommendation
                          </span>
                          <span className="text-slate-300">{ctrl.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remediation Action Plan */}
          {activeAudit.report_details?.remediation_checklist && activeAudit.report_details.remediation_checklist.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>Regulatory Remediation Action Plan</span>
              </h4>
              <div className="space-y-2">
                {activeAudit.report_details.remediation_checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-mono text-cyan-400 text-[11px] font-bold">0{i + 1}</span>
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical Assessments Carousel */}
      {history.length > 0 && (
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Previous Compliance Assessments ({history.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {history.slice(0, 6).map((audit) => (
              <button
                key={audit.id}
                type="button"
                onClick={() => setActiveAudit(audit)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  activeAudit?.id === audit.id
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-white">{audit.framework}</span>
                  <RiskBadge severity={audit.status} size="sm" showIcon={false} />
                </div>
                <div className="text-xs text-slate-400 line-clamp-1">{audit.evaluation_summary}</div>
                <div className="text-[10px] text-slate-500 mt-2 font-mono">
                  {new Date(audit.created_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
