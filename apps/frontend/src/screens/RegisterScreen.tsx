import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PROFESSIONS } from '../utils/constants';
import Button from '../components/Button';
import Input from '../components/Input';

const RegisterScreen: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    if (step === 2) { setStep(3); return; }

    clearError();
    try {
      await register(email, password, fullName, profession);
      navigate('/dashboard');
    } catch { /* error handled in store */ }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-surface-50 dark:bg-brand-950 py-12" id="register-page">
      <div className="w-full max-w-md px-4 relative animate-scale-in">
        <div className="card p-8 md:p-10 shadow-elevate">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-lg bg-brand-900 dark:bg-brand-50 flex items-center justify-center mx-auto mb-6">
              <span className="text-white dark:text-brand-950 text-2xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-brand-900 dark:text-brand-50 tracking-tight">Create Account</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2">Start showcasing your skills</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-semibold transition-all ${
                  s <= step ? 'bg-brand-900 dark:bg-brand-50 text-white dark:text-brand-950' : 'bg-surface-100 dark:bg-brand-800 text-surface-400 dark:text-surface-500'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                {s < 3 && <div className={`w-8 h-px ${s < step ? 'bg-brand-900 dark:bg-brand-50' : 'bg-surface-200 dark:bg-brand-800'} transition-colors`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded text-sm mb-6 animate-slide-down">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Credentials */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in" id="register-step-1">
                <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} id="reg-email" required />
                <Input label="Password" type="password" placeholder="Minimum 8 characters" value={password} onChange={setPassword} id="reg-password" required />
                <Button type="submit" className="w-full !py-3.5 mt-2" disabled={!email || password.length < 8}>
                  Continue
                </Button>
              </div>
            )}

            {/* Step 2: Profile */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in" id="register-step-2">
                <Input label="Full Name" placeholder="John Doe" value={fullName} onChange={setFullName} id="reg-name" required />
                <Button type="submit" className="w-full !py-3.5 mt-2" disabled={!fullName}>
                  Continue
                </Button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-surface-500 dark:text-surface-400 hover:text-brand-900 dark:hover:text-brand-50 transition-colors">
                  ← Back
                </button>
              </div>
            )}

            {/* Step 3: Profession */}
            {step === 3 && (
              <div className="animate-fade-in" id="register-step-3">
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-4">Select your profession</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {PROFESSIONS.map((prof) => (
                    <button
                      key={prof.value}
                      type="button"
                      onClick={() => setProfession(prof.value)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border transition-all ${
                        profession === prof.value
                          ? 'border-brand-900 dark:border-brand-50 bg-surface-50 dark:bg-brand-800'
                          : 'border-surface-200 dark:border-brand-800 hover:border-surface-300 dark:hover:border-brand-700 hover:bg-surface-50 dark:hover:bg-brand-800'
                      }`}
                    >
                      <prof.icon className={`w-6 h-6 ${profession === prof.value ? 'text-brand-900 dark:text-brand-50' : 'text-surface-400 dark:text-surface-500'}`} />
                      <span className={`text-xs font-semibold ${profession === prof.value ? 'text-brand-900 dark:text-brand-50' : 'text-surface-500 dark:text-surface-400'}`}>{prof.label}</span>
                    </button>
                  ))}
                </div>
                <Button type="submit" isLoading={isLoading} className="w-full !py-3.5" disabled={!profession} id="reg-submit">
                  Create Account
                </Button>
                <button type="button" onClick={() => setStep(2)} className="w-full text-sm text-surface-500 dark:text-surface-400 hover:text-brand-900 dark:hover:text-brand-50 transition-colors mt-4">
                  ← Back
                </button>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-900 dark:text-brand-50 font-medium hover:text-accent-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
