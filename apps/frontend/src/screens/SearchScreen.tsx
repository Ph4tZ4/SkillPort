import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
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
    <div className="min-h-screen bg-surface-50 dark:bg-brand-950" id="search-page">
      <div className="section-container py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-3xl md:text-5xl font-bold font-display text-brand-900 dark:text-brand-50 mb-4 tracking-tight">
            Explore <span className="accent-text italic font-serif">Talent</span>
          </h1>
          <p className="text-lg text-surface-500 max-w-xl mx-auto">
            Discover skilled professionals across all industries with dynamic portfolios.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 animate-slide-up animate-delay-100">
          <div className="relative shadow-sm rounded-md">
            <Input
              placeholder="Search portfolios, skills, or professionals..."
              value={query}
              onChange={handleQueryChange}
              id="search-input"
              icon={
                <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              className="!mb-0"
            />
          </div>
        </div>

        {/* Profession Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 animate-slide-up animate-delay-200">
          {PROFESSIONS.map((prof) => (
            <button
              key={prof.value}
              onClick={() => handleProfessionChange(prof.value)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all duration-200 border',
                profession === prof.value
                  ? 'bg-brand-900 dark:bg-brand-50 text-white dark:text-brand-950 border-brand-900 dark:border-brand-50 shadow-sm'
                  : 'bg-white dark:bg-brand-900 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-brand-800 hover:border-brand-300 dark:hover:border-brand-700'
              )}
            >
              <prof.icon className="w-4 h-4" />
              {prof.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <LoadingSpinner size="lg" className="py-24" />
        ) : portfolios.length === 0 ? (
          <div className="text-center py-24 animate-fade-in card bg-transparent border-dashed border-2 border-surface-200 dark:border-brand-800">
            <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-brand-900 flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-xl font-medium text-brand-900 dark:text-brand-50 mb-3 tracking-tight">No portfolios found</h3>
            <p className="text-surface-500 max-w-md mx-auto">
              {query ? `No results for "${query}". Try different keywords or filters.` : 'No portfolios available yet. Be the first to create one!'}
            </p>
          </div>
        ) : (
          <div className="animate-slide-up animate-delay-300">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-200 dark:border-brand-800">
              <h2 className="text-xl font-semibold font-display text-brand-900 dark:text-brand-50 tracking-tight">Search Results</h2>
              <span className="text-sm font-medium px-3 py-1 bg-surface-100 dark:bg-brand-900 text-surface-600 dark:text-surface-300 rounded">{portfolios.length} result{portfolios.length !== 1 ? 's' : ''}</span>
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
