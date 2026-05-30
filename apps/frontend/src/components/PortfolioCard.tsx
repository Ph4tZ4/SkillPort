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
      <div className="glass-card p-6 card-hover h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${profInfo.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
            {profInfo.icon}
          </div>
          <div className="flex items-center gap-1.5 text-surface-400 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {formatNumber(viewCount)}
          </div>
        </div>

        {/* Title & Summary */}
        <h3 className="text-lg font-semibold text-surface-900 mb-1 group-hover:text-brand-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-surface-500 mb-4 flex-grow">
          {truncate(summary || 'No description yet', 120)}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.slice(0, 4).map((skill) => (
            <SkillBadge key={skill.name} name={skill.name} />
          ))}
          {skills.length > 4 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-500">
              +{skills.length - 4}
            </span>
          )}
        </div>

        {/* Author */}
        {userName && (
          <div className="flex items-center gap-2 pt-4 border-t border-surface-100">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-xs font-semibold">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-sm text-surface-500">{userName}</span>
            <span className="ml-auto text-xs text-surface-400 bg-surface-50 px-2 py-1 rounded-md">
              {profInfo.label}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PortfolioCard;
