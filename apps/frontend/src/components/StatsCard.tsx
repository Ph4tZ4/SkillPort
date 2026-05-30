import React, { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  trend?: number;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, trend, className }) => {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded bg-surface-50 dark:bg-brand-900 flex items-center justify-center text-xl">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            <svg className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-5">
        <p className="text-3xl font-display font-bold text-brand-900 dark:text-brand-50 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mt-1">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
