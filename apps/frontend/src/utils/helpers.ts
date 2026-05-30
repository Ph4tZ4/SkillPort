// ============================================================
// SkillPort — Utility Functions
// ============================================================

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 hours ago").
 */
export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + '…';
}

/**
 * Generate a deterministic color from a string (for skill badges).
 */
export function stringToColor(str: string): string {
  const colors = [
    'bg-surface-100 dark:bg-brand-900 text-surface-700 dark:text-brand-100 border-surface-200 dark:border-brand-800',
    'bg-brand-50 dark:bg-brand-800 text-brand-900 dark:text-brand-50 border-brand-100 dark:border-brand-700',
    'bg-surface-50 dark:bg-surface-900 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-800',
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Format a large number with K/M suffixes.
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Format salary range.
 */
export function formatSalary(min: number, max: number, currency = 'USD'): string {
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });
  if (min && max) return `${fmt.format(min)} – ${fmt.format(max)}`;
  if (min) return `From ${fmt.format(min)}`;
  if (max) return `Up to ${fmt.format(max)}`;
  return 'Negotiable';
}

/**
 * Debounce a function.
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

import { LucideIcon, Laptop, Palette, BarChart3, ClipboardList, Music, Camera, Sparkles, Globe } from 'lucide-react';

/**
 * Get profession display info.
 */
export function getProfessionInfo(profession: string) {
  const map: Record<string, { label: string; icon: LucideIcon; gradient: string }> = {
    tech: { label: 'Technology', icon: Laptop, gradient: 'from-blue-500 to-cyan-500' },
    creative: { label: 'Creative', icon: Palette, gradient: 'from-pink-500 to-rose-500' },
    marketing: { label: 'Marketing', icon: BarChart3, gradient: 'from-green-500 to-emerald-500' },
    administration: { label: 'Administration', icon: ClipboardList, gradient: 'from-amber-500 to-orange-500' },
    music: { label: 'Music', icon: Music, gradient: 'from-purple-500 to-violet-500' },
    photography: { label: 'Photography', icon: Camera, gradient: 'from-teal-500 to-cyan-500' },
    design: { label: 'Design', icon: Sparkles, gradient: 'from-fuchsia-500 to-pink-500' },
    other: { label: 'Other', icon: Globe, gradient: 'from-slate-500 to-gray-500' },
  };
  return map[profession] || map.other;
}

/**
 * Class name merger utility.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
