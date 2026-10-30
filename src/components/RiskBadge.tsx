import React from 'react';
import type { ThreatSeverity } from '../types/index.ts';
import { AlertOctagon, AlertTriangle, AlertCircle, Info, ShieldCheck } from 'lucide-react';

interface RiskBadgeProps {
  severity: ThreatSeverity | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  severity,
  size = 'md',
  showIcon = true
}) => {
  const norm = severity.toLowerCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let IconComponent = Info;

  if (norm === 'critical') {
    colorClasses = 'bg-rose-950/80 text-rose-300 border-rose-800/80 shadow-xs shadow-rose-950';
    IconComponent = AlertOctagon;
  } else if (norm === 'high') {
    colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-800/80 shadow-xs shadow-amber-950';
    IconComponent = AlertTriangle;
  } else if (norm === 'medium') {
    colorClasses = 'bg-yellow-950/60 text-yellow-300 border-yellow-700/60';
    IconComponent = AlertCircle;
  } else if (norm === 'low') {
    colorClasses = 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60';
    IconComponent = Info;
  } else if (norm === 'informational' || norm === 'info' || norm === 'compliant') {
    colorClasses = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
    IconComponent = ShieldCheck;
  }

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1'
    : size === 'lg'
    ? 'text-sm px-3.5 py-1.5 gap-2 font-medium'
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  const iconSizes = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  return (
    <span className={`inline-flex items-center rounded-md border tracking-wide uppercase font-semibold ${colorClasses} ${sizeClasses}`}>
      {showIcon && <IconComponent size={iconSizes} className="shrink-0" />}
      <span>{severity}</span>
    </span>
  );
};
