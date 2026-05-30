import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePortfolioStore } from '../store/portfolioStore';
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
    <div className="min-h-screen mesh-bg" id="dashboard-page">
      <div className="section-container py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold font-display text-surface-900">
              Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="text-surface-500 mt-1">Here's an overview of your portfolio performance</p>
          </div>
          <Link to="/portfolio/new" className="btn-primary" id="dashboard-new-portfolio">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Portfolio
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-slide-up animate-delay-100">
          <StatsCard icon="📄" label="Total Portfolios" value={portfolios.length} trend={12} />
          <StatsCard icon="👁️" label="Total Views" value={portfolios.reduce((acc, p) => acc + (p.view_count || 0), 0)} trend={24} />
          <StatsCard icon="🎯" label="AI Matches" value={0} trend={8} />
          <StatsCard icon="⭐" label="Profile Score" value="85%" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 animate-slide-up animate-delay-200">
          <Link to="/portfolio/new" className="glass-card p-6 card-hover group flex items-center gap-4" id="quick-create">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
              ✨
            </div>
            <div>
              <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">Create Portfolio</h3>
              <p className="text-sm text-surface-500">Build a dynamic presentation</p>
            </div>
          </Link>

          <Link to="/search" className="glass-card p-6 card-hover group flex items-center gap-4" id="quick-explore">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
              🔍
            </div>
            <div>
              <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">Explore Talent</h3>
              <p className="text-sm text-surface-500">Discover professionals</p>
            </div>
          </Link>

          <Link to="/matches" className="glass-card p-6 card-hover group flex items-center gap-4" id="quick-match">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-pink-500 flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
              🤖
            </div>
            <div>
              <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">AI Matching</h3>
              <p className="text-sm text-surface-500">Find perfect opportunities</p>
            </div>
          </Link>
        </div>

        {/* Portfolios */}
        <div className="animate-slide-up animate-delay-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-display text-surface-900">Your Portfolios</h2>
            {portfolios.length > 0 && (
              <span className="text-sm text-surface-500">{portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {isLoading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : portfolios.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-surface-900 mb-2">No portfolios yet</h3>
              <p className="text-surface-500 mb-6 max-w-md mx-auto">
                Create your first dynamic portfolio to showcase your skills and get matched with opportunities.
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
