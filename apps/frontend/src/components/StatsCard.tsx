import React from 'react';

interface StatsCardProps {
  icon: string;
  label: string;
  value: number | string;
  trend?: number;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, trend, className }) => {
  return (
    <div className={`glass-card p-6 card-hover ${className}`}>
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            <svg className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="stat-value text-surface-900">{value}</p>
        <p className="text-sm text-surface-500 mt-1">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
