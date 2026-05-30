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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg py-10" id="profile-page">
      <div className="max-w-3xl mx-auto px-4">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold font-display text-surface-900 mb-2">Profile Settings</h1>
          <p className="text-surface-500 mb-8">Manage your personal information and preferences</p>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-6 animate-slide-down flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <div className="glass-card p-8 animate-slide-up animate-delay-100">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-3xl font-bold shadow-brand">
                {fullName.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-surface-900">{fullName || 'User'}</h3>
                <p className="text-surface-500">{user.email}</p>
                <button type="button" className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-2 transition-colors">
                  Change avatar
                </button>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="glass-card p-8 animate-slide-up animate-delay-200" id="profile-info">
            <h2 className="text-lg font-semibold text-surface-900 mb-6">Personal Information</h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Full Name" value={fullName} onChange={setFullName} id="profile-name" />
                <Input label="Location" placeholder="San Francisco, CA" value={location} onChange={setLocation} id="profile-location" />
              </div>
              <Input label="Professional Headline" placeholder="Senior Developer | React & Go Specialist" value={headline} onChange={setHeadline} id="profile-headline" />
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world about yourself..."
                  rows={4}
                  className="input-field resize-none"
                  id="profile-bio"
                />
              </div>
            </div>
          </div>

          {/* Profession */}
          <div className="glass-card p-8 animate-slide-up animate-delay-300" id="profile-profession">
            <h2 className="text-lg font-semibold text-surface-900 mb-6">Profession</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PROFESSIONS.map((prof) => (
                <button
                  key={prof.value}
                  type="button"
                  onClick={() => setProfession(prof.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm ${
                    profession === prof.value
                      ? 'border-brand-500 bg-brand-50 shadow-brand'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <span>{prof.icon}</span>
                  <span className="font-medium text-surface-700">{prof.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 animate-slide-up animate-delay-300">
            <Button type="submit" id="profile-save">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileScreen;
