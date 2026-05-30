import React from 'react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className }) => {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClass} relative`}>
        <div className={`${sizeClass} rounded-full border-2 border-surface-200 dark:border-brand-800`} />
        <div className={`${sizeClass} rounded-full border-2 border-transparent border-t-brand-900 dark:border-t-brand-50 animate-spin absolute inset-0`} />
      </div>
    </div>
  );
};

export default LoadingSpinner;
