import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-950 text-surface-400 mt-auto border-t border-brand-900" id="main-footer">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-brand-800 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-semibold font-display text-white tracking-tight">
                Skill<span className="text-accent-400">Port</span>
              </span>
            </div>
            <p className="text-sm text-surface-400 leading-relaxed max-w-xs">
              The universal platform for dynamic portfolios and AI-powered talent matching.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/search" className="text-sm hover:text-white transition-colors">Explore Portfolios</Link></li>
              <li><Link to="/jobs" className="text-sm hover:text-white transition-colors">Job Board</Link></li>
              <li><Link to="/matches" className="text-sm hover:text-white transition-colors">AI Matching</Link></li>
              <li><Link to="/register" className="text-sm hover:text-white transition-colors">Create Portfolio</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-brand-900 my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500">
            © {new Date().getFullYear()} SkillPort. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-surface-500 hover:text-white transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
            </a>
            <a href="#" className="text-surface-500 hover:text-white transition-colors" aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="#" className="text-surface-500 hover:text-white transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
