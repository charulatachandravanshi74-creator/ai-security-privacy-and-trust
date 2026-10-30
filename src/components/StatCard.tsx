import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositiveChange?: boolean;
  icon: LucideIcon;
  accentColor?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositiveChange = true,
  icon: Icon,
  accentColor = 'cyan'
}) => {
  const colorMap = {
    cyan: {
      bg: 'bg-cyan-950/40 border-cyan-800/40 text-cyan-400 group-hover:border-cyan-600/60',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    rose: {
      bg: 'bg-rose-950/40 border-rose-800/40 text-rose-400 group-hover:border-rose-600/60',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    },
    amber: {
      bg: 'bg-amber-950/40 border-amber-800/40 text-amber-400 group-hover:border-amber-600/60',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    emerald: {
      bg: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400 group-hover:border-emerald-600/60',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    purple: {
      bg: 'bg-purple-950/40 border-purple-800/40 text-purple-400 group-hover:border-purple-600/60',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
  };

  const style = colorMap[accentColor];

  return (
    <div className={`relative group rounded-xl border p-5 transition-all duration-200 bg-slate-900/60 backdrop-blur-md ${style.bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg border ${style.iconBg} transition-transform group-hover:scale-105`}>
          <Icon size={22} />
        </div>
      </div>

      {change && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className={`font-semibold flex items-center gap-1 ${isPositiveChange ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span>{isPositiveChange ? '▲' : '▼'}</span>
            <span>{change}</span>
          </span>
          <span className="text-slate-500">vs previous period</span>
        </div>
      )}
    </div>
  );
};
