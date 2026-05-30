import React from 'react';
import { cn } from '../utils/helpers';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
}

const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', isLoading = false,
  disabled = false, icon, className, onClick, type = 'button', id,
}) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-ghost';
  const sizeClass = size === 'sm' ? '!px-4 !py-2 !text-sm' : size === 'lg' ? '!px-8 !py-4 !text-lg' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(baseClass, sizeClass, disabled && 'opacity-50 cursor-not-allowed', className)}
      id={id}
    >
      {isLoading ? (
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
};

export default Button;
