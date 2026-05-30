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
    <div className="min-h-[80vh] flex items-center justify-center mesh-bg py-12" id="register-page">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/3 w-80 h-80 bg-accent-400/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-1/3 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl animate-float animate-delay-300" />
      </div>

      <div className="w-full max-w-md px-4 relative animate-scale-in">
        <div className="glass-card p-8 shadow-glass-lg">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-brand">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-surface-900">Create Your Account</h1>
            <p className="text-surface-500 mt-1">Start showcasing your skills in minutes</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  s <= step ? 'bg-brand-500 text-white shadow-brand' : 'bg-surface-100 text-surface-400'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-brand-500' : 'bg-surface-200'} transition-colors`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 animate-slide-down">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Credentials */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in" id="register-step-1">
                <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} id="reg-email" required />
                <Input label="Password" type="password" placeholder="Minimum 8 characters" value={password} onChange={setPassword} id="reg-password" required />
                <Button type="submit" className="w-full !py-3.5" disabled={!email || password.length < 8}>
                  Continue
                </Button>
              </div>
            )}

            {/* Step 2: Profile */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in" id="register-step-2">
                <Input label="Full Name" placeholder="John Doe" value={fullName} onChange={setFullName} id="reg-name" required />
                <Button type="submit" className="w-full !py-3.5" disabled={!fullName}>
                  Continue
                </Button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-surface-500 hover:text-brand-600 transition-colors">
                  ← Back
                </button>
              </div>
            )}

            {/* Step 3: Profession */}
            {step === 3 && (
              <div className="animate-fade-in" id="register-step-3">
                <p className="text-sm font-medium text-surface-700 mb-3">Select your profession</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {PROFESSIONS.map((prof) => (
                    <button
                      key={prof.value}
                      type="button"
                      onClick={() => setProfession(prof.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        profession === prof.value
                          ? 'border-brand-500 bg-brand-50 shadow-brand'
                          : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                      }`}
                    >
                      <span className="text-2xl">{prof.icon}</span>
                      <span className="text-sm font-medium text-surface-700">{prof.label}</span>
                    </button>
                  ))}
                </div>
                <Button type="submit" isLoading={isLoading} className="w-full !py-3.5" disabled={!profession} id="reg-submit">
                  Create Account
                </Button>
                <button type="button" onClick={() => setStep(2)} className="w-full text-sm text-surface-500 hover:text-brand-600 transition-colors mt-3">
                  ← Back
                </button>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
