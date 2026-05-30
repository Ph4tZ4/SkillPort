import React from 'react';
import { Link } from 'react-router-dom';
import { Laptop, Palette, Music } from 'lucide-react';
import { FEATURES, PROFESSIONS } from '../utils/constants';

const HomeScreen: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-surface-50 dark:bg-brand-950" id="hero">
        <div className="section-container relative py-20 z-10">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-surface-200 dark:border-brand-800 text-surface-600 dark:text-surface-400 text-xs font-semibold uppercase tracking-widest mb-8">
              AI-Powered Talent Platform
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-display leading-tight mb-8 text-balance text-brand-900 dark:text-brand-50 tracking-tight">
              Your Skills, <span className="accent-text italic font-serif">Refined.</span>
            </h1>

            <p className="text-lg md:text-xl text-surface-600 dark:text-surface-400 leading-relaxed mb-12 max-w-2xl mx-auto">
              Replace static resumes with elegant, dynamic portfolios. 
              SkillPort uses sophisticated AI matching to connect elite talent with 
              extraordinary opportunities.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="btn-primary text-base" id="hero-cta-primary">
                Create Portfolio
              </Link>
              <Link to="/search" className="btn-secondary text-base" id="hero-cta-secondary">
                Explore Talent
              </Link>
            </div>
            
            {/* Social proof */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mt-20 pt-10 border-t border-surface-200 dark:border-brand-900">
              <div className="text-center">
                <p className="stat-value">10K+</p>
                <p className="text-xs uppercase tracking-widest text-surface-500 mt-2">Active Portfolios</p>
              </div>
              <div className="text-center">
                <p className="stat-value">95%</p>
                <p className="text-xs uppercase tracking-widest text-surface-500 mt-2">Match Accuracy</p>
              </div>
              <div className="text-center">
                <p className="stat-value">50+</p>
                <p className="text-xs uppercase tracking-widest text-surface-500 mt-2">Professions</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle decorative element */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-surface-300 dark:via-brand-800 to-transparent opacity-50" />
      </section>

      {/* Professions Section */}
      <section className="py-32 bg-white dark:bg-brand-900 border-y border-surface-200 dark:border-brand-800 transition-colors duration-300" id="professions">
        <div className="section-container">
          <div className="text-center mb-20 animate-slide-up">
            <h2 className="text-3xl md:text-5xl font-bold font-display text-brand-900 dark:text-brand-50 mb-6 tracking-tight">
              Curated for <span className="accent-text">Professionals</span>
            </h2>
            <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
              Purpose-built portfolio architectures tailored to distinct industry standards.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PROFESSIONS.map((prof, i) => (
              <Link
                key={prof.value}
                to={`/search?profession=${prof.value}`}
                className="card p-8 text-center hover:-translate-y-2 hover:shadow-elevate transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-16 h-16 rounded bg-surface-50 dark:bg-brand-950 flex items-center justify-center text-brand-900 dark:text-brand-100 mx-auto mb-6 group-hover:bg-brand-900 group-hover:text-brand-50 dark:group-hover:bg-brand-50 dark:group-hover:text-brand-900 transition-colors">
                  <prof.icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-brand-900 dark:text-brand-100 group-hover:text-accent-600 transition-colors tracking-wide">
                  {prof.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-surface-50 dark:bg-brand-950" id="features">
        <div className="section-container">
          <div className="max-w-3xl mb-20 animate-slide-up">
            <h2 className="text-3xl md:text-5xl font-bold font-display text-brand-900 dark:text-brand-50 mb-6 tracking-tight">
              Elevate your <span className="accent-text">Presence</span>
            </h2>
            <p className="text-lg text-surface-500 dark:text-surface-400">
              Sophisticated tools designed to present your work with absolute clarity and precision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="card p-10 hover:-translate-y-1 hover:shadow-elevate animate-slide-up bg-white dark:bg-brand-900"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded flex items-center justify-center text-accent-600 dark:text-accent-400 mb-6 border border-surface-200 dark:border-brand-800">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold font-display text-brand-900 dark:text-brand-50 mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-surface-500 dark:text-surface-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-brand-900 dark:bg-brand-50 border-t border-brand-800 dark:border-brand-200" id="cta">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-display text-white dark:text-brand-950 mb-8 tracking-tight">
            Ready to be Discovered?
          </h2>
          <p className="text-lg text-brand-200 dark:text-brand-700 max-w-2xl mx-auto mb-12">
            Join the elite network of professionals presenting their work with absolute elegance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-brand-950 text-brand-900 dark:text-brand-50 font-medium rounded-lg hover:-translate-y-1 hover:shadow-elevate transition-all">
              Start Your Journey
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
