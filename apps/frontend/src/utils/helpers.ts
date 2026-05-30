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
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-green-100 text-green-700 border-green-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-cyan-100 text-cyan-700 border-cyan-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-teal-100 text-teal-700 border-teal-200',
    'bg-orange-100 text-orange-700 border-orange-200',
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

/**
 * Get profession display info.
 */
export function getProfessionInfo(profession: string) {
  const map: Record<string, { label: string; icon: string; gradient: string }> = {
    tech: { label: 'Technology', icon: '💻', gradient: 'from-blue-500 to-cyan-500' },
    creative: { label: 'Creative', icon: '🎨', gradient: 'from-pink-500 to-rose-500' },
    marketing: { label: 'Marketing', icon: '📊', gradient: 'from-green-500 to-emerald-500' },
    administration: { label: 'Administration', icon: '📋', gradient: 'from-amber-500 to-orange-500' },
    music: { label: 'Music', icon: '🎵', gradient: 'from-purple-500 to-violet-500' },
    photography: { label: 'Photography', icon: '📷', gradient: 'from-teal-500 to-cyan-500' },
    design: { label: 'Design', icon: '✨', gradient: 'from-fuchsia-500 to-pink-500' },
    other: { label: 'Other', icon: '🌐', gradient: 'from-slate-500 to-gray-500' },
  };
  return map[profession] || map.other;
}

/**
 * Class name merger utility.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
