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

  const getColor = () => {
    if (score >= 80) return { stroke: '#10b981', bg: '#ecfdf5', text: '#065f46' };
    if (score >= 60) return { stroke: '#6366f1', bg: '#eef2ff', text: '#3730a3' };
    if (score >= 40) return { stroke: '#f59e0b', bg: '#fffbeb', text: '#92400e' };
    return { stroke: '#ef4444', bg: '#fef2f2', text: '#991b1b' };
  };

  const color = getColor();

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color.stroke} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color: color.text }}>
        {Math.round(score)}%
      </span>
    </div>
  );
};

export default MatchScoreRing;
