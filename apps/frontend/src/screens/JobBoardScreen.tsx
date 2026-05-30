import React, { useEffect, useState } from 'react';
import { useJobStore } from '../store/jobStore';
import { Globe, Briefcase } from 'lucide-react';
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
    <div className="min-h-screen bg-surface-50 dark:bg-brand-950" id="job-board">
      <div className="section-container py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-3xl md:text-5xl font-bold font-display text-brand-900 dark:text-brand-50 mb-4 tracking-tight">
            Job <span className="accent-text italic font-serif">Board</span>
          </h1>
          <p className="text-lg text-surface-500 max-w-xl mx-auto">
            Find your next opportunity with AI-powered skill matching.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="max-w-3xl mx-auto mb-16 animate-slide-up animate-delay-100">
          <div className="card p-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                placeholder="Search jobs by title, skills, or company..."
                value={query}
                onChange={setQuery}
                id="job-search-input"
                className="flex-1 !mb-0"
                icon={
                  <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
              <button
                onClick={() => setRemoteOnly(!remoteOnly)}
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold tracking-wide transition-all duration-200 whitespace-nowrap border',
                  remoteOnly
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-surface-50 dark:bg-brand-900 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-brand-800 hover:border-surface-300 dark:hover:border-brand-700'
                )}
                id="remote-filter"
              >
                <Globe className="w-4 h-4" /> Remote Only
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setProfession('')}
                className={cn(
                  'px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-widest transition-all duration-200 border',
                  !profession 
                    ? 'bg-brand-900 dark:bg-brand-50 text-white dark:text-brand-950 border-brand-900 dark:border-brand-50' 
                    : 'bg-transparent text-surface-500 dark:text-surface-400 border-surface-200 dark:border-brand-800 hover:border-brand-300 dark:hover:border-brand-700'
                )}
              >
                All
              </button>
              {PROFESSIONS.slice(0, 6).map((prof) => (
                <button
                  key={prof.value}
                  onClick={() => setProfession(profession === prof.value ? '' : prof.value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-widest transition-all duration-200 border',
                    profession === prof.value 
                      ? 'bg-brand-900 dark:bg-brand-50 text-white dark:text-brand-950 border-brand-900 dark:border-brand-50' 
                      : 'bg-transparent text-surface-500 dark:text-surface-400 border-surface-200 dark:border-brand-800 hover:border-brand-300 dark:hover:border-brand-700'
                  )}
                >
                  <prof.icon className="w-3.5 h-3.5" /> {prof.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <LoadingSpinner size="lg" className="py-24" />
        ) : jobs.length === 0 ? (
          <div className="text-center py-24 animate-fade-in card bg-transparent border-dashed border-2 border-surface-200 dark:border-brand-800">
            <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-brand-900 flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-xl font-medium text-brand-900 dark:text-brand-50 mb-3 tracking-tight">No jobs found</h3>
            <p className="text-surface-500 max-w-md mx-auto">
              {query ? `No jobs matching "${query}". Try broader search terms.` : 'No job postings available yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 animate-slide-up animate-delay-200">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-200 dark:border-brand-800">
              <h2 className="text-xl font-semibold font-display text-brand-900 dark:text-brand-50 tracking-tight">Job Openings</h2>
              <span className="text-sm font-medium px-3 py-1 bg-surface-100 dark:bg-brand-900 text-surface-600 dark:text-surface-300 rounded">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</span>
            </div>
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
