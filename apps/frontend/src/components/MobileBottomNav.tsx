import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Briefcase, Sparkles } from 'lucide-react';
import { NAV_LINKS } from '../utils/constants';
import { cn } from '../utils/helpers';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const getIcon = (path: string) => {
    switch (path) {
      case '/': return <Home className="w-6 h-6" />;
      case '/search': return <Search className="w-6 h-6" />;
      case '/jobs': return <Briefcase className="w-6 h-6" />;
      case '/matches': return <Sparkles className="w-6 h-6" />;
      default: return <Home className="w-6 h-6" />;
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-brand-950 border-t border-surface-200 dark:border-brand-900 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {NAV_LINKS.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                isActive ? 'text-brand-900 dark:text-brand-50' : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
              )}
            >
              <div className={cn('transition-transform duration-200', isActive && 'scale-110')}>
                {getIcon(link.path)}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest leading-none mt-1">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
