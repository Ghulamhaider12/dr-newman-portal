'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Eye, EyeOff, ThumbsUp, MessageSquare, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate, formatCount } from '@/lib/utils';

type VideoRow = {
  id: number;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isHidden: boolean;
  syncedAt: string;
};

export function YouTubeManager({
  videos,
  configured,
}: {
  videos: VideoRow[];
  configured: boolean;
}) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sync() {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/youtube/sync', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Sync failed.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  }

  async function toggleHidden(v: VideoRow) {
    await fetch(`/api/admin/youtube/${v.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isHidden: !v.isHidden }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'} synced
        </p>
        <Button onClick={sync} disabled={syncing || !configured}>
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Sync now'}
        </Button>
      </div>

      {!configured && (
        <div className="mt-4 rounded-card border border-warning/30 bg-[#FBF3EA] p-4 text-sm text-[#8a5524]">
          YouTube isn&apos;t configured yet. Set <code>YOUTUBE_API_KEY</code> and{' '}
          <code>YOUTUBE_CHANNEL_ID</code> in the environment, then click Sync now.
        </div>
      )}
      {error && <p className="mt-3 text-sm text-[#B23B3B]">{error}</p>}

      <div className="mt-6 space-y-3">
        {videos.length === 0 ? (
          <p className="rounded-card border border-dashed border-border p-12 text-center text-ink-muted">
            No videos yet. Click “Sync now” to pull them from the channel.
          </p>
        ) : (
          videos.map((v) => (
            <div
              key={v.id}
              className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-white p-4 shadow-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.thumbnailUrl}
                alt=""
                className="h-20 w-36 shrink-0 rounded-control bg-surface object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${v.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-1 font-semibold text-ink hover:text-primary"
                  >
                    {v.title}
                  </a>
                  {v.isHidden && (
                    <span className="rounded-badge bg-surface px-2 py-0.5 text-xs font-semibold text-ink-muted">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    <Play size={12} /> {formatCount(v.viewCount)} views
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp size={12} /> {formatCount(v.likeCount)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare size={12} /> {formatCount(v.commentCount)}
                  </span>
                  <span>· {formatDate(v.publishedAt)}</span>
                </div>
              </div>
              <button
                onClick={() => toggleHidden(v)}
                className="inline-flex h-9 items-center gap-2 rounded-control border border-border-strong px-3 text-sm font-medium text-ink hover:bg-surface"
              >
                {v.isHidden ? (
                  <>
                    <Eye size={15} /> Show
                  </>
                ) : (
                  <>
                    <EyeOff size={15} /> Hide
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
