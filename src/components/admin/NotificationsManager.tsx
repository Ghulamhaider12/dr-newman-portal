'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ChevronDown, CheckCheck, FileText, Clock, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, formatRelativeTime, formatDateTime } from '@/lib/utils';
import { NOTIF_META } from '@/components/admin/notificationMeta';
import { NOTIF_TYPE_ORDER, type NotificationDTO } from '@/lib/notificationTypes';

type Status = 'all' | 'unread' | 'read';
type Sort = 'newest' | 'oldest' | 'favourites' | 'unread' | 'type';

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'newest', label: 'Sort: Newest first' },
  { value: 'oldest', label: 'Sort: Oldest first' },
  { value: 'favourites', label: 'Sort: Favourites first' },
  { value: 'unread', label: 'Sort: Unread first' },
  { value: 'type', label: 'Sort: By type' },
];

export function NotificationsManager({ initial }: { initial: NotificationDTO[] }) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationDTO[]>(initial);
  const [status, setStatus] = useState<Status>('all');
  const [favOnly, setFavOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('newest');

  const unreadCount = items.filter((n) => !n.isRead).length;
  const favCount = items.filter((n) => n.isFavourite).length;

  async function patch(id: number, data: Partial<Pick<NotificationDTO, 'isRead' | 'isFavourite'>>) {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) router.refresh();
    } catch {
      router.refresh();
    }
  }

  function toggleFav(id: number) {
    const current = items.find((n) => n.id === id);
    if (!current) return;
    const next = !current.isFavourite;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isFavourite: next } : n)));
    patch(id, { isFavourite: next });
  }

  function toggleRead(id: number) {
    const current = items.find((n) => n.id === id);
    if (!current) return;
    const next = !current.isRead;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: next } : n)));
    patch(id, { isRead: next });
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    fetch(`/api/admin/notifications/mark-all-read`, { method: 'POST' }).catch(() =>
      router.refresh()
    );
  }

  const visible = useMemo(() => {
    const filtered = items.filter((n) => {
      if (status === 'unread' && n.isRead) return false;
      if (status === 'read' && !n.isRead) return false;
      if (favOnly && !n.isFavourite) return false;
      return true;
    });
    const byNewest = (a: NotificationDTO, b: NotificationDTO) =>
      b.createdAt.localeCompare(a.createdAt);
    return [...filtered].sort((a, b) => {
      if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sort === 'favourites')
        return Number(b.isFavourite) - Number(a.isFavourite) || byNewest(a, b);
      if (sort === 'unread') return Number(a.isRead) - Number(b.isRead) || byNewest(a, b);
      if (sort === 'type')
        return (
          NOTIF_TYPE_ORDER.indexOf(a.type) - NOTIF_TYPE_ORDER.indexOf(b.type) || byNewest(a, b)
        );
      return byNewest(a, b);
    });
  }, [items, status, favOnly, sort]);

  const statusTabs: { value: Status; label: string; count?: number }[] = [
    { value: 'all', label: 'All', count: items.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'read', label: 'Read' },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status segmented control */}
          <div
            role="group"
            aria-label="Filter by status"
            className="inline-flex gap-0.5 rounded-control border border-border bg-surface p-[3px]"
          >
            {statusTabs.map((t) => {
              const active = status === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setStatus(t.value)}
                  aria-pressed={active}
                  className={cn(
                    'inline-flex min-h-[34px] items-center gap-1.5 rounded-control px-3 text-sm',
                    active
                      ? 'bg-white font-semibold text-primary shadow-card'
                      : 'font-medium text-ink-muted'
                  )}
                >
                  {t.label}
                  {t.count != null && (
                    <span
                      className={cn(
                        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[5px] text-xs font-bold',
                        active ? 'bg-primary-light text-primary' : 'bg-border text-ink-muted'
                      )}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Favourites toggle */}
          <button
            onClick={() => setFavOnly((v) => !v)}
            aria-pressed={favOnly}
            className={cn(
              'inline-flex min-h-[40px] items-center gap-[7px] rounded-control border px-3.5 text-sm font-semibold',
              favOnly
                ? 'border-warning bg-[#F6ECE0] text-warning'
                : 'border-border-strong bg-white text-ink-muted'
            )}
          >
            <Star size={16} fill={favOnly ? '#B87333' : 'none'} />
            Favourites
            <span
              className={cn(
                'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[5px] text-xs font-bold',
                favOnly ? 'bg-warning text-white' : 'bg-border text-ink-muted'
              )}
            >
              {favCount}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              aria-label="Sort notifications"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="min-h-[40px] cursor-pointer appearance-none rounded-control border border-border-strong bg-white py-2 pl-3 pr-8 text-sm font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
          </div>

          <Button variant="secondary" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck size={16} />
            Mark all read
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex max-w-[840px] flex-col gap-3">
        {visible.length > 0 ? (
          visible.map((n) => (
            <NotifRow key={n.id} n={n} onToggleFav={toggleFav} onToggleRead={toggleRead} />
          ))
        ) : (
          <div className="rounded-card border border-border bg-surface p-16 text-center text-ink-muted">
            <span className="mb-3 inline-flex">
              {favOnly ? <Star size={28} /> : <BellOff size={28} />}
            </span>
            <p className="m-0">
              {favOnly
                ? 'No favourite notifications match these filters.'
                : 'No notifications match these filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotifRow({
  n,
  onToggleFav,
  onToggleRead,
}: {
  n: NotificationDTO;
  onToggleFav: (id: number) => void;
  onToggleRead: (id: number) => void;
}) {
  const meta = NOTIF_META[n.type];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-card border border-border px-5 py-4',
        n.isRead ? 'bg-white' : 'border-l-[3px] border-l-primary bg-primary-light'
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card"
        style={{ background: meta.tint, color: meta.fg }}
      >
        <Icon size={20} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-3">
          {!n.isRead && (
            <span
              aria-label="Unread"
              title="Unread"
              className="h-2 w-2 shrink-0 rounded-full bg-primary"
            />
          )}
          <span className="font-semibold text-ink">{n.title}</span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.04em]"
            style={{ background: meta.tint, color: meta.fg }}
          >
            {meta.label}
          </span>
        </div>
        <p className="mb-1.5 text-ink-muted">{n.body}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
          {n.fileTitle && (
            <span className="flex items-center gap-1.5">
              <FileText size={14} /> {n.fileTitle}
            </span>
          )}
          <span className="flex items-center gap-1.5" title={formatDateTime(n.createdAt)}>
            <Clock size={14} /> {formatRelativeTime(n.createdAt)}
          </span>
          <button
            onClick={() => onToggleRead(n.id)}
            className="font-semibold text-accent hover:underline"
          >
            {n.isRead ? 'Mark as unread' : 'Mark as read'}
          </button>
        </div>
      </div>

      <button
        onClick={() => onToggleFav(n.id)}
        aria-pressed={n.isFavourite}
        aria-label={n.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        title={n.isFavourite ? 'Favourited' : 'Add to favourites'}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-control',
          n.isFavourite ? 'text-warning' : 'text-ink-muted hover:text-ink'
        )}
      >
        <Star size={19} fill={n.isFavourite ? '#B87333' : 'none'} />
      </button>
    </div>
  );
}
