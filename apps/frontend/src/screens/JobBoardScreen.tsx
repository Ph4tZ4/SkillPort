import React, { useEffect, useState } from 'react';
import { useJobStore } from '../store/jobStore';
import { PROFESSIONS } from '../utils/constants';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Input from '../components/Input';
import { cn } from '../utils/helpers';

const JobBoardScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [profession, setProfession] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const { jobs, fetchJobs, isLoading } = useJobStore();

  useEffect(() => {
    const params: Record<string, string | number> = { page: 1, page_size: 20 };
    if (query) params.q = query;
    if (profession) params.profession = profession;
    if (remoteOnly) params.remote = 'true';
    fetchJobs(params);
  }, [query, profession, remoteOnly, fetchJobs]);

  return (
    <div className="min-h-screen mesh-bg" id="job-board">
      <div className="section-container py-10">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-surface-900 mb-3">
            Job <span className="gradient-text">Board</span>
          </h1>
          <p className="text-surface-500 max-w-xl mx-auto">
            Find your next opportunity with AI-powered skill matching
          </p>
        </div>

        {/* Search & Filters */}
        <div className="max-w-3xl mx-auto mb-8 animate-slide-up animate-delay-100">
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Search jobs by title, skills, or company..."
                value={query}
                onChange={setQuery}
                id="job-search-input"
                className="flex-1 !mb-0"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
              <button
                onClick={() => setRemoteOnly(!remoteOnly)}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  remoteOnly
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                )}
                id="remote-filter"
              >
                🌍 Remote Only
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setProfession('')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  !profession ? 'bg-brand-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                )}
              >
                All
              </button>
              {PROFESSIONS.slice(0, 6).map((prof) => (
                <button
                  key={prof.value}
                  onClick={() => setProfession(profession === prof.value ? '' : prof.value)}
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    profession === prof.value ? 'bg-brand-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  )}
                >
                  {prof.icon} {prof.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-surface-900 mb-2">No jobs found</h3>
            <p className="text-surface-500 max-w-md mx-auto">
              {query ? `No jobs matching "${query}". Try broader search terms.` : 'No job postings available yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4 animate-slide-up animate-delay-200">
            <p className="text-sm text-surface-500 mb-4">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                companyName={job.company_name}
                profession={job.profession}
                location={job.location}
                remote={job.remote}
                salaryMin={job.salary_min}
                salaryMax={job.salary_max}
                salaryCurrency={job.salary_currency || 'USD'}
                skills={job.required_skills || []}
                createdAt={job.created_at}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoardScreen;
