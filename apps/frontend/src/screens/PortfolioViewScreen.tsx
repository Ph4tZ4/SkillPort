import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const profInfo = getProfessionInfo(currentPortfolio.profession);

  return (
    <div className="min-h-screen" id="portfolio-view">
      {/* Hero Header */}
      <div className={`relative bg-gradient-to-br ${profInfo.gradient} py-20`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />

        <div className="section-container relative">
          <div className="max-w-3xl animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{profInfo.icon}</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-sm font-medium">
                {profInfo.label}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
              {currentPortfolio.title}
            </h1>

            <p className="text-lg text-white/80 leading-relaxed mb-6 max-w-2xl">
              {currentPortfolio.summary || 'No summary provided'}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {formatNumber(currentPortfolio.view_count || 0)} views
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(currentPortfolio.created_at)}
              </span>
              {currentPortfolio.is_public && (
                <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                  🌐 Public
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="section-container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Skills Section */}
          {currentPortfolio.skills && currentPortfolio.skills.length > 0 && (
            <div className="mb-12 animate-slide-up">
              <h2 className="text-xl font-bold font-display text-surface-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🛠️</span> Skills & Expertise
              </h2>
              <div className="glass-card p-6">
                <div className="flex flex-wrap gap-2">
                  {currentPortfolio.skills.map((skill) => (
                    <SkillBadge key={skill.name} name={skill.name} level={skill.level} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Sections */}
          {currentPortfolio.sections && currentPortfolio.sections.length > 0 && (
            <div className="space-y-8 animate-slide-up animate-delay-100">
              {currentPortfolio.sections.map((section) => {
                const sectionType = SECTION_TYPES.find(t => t.value === section.type);
                return (
                  <div key={section.id} className="glass-card overflow-hidden" id={`section-${section.id}`}>
                    <div className="px-6 py-4 border-b border-surface-100 flex items-center gap-3">
                      <span className="text-xl">{sectionType?.icon || '📄'}</span>
                      <h3 className="font-semibold text-surface-900">{section.title || sectionType?.label || 'Untitled Section'}</h3>
                      <span className="text-xs text-surface-400 bg-surface-50 px-2 py-1 rounded-md ml-auto">
                        {sectionType?.label}
                      </span>
                    </div>
                    <div className="p-6">
                      {section.description ? (
                        <p className="text-surface-600 leading-relaxed whitespace-pre-wrap">{section.description}</p>
                      ) : (
                        <p className="text-surface-400 italic">No content provided</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tags */}
          {currentPortfolio.tags && currentPortfolio.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-surface-200 animate-slide-up animate-delay-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-surface-500 mr-2">Tags:</span>
                {currentPortfolio.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${tag}`}
                    className="text-sm px-3 py-1 rounded-full bg-surface-100 text-surface-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 glass-card p-8 text-center bg-gradient-to-r from-brand-50/50 to-accent-50/50 animate-slide-up animate-delay-300">
            <h3 className="text-xl font-semibold text-surface-900 mb-2">Interested in this talent?</h3>
            <p className="text-surface-500 mb-6">Connect through SkillPort's AI matching to find the best fit.</p>
            <div className="flex justify-center gap-4">
              <Link to="/matches" className="btn-primary">Find Similar Talent</Link>
              <Link to="/register" className="btn-secondary">Create Your Portfolio</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioViewScreen;
