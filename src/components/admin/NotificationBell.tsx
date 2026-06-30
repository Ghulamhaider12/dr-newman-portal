'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Star } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { NOTIF_META } from '@/components/admin/notificationMeta';
import type { NotificationDTO } from '@/lib/notificationTypes';

/**
 * Topbar bell with an unread badge and a recent-activity popover. Fetches its
 * own data on mount because the shared PageHeader is a server component.
 */
export function NotificationBell() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/notifications')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d) setItems(d.notifications as NotificationDTO[]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const unread = items.filter((n) => !n.isRead).length;
  const badge = unread > 9 ? '9+' : String(unread);

  const recent = useMemo(
    () =>
      [...items]
        .sort(
          (a, b) => Number(a.isRead) - Number(b.isRead) || b.createdAt.localeCompare(a.createdAt)
        )
        .slice(0, 5),
    [items]
  );

  function markAllRead() {
    if (unread === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    fetch(`/api/admin/notifications/mark-all-read`, { method: 'POST' }).catch(() => {});
  }

  function openItem(n: NotificationDTO) {
    setOpen(false);
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      fetch(`/api/admin/notifications/${n.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      }).catch(() => {});
    }
    router.push('/admin/notifications');
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        title="Notifications"
        className={cn(
          'relative inline-flex h-11 w-11 items-center justify-center rounded-control text-ink-muted hover:bg-surface',
          open && 'bg-surface'
        )}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-white bg-warning px-1 text-[10px] font-bold leading-none text-white"
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[360px] max-w-[90vw] overflow-hidden rounded-card border border-border bg-white shadow-overlay"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5">
            <span className="font-serif font-semibold text-ink">Notifications</span>
            <button
              onClick={markAllRead}
              disabled={unread === 0}
              className={cn(
                'text-sm font-semibold',
                unread === 0 ? 'cursor-default text-ink-muted' : 'text-accent hover:underline'
              )}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {recent.length > 0 ? (
              recent.map((n, i) => {
                const meta = NOTIF_META[n.type];
                const Icon = meta.icon;
                return (
                  <button
                    key={n.id}
                    role="menuitem"
                    onClick={() => openItem(n)}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left',
                      i > 0 && 'border-t border-border',
                      n.isRead
                        ? 'bg-white hover:bg-surface'
                        : 'bg-primary-light hover:bg-primary-light/70'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-card"
                      style={{ background: meta.tint, color: meta.fg }}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        {!n.isRead && (
                          <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-primary" />
                        )}
                        <span className="text-sm font-semibold text-ink">{n.title}</span>
                      </span>
                      {n.fileTitle && (
                        <span className="mt-0.5 block truncate text-sm text-ink-muted">
                          {n.fileTitle}
                        </span>
                      )}
                      <span className="mt-0.5 block text-xs text-ink-muted">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </span>
                    {n.isFavourite && (
                      <Star size={14} className="shrink-0 text-warning" fill="#B87333" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-ink-muted">
                You&rsquo;re all caught up.
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              router.push('/admin/notifications');
            }}
            className="block w-full border-t border-border bg-surface px-4 py-3 text-sm font-semibold text-accent hover:underline"
          >
            View all notifications →
          </button>
        </div>
      )}
    </div>
  );
}
