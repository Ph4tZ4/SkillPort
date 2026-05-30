import React from 'react';

interface MatchScoreRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const MatchScoreRing: React.FC<MatchScoreRingProps> = ({ score, size = 64, strokeWidth = 5, className }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Use elegant minimal colors instead of bright semantic colors
  const getColor = () => {
    if (score >= 80) return { stroke: 'currentColor', text: 'currentColor', class: 'text-brand-900 dark:text-brand-50' };
    if (score >= 60) return { stroke: 'currentColor', text: 'currentColor', class: 'text-surface-700 dark:text-surface-300' };
    if (score >= 40) return { stroke: 'currentColor', text: 'currentColor', class: 'text-surface-500 dark:text-surface-500' };
    return { stroke: 'currentColor', text: 'currentColor', class: 'text-surface-400 dark:text-surface-600' };
  };

  const color = getColor();

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="currentColor" 
          strokeWidth={strokeWidth} 
          fill="none"
          className="text-surface-200 dark:text-brand-800"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color.stroke} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-all duration-1000 ease-out ${color.class}`}
        />
      </svg>
      <span className={`absolute text-sm font-bold font-display tracking-tight ${color.class}`}>
        {Math.round(score)}%
      </span>
    </div>
  );
};

export default MatchScoreRing;
