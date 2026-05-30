import React from 'react';
import { stringToColor, cn } from '../utils/helpers';

interface SkillBadgeProps {
  name: string;
  level?: string;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ name, level, removable, onRemove, className }) => {
  const colorClass = stringToColor(name);
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold tracking-wide border', colorClass, className)}>
      {name}
      {level && <span className="opacity-70 font-normal">· {level}</span>}
      {removable && (
        <button onClick={onRemove} className="ml-1 hover:text-red-500 transition-colors" aria-label={`Remove ${name}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default SkillBadge;
