// ============================================================
// SkillPort — Application Constants
// ============================================================

export const PROFESSIONS = [
  { value: 'tech', label: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { value: 'creative', label: 'Creative', icon: '🎨', color: 'from-pink-500 to-rose-500' },
  { value: 'marketing', label: 'Marketing', icon: '📊', color: 'from-green-500 to-emerald-500' },
  { value: 'administration', label: 'Administration', icon: '📋', color: 'from-amber-500 to-orange-500' },
  { value: 'music', label: 'Music', icon: '🎵', color: 'from-purple-500 to-violet-500' },
  { value: 'photography', label: 'Photography', icon: '📷', color: 'from-teal-500 to-cyan-500' },
  { value: 'design', label: 'Design', icon: '✨', color: 'from-fuchsia-500 to-pink-500' },
  { value: 'other', label: 'Other', icon: '🌐', color: 'from-slate-500 to-gray-500' },
] as const;

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-700' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-700' },
  { value: 'advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-700' },
  { value: 'expert', label: 'Expert', color: 'bg-amber-100 text-amber-700' },
] as const;

export const SECTION_TYPES = [
  { value: 'code', label: 'Code / Project', icon: '🖥️' },
  { value: 'media', label: 'Media Player', icon: '🎬' },
  { value: 'gallery', label: 'Image Gallery', icon: '🖼️' },
  { value: 'metrics', label: 'Business Metrics', icon: '📈' },
  { value: 'text', label: 'Rich Text', icon: '📝' },
  { value: 'link', label: 'External Links', icon: '🔗' },
] as const;

export const JOB_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'paused', label: 'Paused', color: 'bg-amber-100 text-amber-700' },
  { value: 'closed', label: 'Closed', color: 'bg-red-100 text-red-700' },
] as const;

export const SKILL_CATEGORIES = [
  'Frontend', 'Backend', 'Mobile', 'DevOps', 'Data Science',
  'Design', 'Marketing', 'Management', 'Communication',
  'Creative', 'Music', 'Photography', 'Writing', 'Other',
];

export const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/search', label: 'Explore' },
  { path: '/jobs', label: 'Jobs' },
  { path: '/matches', label: 'AI Match' },
];

export const FEATURES = [
  {
    title: 'Dynamic Portfolios',
    description: 'Replace static resumes with live, interactive presentation cards tailored to your profession.',
    icon: '🎯',
  },
  {
    title: 'AI-Powered Matching',
    description: 'Advanced semantic vector search finds perfect matches between talent and opportunities.',
    icon: '🤖',
  },
  {
    title: 'Multi-Profession',
    description: 'Purpose-built for every career: developers, designers, musicians, marketers, and more.',
    icon: '🌍',
  },
  {
    title: 'Real-Time Analytics',
    description: 'Track portfolio views, engagement metrics, and match insights with live dashboards.',
    icon: '📊',
  },
  {
    title: 'Skill Visualization',
    description: 'Showcase your expertise with beautiful skill maps, code demos, and media players.',
    icon: '✨',
  },
  {
    title: 'Enterprise Ready',
    description: 'Built for scale with event-driven architecture, handling millions of portfolios seamlessly.',
    icon: '🏢',
  },
];
