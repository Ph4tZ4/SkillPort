import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Globe, Wrench, FileText } from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { getProfessionInfo, formatNumber, formatDate } from '../utils/helpers';
import { SECTION_TYPES } from '../utils/constants';
import SkillBadge from '../components/SkillBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const PortfolioViewScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentPortfolio, fetchPortfolio, isLoading } = usePortfolioStore();

  useEffect(() => {
    if (id) fetchPortfolio(id);
  }, [id, fetchPortfolio]);

  if (isLoading || !currentPortfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-brand-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const profInfo = getProfessionInfo(currentPortfolio.profession);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-brand-950" id="portfolio-view">
      {/* Hero Header */}
      <div className={`relative bg-brand-950 dark:bg-black py-24 border-b border-brand-900`}>
        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto animate-slide-up text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <profInfo.icon className="w-8 h-8 text-white" />
              <span className="px-3 py-1 rounded bg-white/10 text-white text-xs font-semibold uppercase tracking-widest">
                {profInfo.label}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-display text-white mb-6 tracking-tight">
              {currentPortfolio.title}
            </h1>

            <p className="text-lg md:text-xl text-surface-400 leading-relaxed mb-10 max-w-2xl mx-auto font-serif italic">
              {currentPortfolio.summary || 'No summary provided'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 text-surface-500 text-sm font-medium tracking-wide">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {formatNumber(currentPortfolio.view_count || 0)} views
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(currentPortfolio.created_at)}
              </span>
              {currentPortfolio.is_public && (
                <span className="flex items-center gap-2 px-3 py-1 rounded bg-white/5">
                  <Globe className="w-4 h-4" /> Public
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="section-container py-16">
        <div className="max-w-3xl mx-auto">
          {/* Skills Section */}
          {currentPortfolio.skills && currentPortfolio.skills.length > 0 && (
            <div className="mb-16 animate-slide-up">
              <h2 className="text-lg font-semibold font-display text-brand-900 dark:text-brand-50 mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-surface-200 dark:border-brand-800 pb-4">
                <Wrench className="w-5 h-5 text-surface-400" /> Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {currentPortfolio.skills.map((skill) => (
                  <SkillBadge key={skill.name} name={skill.name} level={skill.level} />
                ))}
              </div>
            </div>
          )}

          {/* Content Sections */}
          {currentPortfolio.sections && currentPortfolio.sections.length > 0 && (
            <div className="space-y-12 animate-slide-up animate-delay-100">
              {currentPortfolio.sections.map((section) => {
                const sectionType = SECTION_TYPES.find(t => t.value === section.type);
                return (
                  <div key={section.id} className="card overflow-hidden" id={`section-${section.id}`}>
                    <div className="px-8 py-5 border-b border-surface-100 dark:border-brand-800 flex items-center gap-4 bg-surface-50 dark:bg-brand-900/50">
                      <div className="text-surface-400 dark:text-surface-500">
                        {sectionType ? <sectionType.icon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <h3 className="font-semibold text-brand-900 dark:text-brand-100 tracking-wide">{section.title || sectionType?.label || 'Untitled Section'}</h3>
                      <span className="text-xs font-medium text-surface-500 uppercase tracking-widest ml-auto">
                        {sectionType?.label}
                      </span>
                    </div>
                    <div className="p-8">
                      {section.description ? (
                        <p className="text-surface-600 dark:text-surface-300 leading-relaxed whitespace-pre-wrap">{section.description}</p>
                      ) : (
                        <p className="text-surface-400 dark:text-surface-600 italic">No content provided</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tags */}
          {currentPortfolio.tags && currentPortfolio.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-surface-200 dark:border-brand-800 animate-slide-up animate-delay-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-surface-500 mr-2">Tags</span>
                {currentPortfolio.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${tag}`}
                    className="text-sm px-3 py-1 rounded bg-surface-100 dark:bg-brand-900 text-surface-600 dark:text-surface-300 hover:bg-brand-900 hover:text-white dark:hover:bg-brand-50 dark:hover:text-brand-900 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 card p-10 text-center bg-brand-900 dark:bg-brand-50 animate-slide-up animate-delay-300">
            <h3 className="text-2xl font-bold font-display text-white dark:text-brand-900 mb-3 tracking-tight">Interested in this talent?</h3>
            <p className="text-surface-400 dark:text-brand-700 mb-8 max-w-md mx-auto">Connect through SkillPort's precise AI matching to discover the perfect synergy.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/matches" className="px-6 py-3 rounded bg-white dark:bg-brand-900 text-brand-900 dark:text-white font-medium hover:-translate-y-1 transition-transform">Find Similar Talent</Link>
              <Link to="/register" className="px-6 py-3 rounded border border-surface-600 dark:border-brand-300 text-white dark:text-brand-900 font-medium hover:bg-surface-800 dark:hover:bg-brand-100 transition-colors">Create Portfolio</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioViewScreen;
