import React from 'react';

const PageSkeleton: React.FC = () => {
  return (
    <div className="section-container py-12 animate-pulse bg-surface-50 dark:bg-brand-950 min-h-screen">
      {/* Header Skeleton */}
      <div className="mb-12 text-center md:text-left">
        <div className="h-12 bg-surface-200 dark:bg-brand-800 rounded w-3/4 md:w-1/3 mb-4 mx-auto md:mx-0 shimmer"></div>
        <div className="h-6 bg-surface-200 dark:bg-brand-800 rounded w-1/2 md:w-1/4 mx-auto md:mx-0 shimmer"></div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card p-8 h-72 flex flex-col shimmer">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded bg-surface-200 dark:bg-brand-800"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-surface-200 dark:bg-brand-800 rounded w-3/4"></div>
                <div className="h-4 bg-surface-200 dark:bg-brand-800 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="h-4 bg-surface-200 dark:bg-brand-800 rounded w-full"></div>
              <div className="h-4 bg-surface-200 dark:bg-brand-800 rounded w-full"></div>
              <div className="h-4 bg-surface-200 dark:bg-brand-800 rounded w-4/5"></div>
            </div>
            <div className="flex gap-3 mt-auto pt-6 border-t border-surface-100 dark:border-brand-800">
              <div className="h-10 bg-surface-200 dark:bg-brand-800 rounded w-24"></div>
              <div className="h-10 bg-surface-200 dark:bg-brand-800 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton;
