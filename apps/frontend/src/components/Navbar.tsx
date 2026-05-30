import React, { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { NAV_LINKS } from '../utils/constants';
import { cn } from '../utils/helpers';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  }, [logout, navigate]);

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/20" id="main-nav">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-brand transition-transform group-hover:scale-110">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold font-display">
              Skill<span className="gradient-text">Port</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'nav-link',
                  location.pathname === link.path && 'nav-link-active'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-100 transition-colors"
                  id="nav-profile-btn"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-surface-700 max-w-[120px] truncate">
                    {user?.full_name || 'User'}
                  </span>
                  <svg className={cn('w-4 h-4 text-surface-400 transition-transform', isProfileOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-card p-2 animate-slide-down" id="profile-dropdown">
                    <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-100 transition-colors text-sm text-surface-700">
                      <span>📊</span> Dashboard
                    </Link>
                    <Link to="/portfolio/new" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-100 transition-colors text-sm text-surface-700">
                      <span>➕</span> New Portfolio
                    </Link>
                    <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-100 transition-colors text-sm text-surface-700">
                      <span>⚙️</span> Settings
                    </Link>
                    <hr className="my-2 border-surface-200" />
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600">
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm" id="nav-login">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm !px-5 !py-2.5" id="nav-register">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            id="mobile-menu-btn"
          >
            <svg className="w-6 h-6 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slide-down" id="mobile-menu">
            <div className="flex flex-col gap-1 pt-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === link.path
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-surface-600 hover:bg-surface-100'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-surface-200" />
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-100">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left">
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-4 pt-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-secondary text-sm flex-1 text-center">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary text-sm flex-1 text-center">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
