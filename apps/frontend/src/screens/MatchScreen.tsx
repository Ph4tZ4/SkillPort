import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import MatchScoreRing from '../components/MatchScoreRing';
import Button from '../components/Button';
import Input from '../components/Input';

// Demo data for showcase (real data would come from API)
const demoMatches = [
  {
    id: '1', candidate: 'Alex Chen', profession: 'tech', title: 'Senior Full-Stack Developer',
    score: 94, vectorSimilarity: 0.92, skillOverlap: 0.95, textRelevance: 0.88,
    matchedSkills: ['React', 'TypeScript', 'Go', 'MongoDB', 'Docker'],
    missingSkills: ['GraphQL'],
  },
  {
    id: '2', candidate: 'Sarah Kim', profession: 'design', title: 'Lead UI/UX Designer',
    score: 87, vectorSimilarity: 0.85, skillOverlap: 0.88, textRelevance: 0.82,
    matchedSkills: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
    missingSkills: ['Motion Design', 'Framer'],
  },
  {
    id: '3', candidate: 'Jordan Lee', profession: 'tech', title: 'DevOps Engineer',
    score: 76, vectorSimilarity: 0.78, skillOverlap: 0.72, textRelevance: 0.80,
    matchedSkills: ['Kubernetes', 'Docker', 'CI/CD', 'AWS'],
    missingSkills: ['Terraform', 'Go', 'Prometheus'],
  },
  {
    id: '4', candidate: 'Maya Patel', profession: 'marketing', title: 'Growth Marketing Lead',
    score: 68, vectorSimilarity: 0.65, skillOverlap: 0.70, textRelevance: 0.72,
    matchedSkills: ['SEO', 'Analytics', 'Content Strategy'],
    missingSkills: ['Paid Acquisition', 'SQL'],
  },
];

const MatchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [matches] = useState(demoMatches);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-brand-950" id="match-page">
      <div className="section-container py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-3xl md:text-5xl font-bold font-display text-brand-900 dark:text-brand-50 mb-4 tracking-tight">
            AI <span className="accent-text italic font-serif">Matching</span>
          </h1>
          <p className="text-lg text-surface-500 max-w-xl mx-auto">
            Powered by semantic vector search and skill analysis to find the perfect candidate-job fit.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-16 animate-slide-up animate-delay-100">
          <div className="card p-8">
            <label className="block text-sm font-semibold text-brand-900 dark:text-brand-100 mb-4 uppercase tracking-widest">Describe the ideal candidate or role</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="e.g., Full-stack developer with React, Go, and Kubernetes experience..."
                value={searchQuery}
                onChange={setSearchQuery}
                id="match-query"
                className="flex-1 !mb-0"
              />
              <Button variant="primary" id="match-search-btn" className="whitespace-nowrap">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Find Matches
              </Button>
            </div>
          </div>
        </div>

        {/* Match Results */}
        <div className="max-w-4xl mx-auto space-y-6 animate-slide-up animate-delay-200">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-200 dark:border-brand-800">
            <h2 className="text-xl font-semibold font-display text-brand-900 dark:text-brand-50 tracking-tight">Match Results</h2>
            <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-surface-500 hidden sm:flex">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-green-500" /> Vector
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-accent-500" /> Text
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-blue-500" /> Skills
              </span>
            </div>
          </div>

          {matches.map((match, i) => (
            <div
              key={match.id}
              className="card p-8 hover:-translate-y-1 hover:shadow-elevate transition-all animate-slide-up"
              style={{ animationDelay: `${(i + 3) * 100}ms` }}
              id={`match-${match.id}`}
            >
              <div className="flex flex-col sm:flex-row items-start gap-8">
                {/* Score Ring */}
                <div className="shrink-0 mx-auto sm:mx-0">
                  <MatchScoreRing score={match.score} size={90} strokeWidth={6} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold font-display text-brand-900 dark:text-brand-50 tracking-tight">{match.candidate}</h3>
                      <p className="text-sm font-medium text-surface-500 mt-1">{match.title}</p>
                    </div>
                    <span className="text-3xl font-display font-bold text-brand-900 dark:text-brand-50">{match.score}%</span>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 p-4 rounded bg-surface-50 dark:bg-brand-900/50">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-surface-500 mb-2 uppercase">
                        <span>Vector</span>
                        <span>{Math.round(match.vectorSimilarity * 100)}%</span>
                      </div>
                      <div className="h-1 bg-surface-200 dark:bg-brand-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${match.vectorSimilarity * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-surface-500 mb-2 uppercase">
                        <span>Text</span>
                        <span>{Math.round(match.textRelevance * 100)}%</span>
                      </div>
                      <div className="h-1 bg-surface-200 dark:bg-brand-800 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-500 rounded-full transition-all duration-1000" style={{ width: `${match.textRelevance * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-surface-500 mb-2 uppercase">
                        <span>Skills</span>
                        <span>{Math.round(match.skillOverlap * 100)}%</span>
                      </div>
                      <div className="h-1 bg-surface-200 dark:bg-brand-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${match.skillOverlap * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {match.matchedSkills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {skill}
                      </span>
                    ))}
                    {match.missingSkills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                        <XCircle className="w-3.5 h-3.5" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchScreen;
