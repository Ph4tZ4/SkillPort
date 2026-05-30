import React, { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart, PlusCircle, Settings, LogOut, Sun, Moon, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { NAV_LINKS } from '../utils/constants';
import { cn } from '../utils/helpers';

const Navbar: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const toggleDarkMode = useCallback(() => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  }, [logout, navigate]);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-brand-950/80 backdrop-blur-md border-b border-surface-200 dark:border-brand-800" id="main-nav">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <div className="w-8 h-8 rounded bg-brand-900 dark:bg-brand-50 flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white dark:text-brand-950 font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-semibold font-display text-surface-900 dark:text-white tracking-tight">
              Skill<span className="accent-text">Port</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2">
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
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-brand-900 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-brand-900 transition-colors"
                  id="nav-profile-btn"
                >
                  <div className="w-7 h-7 rounded-full bg-surface-200 dark:bg-brand-800 flex items-center justify-center text-surface-700 dark:text-surface-300 text-xs font-semibold">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-200 max-w-[120px] truncate">
                    {user?.full_name || 'User'}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-brand-900 border border-surface-200 dark:border-brand-800 rounded-xl shadow-elevate p-1.5 animate-slide-down" id="profile-dropdown">
                    <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-100 dark:hover:bg-brand-800 transition-colors text-sm text-surface-700 dark:text-surface-200">
                      <BarChart className="w-4 h-4 text-surface-400" /> Dashboard
                    </Link>
                    <Link to="/portfolio/new" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-100 dark:hover:bg-brand-800 transition-colors text-sm text-surface-700 dark:text-surface-200">
                      <PlusCircle className="w-4 h-4 text-surface-400" /> New Portfolio
                    </Link>
                    <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-100 dark:hover:bg-brand-800 transition-colors text-sm text-surface-700 dark:text-surface-200">
                      <Settings className="w-4 h-4 text-surface-400" /> Settings
                    </Link>
                    <hr className="my-1.5 border-surface-100 dark:border-brand-800" />
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm text-red-600 dark:text-red-400">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm px-4 py-2" id="nav-login">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2" id="nav-register">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
