import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import Input from '../components/Input';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch { /* error handled in store */ }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-surface-50 dark:bg-brand-950 py-12" id="login-page">
      <div className="w-full max-w-md px-4 relative animate-scale-in">
        <div className="card p-8 md:p-10 shadow-elevate">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-lg bg-brand-900 dark:bg-brand-50 flex items-center justify-center mx-auto mb-6">
              <span className="text-white dark:text-brand-950 text-2xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-brand-900 dark:text-brand-50 tracking-tight">Welcome Back</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2">Sign in to your SkillPort account</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded text-sm mb-6 animate-slide-down">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              id="login-email"
              required
              icon={
                <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              id="login-password"
              required
              icon={
                <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Button type="submit" isLoading={isLoading} className="w-full !py-3.5" id="login-submit">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-900 dark:text-brand-50 font-medium hover:text-accent-600 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
