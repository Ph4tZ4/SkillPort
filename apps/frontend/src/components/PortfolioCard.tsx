import React from 'react';
import { Link } from 'react-router-dom';
import { getProfessionInfo, truncate, formatNumber } from '../utils/helpers';
import SkillBadge from './SkillBadge';

interface PortfolioCardProps {
  id: string;
  title: string;
  profession: string;
  summary: string;
  skills: Array<{ name: string; level: string }>;
  viewCount: number;
  userName?: string;
  avatarUrl?: string;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  id, title, profession, summary, skills, viewCount, userName, avatarUrl,
}) => {
  const profInfo = getProfessionInfo(profession);

  return (
    <Link to={`/portfolio/${id}`} className="block group" id={`portfolio-card-${id}`}>
      <div className="card p-6 hover:-translate-y-1 hover:shadow-elevate transition-all duration-300 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className={`w-10 h-10 rounded bg-surface-100 dark:bg-brand-800 flex items-center justify-center text-brand-900 dark:text-brand-100 group-hover:scale-105 transition-transform`}>
            <profInfo.icon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5 text-surface-400 dark:text-surface-500 text-sm font-medium tracking-wide">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {formatNumber(viewCount)}
          </div>
        </div>

        {/* Title & Summary */}
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-5 flex-grow leading-relaxed">
          {truncate(summary || 'No description yet', 100)}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {skills.slice(0, 3).map((skill) => (
            <SkillBadge key={skill.name} name={skill.name} />
          ))}
          {skills.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-surface-100 dark:bg-brand-800 text-surface-500 dark:text-surface-400">
              +{skills.length - 3}
            </span>
          )}
        </div>

        {/* Author */}
        {userName && (
          <div className="flex items-center gap-3 pt-4 border-t border-surface-200 dark:border-brand-800">
            <div className="w-7 h-7 rounded-full bg-surface-200 dark:bg-brand-700 flex items-center justify-center text-surface-700 dark:text-surface-300 text-xs font-semibold">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{userName}</span>
            <span className="ml-auto text-xs text-surface-500 dark:text-surface-400 font-medium">
              {profInfo.label}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PortfolioCard;
