import React from 'react';
import { Link } from 'react-router-dom';
import { FEATURES, PROFESSIONS } from '../utils/constants';

const HomeScreen: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center mesh-bg" id="hero">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-20 w-64 h-64 bg-accent-400/15 rounded-full blur-3xl animate-float animate-delay-200" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-300/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="section-container relative py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                AI-Powered Talent Platform
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-display leading-tight mb-6 text-balance">
                Your Skills,{' '}
                <span className="gradient-text">Beautifully</span>{' '}
                Presented
              </h1>

              <p className="text-lg md:text-xl text-surface-600 leading-relaxed mb-8 max-w-xl">
                Replace static resumes with dynamic, role-specific portfolios. 
                SkillPort uses AI-powered matching to connect talent with 
                opportunities across every profession.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-primary text-lg !px-8 !py-4" id="hero-cta-primary">
                  Create Your Portfolio
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link to="/search" className="btn-secondary text-lg !px-8 !py-4" id="hero-cta-secondary">
                  Explore Talent
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-surface-200">
                <div>
                  <p className="text-2xl font-bold font-display text-surface-900">10K+</p>
                  <p className="text-sm text-surface-500">Active Portfolios</p>
                </div>
                <div className="w-px h-10 bg-surface-200" />
                <div>
                  <p className="text-2xl font-bold font-display text-surface-900">95%</p>
                  <p className="text-sm text-surface-500">Match Accuracy</p>
                </div>
                <div className="w-px h-10 bg-surface-200" />
                <div>
                  <p className="text-2xl font-bold font-display text-surface-900">50+</p>
                  <p className="text-sm text-surface-500">Professions</p>
                </div>
              </div>
            </div>

            {/* Right: Visual Preview */}
            <div className="hidden lg:block animate-slide-up animate-delay-200">
              <div className="relative">
                {/* Floating cards mockup */}
                <div className="glass-card p-6 shadow-glass-lg animate-float">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg">💻</div>
                    <div>
                      <h4 className="font-semibold text-surface-900">Full-Stack Developer</h4>
                      <p className="text-sm text-surface-500">Alex Chen</p>
                    </div>
                    <div className="ml-auto bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">98% Match</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Go', 'MongoDB', 'K8s'].map(s => (
                      <span key={s} className="skill-badge">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 shadow-glass-lg -mt-4 ml-8 animate-float animate-delay-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-lg">🎨</div>
                    <div>
                      <h4 className="font-semibold text-surface-900">UI/UX Designer</h4>
                      <p className="text-sm text-surface-500">Sarah Kim</p>
                    </div>
                    <div className="ml-auto bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm font-medium">92% Match</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Figma', 'Prototyping', 'Design Systems', 'Motion'].map(s => (
                      <span key={s} className="skill-badge-accent">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 shadow-glass-lg -mt-4 ml-4 animate-float animate-delay-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-lg">🎵</div>
                    <div>
                      <h4 className="font-semibold text-surface-900">Music Producer</h4>
                      <p className="text-sm text-surface-500">Jordan Lee</p>
                    </div>
                    <div className="ml-auto bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">87% Match</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Ableton', 'Mixing', 'Composition', 'Sound Design'].map(s => (
                      <span key={s} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professions Section */}
      <section className="py-24 bg-white" id="professions">
        <div className="section-container">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-surface-900 mb-4">
              Built for <span className="gradient-text">Every Profession</span>
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Purpose-built portfolio templates with industry-specific sections for developers, designers, musicians, marketers, and more.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PROFESSIONS.map((prof, i) => (
              <Link
                key={prof.value}
                to={`/search?profession=${prof.value}`}
                className="glass-card p-6 text-center card-hover group animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${prof.color} flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {prof.icon}
                </div>
                <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                  {prof.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 mesh-bg" id="features">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-surface-900 mb-4">
              Everything You Need to <span className="gradient-text">Stand Out</span>
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Powerful features designed to showcase your unique talents and connect you with the right opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card p-8 card-hover animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 flex items-center justify-center text-3xl mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold font-display text-surface-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-surface-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden" id="cta">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />

        <div className="section-container relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-6 text-balance">
            Ready to Transform How You Present Your Skills?
          </h2>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto mb-10">
            Join thousands of professionals who showcase their talents with dynamic portfolios and find opportunities through AI-powered matching.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-lg" id="cta-btn">
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/search" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-lg">
              Browse Portfolios
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
