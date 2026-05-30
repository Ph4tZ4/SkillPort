import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PROFESSIONS } from '../utils/constants';
import { usePortfolioStore } from '../store/portfolioStore';
import PortfolioCard from '../components/PortfolioCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Input from '../components/Input';
import { debounce, cn } from '../utils/helpers';

const SearchScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [profession, setProfession] = useState(searchParams.get('profession') || '');
  const { portfolios, fetchPortfolios, isLoading } = usePortfolioStore();

  const doSearch = useCallback(
    debounce(((q: unknown, prof: unknown) => {
      const params: Record<string, string | number> = { page: 1, page_size: 20 };
      if (q) params.q = q as string;
      if (prof) params.profession = prof as string;
      fetchPortfolios(params);
    }) as (...args: unknown[]) => void, 300),
    [fetchPortfolios]
  );

  useEffect(() => {
    doSearch(query, profession);
  }, [query, profession, doSearch]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const params: Record<string, string> = {};
    if (value) params.q = value;
    if (profession) params.profession = profession;
    setSearchParams(params);
  };

  const handleProfessionChange = (value: string) => {
    const newProf = profession === value ? '' : value;
    setProfession(newProf);
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (newProf) params.profession = newProf;
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen mesh-bg" id="search-page">
      <div className="section-container py-10">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-surface-900 mb-3">
            Explore <span className="gradient-text">Talent</span>
          </h1>
          <p className="text-surface-500 max-w-xl mx-auto">
            Discover skilled professionals across all industries with dynamic portfolios
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 animate-slide-up animate-delay-100">
          <div className="relative">
            <Input
              placeholder="Search portfolios, skills, or professionals..."
              value={query}
              onChange={handleQueryChange}
              id="search-input"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              className="!mb-0"
            />
          </div>
        </div>

        {/* Profession Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 animate-slide-up animate-delay-200">
          {PROFESSIONS.map((prof) => (
            <button
              key={prof.value}
              onClick={() => handleProfessionChange(prof.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                profession === prof.value
                  ? 'bg-brand-500 text-white shadow-brand'
                  : 'bg-white/80 text-surface-600 border border-surface-200 hover:border-brand-300 hover:text-brand-600'
              )}
            >
              <span>{prof.icon}</span>
              {prof.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : portfolios.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-surface-900 mb-2">No portfolios found</h3>
            <p className="text-surface-500 max-w-md mx-auto">
              {query ? `No results for "${query}". Try different keywords or filters.` : 'No portfolios available yet. Be the first to create one!'}
            </p>
          </div>
        ) : (
          <div className="animate-slide-up animate-delay-300">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-surface-500">{portfolios.length} result{portfolios.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  id={portfolio.id}
                  title={portfolio.title}
                  profession={portfolio.profession}
                  summary={portfolio.summary}
                  skills={portfolio.skills || []}
                  viewCount={portfolio.view_count || 0}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
