import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  trendText?: string;
  trendColor?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-forest-50',
  iconTextColor = 'text-forest-700',
  trendText,
  trendColor = 'text-emerald-700 bg-emerald-50 border-emerald-200',
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 tracking-tight font-sans">
            {value}
          </h3>
        </div>
        <div
          className={`p-3 rounded-xl ${iconBgColor} ${iconTextColor} transition-transform group-hover:scale-105 duration-200 shadow-sm`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
        {trendText && (
          <span
            className={`px-2 py-0.5 rounded-full font-semibold border text-[11px] ${trendColor}`}
          >
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
};
