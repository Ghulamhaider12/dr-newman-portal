import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** "Mar 12, 2025" — quiet, factual metadata formatting. */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Compact relative time for notifications.
 * <60s "Just now" · <60m "{n}m ago" · <24h "{n}h ago" · 1d "Yesterday" ·
 * <7d "{n}d ago" · otherwise "Mon D".
 */
export function formatRelativeTime(date: Date | string, now: Date = new Date()): string {
  const then = typeof date === 'string' ? new Date(date) : date;
  const sec = Math.round((now.getTime() - then.getTime()) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** "Apr 4, 2025, 3:42 PM" — full timestamp for hover/title attributes. */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "2.4 MB" — human file sizes. */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`;
}

/** "1,204 downloads" */
export function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

/** Category colour key — Medical = blue, Art & Literature = teal, Other = grey. */
export function categoryColor(name?: string | null): 'medical' | 'art' | 'other' {
  const n = (name ?? '').toLowerCase();
  if (n.includes('medical') || n.includes('medicine')) return 'medical';
  if (n.includes('art') || n.includes('literature')) return 'art';
  return 'other';
}

/** Normalise a YouTube URL to its canonical watch URL. Returns null if not YouTube. */
export function parseYoutube(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/watch?v=${id}` : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/watch?v=${id}`;
      if (u.pathname.startsWith('/embed/')) {
        return `https://www.youtube.com/watch?v=${u.pathname.split('/')[2]}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Strip HTML tags to a plain-text excerpt (for card previews). */
export function htmlToText(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}
