import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePortfolioStore } from '../store/portfolioStore';
import { FileText, Eye, Target, Star, Sparkles, Search, Bot, Palette } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import PortfolioCard from '../components/PortfolioCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardScreen: React.FC = () => {
  const { user, loadUser } = useAuthStore();
  const { portfolios, fetchUserPortfolios, isLoading } = usePortfolioStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user?.id) {
      fetchUserPortfolios(user.id);
    }
  }, [user?.id, fetchUserPortfolios]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-brand-950" id="dashboard-page">
      <div className="section-container py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold font-display text-brand-900 dark:text-brand-50 tracking-tight">
              Welcome back, <span className="accent-text italic font-serif">{user?.full_name?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2">Here's an overview of your portfolio performance</p>
          </div>
          <Link to="/portfolio/new" className="btn-primary" id="dashboard-new-portfolio">
            <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Portfolio
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up animate-delay-100">
          <StatsCard icon={<FileText className="w-5 h-5 text-brand-900 dark:text-brand-100" />} label="Total Portfolios" value={portfolios.length} trend={12} />
          <StatsCard icon={<Eye className="w-5 h-5 text-brand-900 dark:text-brand-100" />} label="Total Views" value={portfolios.reduce((acc, p) => acc + (p.view_count || 0), 0)} trend={24} />
          <StatsCard icon={<Target className="w-5 h-5 text-brand-900 dark:text-brand-100" />} label="AI Matches" value={0} trend={8} />
          <StatsCard icon={<Star className="w-5 h-5 text-brand-900 dark:text-brand-100" />} label="Profile Score" value="85%" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-slide-up animate-delay-200">
          <Link to="/portfolio/new" className="card p-6 flex items-center gap-5 group hover:-translate-y-1 hover:shadow-elevate transition-all" id="quick-create">
            <div className="w-12 h-12 rounded bg-surface-50 dark:bg-brand-900 flex items-center justify-center text-brand-900 dark:text-brand-50 group-hover:bg-brand-900 group-hover:text-brand-50 dark:group-hover:bg-brand-50 dark:group-hover:text-brand-900 transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-brand-900 dark:text-brand-100 group-hover:text-accent-600 transition-colors tracking-wide">Create Portfolio</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Build a dynamic presentation</p>
            </div>
          </Link>

          <Link to="/search" className="card p-6 flex items-center gap-5 group hover:-translate-y-1 hover:shadow-elevate transition-all" id="quick-explore">
            <div className="w-12 h-12 rounded bg-surface-50 dark:bg-brand-900 flex items-center justify-center text-brand-900 dark:text-brand-50 group-hover:bg-brand-900 group-hover:text-brand-50 dark:group-hover:bg-brand-50 dark:group-hover:text-brand-900 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-brand-900 dark:text-brand-100 group-hover:text-accent-600 transition-colors tracking-wide">Explore Talent</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Discover professionals</p>
            </div>
          </Link>

          <Link to="/matches" className="card p-6 flex items-center gap-5 group hover:-translate-y-1 hover:shadow-elevate transition-all" id="quick-match">
            <div className="w-12 h-12 rounded bg-surface-50 dark:bg-brand-900 flex items-center justify-center text-brand-900 dark:text-brand-50 group-hover:bg-brand-900 group-hover:text-brand-50 dark:group-hover:bg-brand-50 dark:group-hover:text-brand-900 transition-colors">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-brand-900 dark:text-brand-100 group-hover:text-accent-600 transition-colors tracking-wide">AI Matching</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Find perfect opportunities</p>
            </div>
          </Link>
        </div>

        {/* Portfolios */}
        <div className="animate-slide-up animate-delay-300">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-200 dark:border-brand-800">
            <h2 className="text-xl font-semibold font-display text-brand-900 dark:text-brand-50 tracking-tight">Your Portfolios</h2>
            {portfolios.length > 0 && (
              <span className="text-sm font-medium px-3 py-1 bg-surface-100 dark:bg-brand-900 text-surface-600 dark:text-surface-300 rounded">{portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {isLoading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : portfolios.length === 0 ? (
            <div className="card p-16 text-center border-dashed border-2 border-surface-200 dark:border-brand-800 bg-transparent">
              <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-brand-900 flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-surface-400 dark:text-surface-500" />
              </div>
              <h3 className="text-xl font-medium text-brand-900 dark:text-brand-50 mb-3 tracking-tight">No portfolios yet</h3>
              <p className="text-surface-500 dark:text-surface-400 mb-8 max-w-md mx-auto">
                Create your first dynamic portfolio to showcase your skills and get matched with elite opportunities.
              </p>
              <Link to="/portfolio/new" className="btn-primary">
                Create Your First Portfolio
              </Link>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
