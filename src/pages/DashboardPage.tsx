import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { DashboardStats, SecurityScan, DetectedThreat } from '../types/index.ts';
import { StatCard } from '../components/StatCard.tsx';
import { RiskBadge } from '../components/RiskBadge.tsx';
import { ThreatDetailModal } from '../components/ThreatDetailModal.tsx';
import { ExportModal } from '../components/ExportModal.tsx';
import {
  ShieldAlert,
  Lock,
  FileCheck2,
  Scan,
  Activity,
  ArrowUpRight,
  Download,
  Plus,
  RefreshCw,
  Clock,
  Layers,
  AlertTriangle,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState<DetectedThreat | null>(null);
  const [remediationSteps, setRemediationSteps] = useState<string[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await api.dashboard.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load telemetry stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleInspectThreat = (scan: SecurityScan) => {
    if (scan.detected_threats && scan.detected_threats.length > 0) {
      setSelectedThreat(scan.detected_threats[0]);
      setRemediationSteps(scan.remediation_steps || []);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Security Posture Telemetry</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-bold">
              {user?.role} Scope
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time vulnerability metrics, PII leak protection sentinel, and compliance readiness
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-cyan-400' : ''} />
          </button>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <Download size={14} />
            <span>Export Logs</span>
          </button>

          <Link
            to="/scanner"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950 transition-all"
          >
            <Plus size={14} />
            <span>Initiate Scan</span>
          </Link>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Posture Risk"
          value={stats ? `${stats.avgRiskScore}/100` : '--'}
          subtitle={stats && stats.avgRiskScore > 50 ? 'Elevated threat level' : 'Normal operating limits'}
          change="+3.2%"
          isPositiveChange={false}
          icon={Activity}
          accentColor={stats && stats.avgRiskScore > 65 ? 'rose' : stats && stats.avgRiskScore > 35 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Critical Vulnerabilities"
          value={stats ? stats.criticalThreatsCount : '--'}
          subtitle="CWE & OWASP violations"
          change="-2 resolved"
          isPositiveChange={true}
          icon={ShieldAlert}
          accentColor="rose"
        />

        <StatCard
          title="PII Leaks Prevented"
          value={stats ? stats.piiLeaksPrevented : '--'}
          subtitle="SSN, CC & credentials masked"
          change="+18 this week"
          isPositiveChange={true}
          icon={Lock}
          accentColor="cyan"
        />

        <StatCard
          title="Compliance Audits"
          value={stats ? stats.activeComplianceCount : '--'}
          subtitle="GDPR, HIPAA, SOC 2, ISO"
          change="All verified"
          isPositiveChange={true}
          icon={FileCheck2}
          accentColor="emerald"
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Threat &amp; Scan Volume Timeline</h3>
              <p className="text-xs text-slate-400">Scans ingested vs detected security anomalies</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Scans</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Threats</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.scansTimeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="threatsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="scans" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#scansGradient)" />
                <Area type="monotone" dataKey="threats" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#threatsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown Donut */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Threat Severity Distribution</h3>
            <p className="text-xs text-slate-400">Categorized risk classification</p>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.severityBreakdown || []}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {(stats?.severityBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
            {(stats?.severityBreakdown || []).map((item) => (
              <div key={item.severity} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.severity}</span>
                </span>
                <span className="font-mono font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Readiness Cards & Top PII Detected */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Readiness */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Regulatory Framework Readiness</h3>
              <p className="text-xs text-slate-400">Automated audit adherence scores</p>
            </div>
            <Link to="/assessments" className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1">
              <span>Run PIA Audit</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(stats?.complianceScoreByFramework || []).map((item) => (
              <div key={item.framework} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-xs px-2 py-0.5 rounded bg-slate-800">
                    {item.framework}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">{item.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Status:</span>
                  <RiskBadge severity={item.status} size="sm" showIcon={false} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top PII Categories */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white tracking-tight">Sensitive PII Redacted</h3>
          <p className="text-xs text-slate-400 mb-4">Most frequent data leaks prevented</p>

          <div className="space-y-3">
            {(stats?.topPiiTypes || []).map((pii, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock size={13} className="text-cyan-400" />
                  <span className="text-xs font-medium text-slate-300 truncate max-w-[140px]">{pii.type}</span>
                </div>
                <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/50">
                  {pii.count} leaks
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Recent AI Security Scans</h3>
            <p className="text-xs text-slate-400">Inspected payloads, risk ratings, and remediation steps</p>
          </div>
          <Link to="/scanner" className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1">
            <span>Open Scanner Workspace</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Scan Type</th>
                <th className="py-2.5 px-3">Snippet Preview</th>
                <th className="py-2.5 px-3">Risk Rating</th>
                <th className="py-2.5 px-3">Threats</th>
                <th className="py-2.5 px-3">PII Masked</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats?.recentScans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No scans registered yet. Click &quot;Initiate Scan&quot; to test.
                  </td>
                </tr>
              ) : (
                stats?.recentScans.map((scan) => {
                  let riskColor = 'text-emerald-400';
                  if (scan.risk_score > 65) riskColor = 'text-rose-400';
                  else if (scan.risk_score > 35) riskColor = 'text-amber-400';

                  return (
                    <tr key={scan.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {scan.scan_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate font-mono text-slate-400">
                        {scan.input_content.replace(/\n/g, ' ')}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`font-mono font-bold ${riskColor}`}>{scan.risk_score}/100</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {scan.detected_threats?.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <RiskBadge severity={scan.detected_threats[0].severity} size="sm" />
                            {scan.detected_threats.length > 1 && (
                              <span className="text-[10px] text-slate-400 font-bold">+{scan.detected_threats.length - 1}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500">Clean</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-slate-300">
                          {scan.pii_found?.length || 0} items
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleInspectThreat(scan)}
                          className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                        >
                          <Eye size={15} />
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

      {/* Threat Detail Modal */}
      <ThreatDetailModal
        threat={selectedThreat}
        remediationSteps={remediationSteps}
        onClose={() => setSelectedThreat(null)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
