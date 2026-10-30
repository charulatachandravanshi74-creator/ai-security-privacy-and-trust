import React, { useState } from 'react';
import type { ComplianceAudit } from '../types/index.ts';
import { RiskBadge } from './RiskBadge.tsx';
import { Eye, ShieldAlert, CheckCircle, AlertTriangle, Search, ChevronRight } from 'lucide-react';

interface ComplianceTableProps {
  audits: ComplianceAudit[];
  onSelectAudit: (audit: ComplianceAudit) => void;
}

export const ComplianceTable: React.FC<ComplianceTableProps> = ({ audits, onSelectAudit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('ALL');

  const filtered = audits.filter((audit) => {
    const matchesSearch =
      audit.framework.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.evaluation_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (audit.user_email && audit.user_email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFramework = frameworkFilter === 'ALL' || audit.framework === frameworkFilter;

    return matchesSearch && matchesFramework;
  });

  return (
    <div className="space-y-3">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search audits, findings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'GDPR', 'HIPAA', 'SOC 2', 'ISO 27001'].map((fw) => (
            <button
              key={fw}
              type="button"
              onClick={() => setFrameworkFilter(fw)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                frameworkFilter === fw
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {fw}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Framework</th>
              <th className="py-3 px-4">Evaluation Summary</th>
              <th className="py-3 px-4">Compliance Status</th>
              <th className="py-3 px-4">Risk Rating</th>
              <th className="py-3 px-4">Audited By</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No compliance assessment records found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((audit) => {
                const riskScore = audit.report_details?.risk_score ?? 40;
                let scoreColor = 'text-emerald-400';
                if (riskScore > 65) scoreColor = 'text-rose-400';
                else if (riskScore > 35) scoreColor = 'text-amber-400';

                return (
                  <tr
                    key={audit.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectAudit(audit)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {audit.framework}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-300 font-medium">
                      {audit.evaluation_summary}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <RiskBadge severity={audit.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${scoreColor}`}>{riskScore}/100</span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              riskScore > 65 ? 'bg-rose-500' : riskScore > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${riskScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                      {audit.user_email || audit.report_details?.assessed_by || 'Security Team'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(audit.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAudit(audit);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 text-slate-300 border border-slate-700 transition-colors text-xs font-semibold"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
