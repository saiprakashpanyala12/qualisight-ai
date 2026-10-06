import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', badge }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-300'
    },
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300'
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300'
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300'
    },
    cyan: {
      bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300'
    }
  };

  const currentTheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2 rounded-lg border ${currentTheme.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${currentTheme.badge}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};

export default MetricCard;
