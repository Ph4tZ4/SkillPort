// ============================================================
// SkillPort — Application Constants
// ============================================================

import {
  Laptop, Palette, BarChart3, ClipboardList, Music, Camera, Sparkles, Globe,
  Code2, PlaySquare, Image as ImageIcon, TrendingUp, FileText, Link as LinkIcon,
  Target, Bot, LineChart, Star, Building2
} from 'lucide-react';

export const PROFESSIONS = [
  { value: 'tech', label: 'Technology', icon: Laptop, color: 'from-blue-500 to-cyan-500' },
  { value: 'creative', label: 'Creative', icon: Palette, color: 'from-pink-500 to-rose-500' },
  { value: 'marketing', label: 'Marketing', icon: BarChart3, color: 'from-green-500 to-emerald-500' },
  { value: 'administration', label: 'Administration', icon: ClipboardList, color: 'from-amber-500 to-orange-500' },
  { value: 'music', label: 'Music', icon: Music, color: 'from-purple-500 to-violet-500' },
  { value: 'photography', label: 'Photography', icon: Camera, color: 'from-teal-500 to-cyan-500' },
  { value: 'design', label: 'Design', icon: Sparkles, color: 'from-fuchsia-500 to-pink-500' },
  { value: 'other', label: 'Other', icon: Globe, color: 'from-slate-500 to-gray-500' },
] as const;

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-700' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-700' },
  { value: 'advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-700' },
  { value: 'expert', label: 'Expert', color: 'bg-amber-100 text-amber-700' },
] as const;

export const SECTION_TYPES = [
  { value: 'code', label: 'Code / Project', icon: Code2 },
  { value: 'media', label: 'Media Player', icon: PlaySquare },
  { value: 'gallery', label: 'Image Gallery', icon: ImageIcon },
  { value: 'metrics', label: 'Business Metrics', icon: TrendingUp },
  { value: 'text', label: 'Rich Text', icon: FileText },
  { value: 'link', label: 'External Links', icon: LinkIcon },
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
    icon: Target,
  },
  {
    title: 'AI-Powered Matching',
    description: 'Advanced semantic vector search finds perfect matches between talent and opportunities.',
    icon: Bot,
  },
  {
    title: 'Multi-Profession',
    description: 'Purpose-built for every career: developers, designers, musicians, marketers, and more.',
    icon: Globe,
  },
  {
    title: 'Real-Time Analytics',
    description: 'Track portfolio views, engagement metrics, and match insights with live dashboards.',
    icon: LineChart,
  },
  {
    title: 'Skill Visualization',
    description: 'Showcase your expertise with beautiful skill maps, code demos, and media players.',
    icon: Star,
  },
  {
    title: 'Enterprise Ready',
    description: 'Built for scale with event-driven architecture, handling millions of portfolios seamlessly.',
    icon: Building2,
  },
];
