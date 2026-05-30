import React from 'react';
import { Link } from 'react-router-dom';
import { formatSalary, getProfessionInfo, timeAgo } from '../utils/helpers';
import SkillBadge from './SkillBadge';
import MatchScoreRing from './MatchScoreRing';

interface JobCardProps {
  id: string;
  title: string;
  companyName: string;
  profession: string;
  location: string;
  remote: boolean;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  skills: Array<{ name: string; level: string }>;
  createdAt: string;
  matchScore?: number;
}

const JobCard: React.FC<JobCardProps> = ({
  id, title, companyName, profession, location, remote,
  salaryMin, salaryMax, salaryCurrency, skills, createdAt, matchScore,
}) => {
  const profInfo = getProfessionInfo(profession);

  return (
    <Link to={`/jobs/${id}`} className="block group" id={`job-card-${id}`}>
      <div className="glass-card p-6 card-hover">
        <div className="flex items-start gap-4">
          {/* Company Avatar */}
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${profInfo.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
            {companyName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title & Company */}
            <h3 className="text-lg font-semibold text-surface-900 group-hover:text-brand-600 transition-colors truncate">
              {title}
            </h3>
            <p className="text-sm text-surface-500 mb-3">{companyName}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-surface-500 mb-3">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {location || 'Unspecified'}
              </span>
              {remote && (
                <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-md text-xs font-medium">
                  🌍 Remote
                </span>
              )}
              <span className="text-brand-600 font-semibold">
                {formatSalary(salaryMin, salaryMax, salaryCurrency)}
              </span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 3).map((skill) => (
                <SkillBadge key={skill.name} name={skill.name} />
              ))}
              {skills.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-500">
                  +{skills.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Match Score & Time */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {matchScore !== undefined && <MatchScoreRing score={matchScore} size={56} />}
            <span className="text-xs text-surface-400">{timeAgo(createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
