import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { PROFESSIONS } from '../utils/constants';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfileScreen: React.FC = () => {
  const { user, loadUser, isLoading } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profession, setProfession] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setHeadline(user.headline || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setProfession(user.profession || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, call userAPI.updateMe(...)
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-brand-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-brand-950 py-12" id="profile-page">
      <div className="max-w-3xl mx-auto px-4">
        <div className="animate-slide-up mb-12 border-b border-surface-200 dark:border-brand-800 pb-6">
          <h1 className="text-3xl font-bold font-display text-brand-900 dark:text-brand-50 mb-2 tracking-tight">Profile Settings</h1>
          <p className="text-surface-500 font-serif italic">Manage your personal information and preferences.</p>
        </div>

        {saved && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded text-sm font-semibold tracking-wide mb-8 animate-slide-down flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Profile updated successfully
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-10">
          {/* Avatar Section */}
          <div className="card p-8 animate-slide-up animate-delay-100">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded bg-brand-900 dark:bg-brand-50 flex items-center justify-center text-white dark:text-brand-900 text-4xl font-display font-bold">
                {fullName.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-900 dark:text-brand-50 tracking-tight">{fullName || 'User'}</h3>
                <p className="text-surface-500 dark:text-surface-400 mt-1">{user.email}</p>
                <button type="button" className="text-xs font-semibold uppercase tracking-widest text-accent-600 hover:text-accent-700 mt-4 transition-colors">
                  Change Avatar
                </button>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="card p-8 animate-slide-up animate-delay-200" id="profile-info">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900 dark:text-brand-100 mb-8 pb-4 border-b border-surface-100 dark:border-brand-800">Personal Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" value={fullName} onChange={setFullName} id="profile-name" />
                <Input label="Location" placeholder="San Francisco, CA" value={location} onChange={setLocation} id="profile-location" />
              </div>
              <Input label="Professional Headline" placeholder="Senior Developer | React & Go Specialist" value={headline} onChange={setHeadline} id="profile-headline" />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-surface-600 dark:text-surface-300 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world about yourself..."
                  rows={4}
                  className="input-field resize-none bg-surface-50 dark:bg-brand-900 focus:bg-white dark:focus:bg-brand-950"
                  id="profile-bio"
                />
              </div>
            </div>
          </div>

          {/* Profession */}
          <div className="card p-8 animate-slide-up animate-delay-300" id="profile-profession">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900 dark:text-brand-100 mb-8 pb-4 border-b border-surface-100 dark:border-brand-800">Profession</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PROFESSIONS.map((prof) => (
                <button
                  key={prof.value}
                  type="button"
                  onClick={() => setProfession(prof.value)}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded border transition-all duration-200 ${
                    profession === prof.value
                      ? 'border-brand-900 dark:border-brand-50 bg-brand-900 dark:bg-brand-50 text-white dark:text-brand-950'
                      : 'border-surface-200 dark:border-brand-800 bg-transparent text-surface-600 dark:text-surface-300 hover:border-brand-300 dark:hover:border-brand-700'
                  }`}
                >
                  <prof.icon className="w-6 h-6" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-center">{prof.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 animate-slide-up animate-delay-300">
            <Button type="submit" id="profile-save" className="px-8 py-3">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileScreen;
