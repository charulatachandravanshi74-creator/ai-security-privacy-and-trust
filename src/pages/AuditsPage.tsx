import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import type { ComplianceAudit } from '../types/index.ts';
import { ComplianceTable } from '../components/ComplianceTable.tsx';
import { ExportModal } from '../components/ExportModal.tsx';
import { RiskBadge } from '../components/RiskBadge.tsx';
import {
  ScrollText,
  Download,
  RefreshCw,
  FileCheck2,
  CheckCircle2,
  X,
  Printer,
  Calendar,
  Database
} from 'lucide-react';

export const AuditsPage: React.FC = () => {
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<ComplianceAudit | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchAudits = async () => {
    try {
      const res = await api.compliance.getReports();
      setAudits(res.audits);
    } catch (err) {
      console.error('Failed to load audits:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAudits();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ScrollText className="text-cyan-400" />
            <span>Compliance Audit Logs &amp; Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable regulatory audit ledger persisted in PostgreSQL with CSV and JSON archive export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            title="Refresh logs"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-cyan-400' : ''} />
          </button>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950 transition-all"
          >
            <Download size={14} />
            <span>Export Audit Archive</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <ComplianceTable audits={audits} onSelectAudit={(audit) => setSelectedAudit(audit)} />

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {selectedAudit.framework}
                  </span>
                  <RiskBadge severity={selectedAudit.status} size="sm" />
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">Compliance Evaluation Record</h3>
                <p className="text-xs text-slate-400">Audit ID: {selectedAudit.id}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                  Executive Summary
                </span>
                <p className="text-slate-300 leading-relaxed">{selectedAudit.evaluation_summary}</p>
              </div>

              {selectedAudit.report_details?.key_findings && (
                <div>
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                    Key Findings
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedAudit.report_details.key_findings.map((f, i) => (
                      <li key={i} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-slate-300">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedAudit.report_details?.controls_evaluated && (
                <div>
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                    Control Benchmarks
                  </h4>
                  <div className="space-y-2">
                    {selectedAudit.report_details.controls_evaluated.map((ctrl, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-white">{ctrl.control_id} - {ctrl.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ctrl.status === 'Pass' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                          }`}>
                            {ctrl.status}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1">{ctrl.finding}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
              >
                <Printer size={14} />
                <span>Print Record</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
};
