import React from 'react';
import { cn } from '../utils/helpers';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label, type = 'text', placeholder, value, onChange,
  error, icon, disabled, className, id, required,
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300" htmlFor={id}>
          {label}
          {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400 dark:text-surface-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            'input-field',
            !!icon && 'pl-11',
            error && 'border-red-400 dark:border-red-500 focus:ring-red-400/50 dark:focus:ring-red-500/50 focus:border-red-400 dark:focus:border-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default Input;
