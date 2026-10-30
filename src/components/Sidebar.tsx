import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Scan,
  FileCheck2,
  ScrollText,
  Settings,
  ShieldAlert,
  Database,
  Lock,
  ExternalLink
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Security Telemetry',
      icon: LayoutDashboard,
      badge: 'Live'
    },
    {
      to: '/scanner',
      label: 'Threat & PII Scanner',
      icon: Scan,
      badge: 'AI'
    },
    {
      to: '/assessments',
      label: 'Privacy Assessments',
      icon: FileCheck2,
      badge: 'PIA'
    },
    {
      to: '/audits',
      label: 'Compliance Audits',
      icon: ScrollText
    },
    {
      to: '/settings',
      label: 'Security Settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        {/* User Identity Snippet */}
        {user && (
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.organization || 'TrustShield Cloud'}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Assigned Role:</span>
              <span className="font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 uppercase text-[10px]">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Workspaces & Auditing
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 text-cyan-300 border border-cyan-800/50 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Framework Readiness Mini-Widget */}
        <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Lock size={12} className="text-emerald-400" />
              <span>Frameworks Active</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">4/4</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-mono">
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-center">GDPR</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-center">HIPAA</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-center">SOC 2</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-center">ISO 27001</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Database size={13} className="text-cyan-400" />
          <span>PostgreSQL RLS Isolated</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">TrustShield v2.4 (Gemini 3.8 Flash)</p>
      </div>
    </aside>
  );
};
