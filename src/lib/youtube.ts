/**
 * YouTube Data API v3 — read-only public channel sync.
 *
 * Reads a public channel's uploads and per-video public stats (views/likes/
 * comments) using a plain API key — no OAuth, no access to the channel owner's
 * account. Fail-soft: when unconfigured or on any API error, fetches return []
 * so pages render an empty / "not configured" state instead of throwing —
 * mirroring the spaces.ts / email.ts pattern.
 */

const API_KEY = process.env.YOUTUBE_API_KEY || '';
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || '';
const API = 'https://www.googleapis.com/youtube/v3';

export const youtubeConfigured = Boolean(API_KEY && CHANNEL_ID);

export type YouTubeVideo = {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
async function ytGet(path: string, params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams({ ...params, key: API_KEY }).toString();
  const res = await fetch(`${API}/${path}?${qs}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`YouTube API ${path} ${res.status}: ${text.slice(0, 200)}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/** Pick the highest-resolution thumbnail available. */
function bestThumb(thumbs: any): string {
  if (!thumbs) return '';
  return (
    thumbs.maxres?.url ||
    thumbs.standard?.url ||
    thumbs.high?.url ||
    thumbs.medium?.url ||
    thumbs.default?.url ||
    ''
  );
}

/**
 * Fetch all public videos for the configured channel, with basic stats.
 * Returns [] when unconfigured or on error (fail-soft).
 */
export async function fetchChannelVideos(): Promise<YouTubeVideo[]> {
  if (!youtubeConfigured) {
    console.info('[youtube] Not configured — skipping channel sync.');
    return [];
  }

  try {
    // 1. Resolve the channel's "uploads" playlist.
    const ch = await ytGet('channels', {
      part: 'contentDetails',
      id: CHANNEL_ID,
    });
    const uploads: string | undefined = ch.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) {
      console.warn('[youtube] No uploads playlist found for channel', CHANNEL_ID);
      return [];
    }

    // 2. Page through the uploads playlist collecting every video id.
    const ids: string[] = [];
    let pageToken: string | undefined;
    do {
      const pl = await ytGet('playlistItems', {
        part: 'contentDetails',
        playlistId: uploads,
        maxResults: '50',
        ...(pageToken ? { pageToken } : {}),
      });
      for (const it of pl.items ?? []) {
        const vid = it.contentDetails?.videoId;
        if (vid) ids.push(vid);
      }
      pageToken = pl.nextPageToken;
    } while (pageToken);

    // 3. Batch-fetch video details + statistics (max 50 ids per call).
    const out: YouTubeVideo[] = [];
    for (let i = 0; i < ids.length; i += 50) {
      const batch = ids.slice(i, i + 50);
      const vids = await ytGet('videos', {
        part: 'snippet,statistics,contentDetails',
        id: batch.join(','),
      });
      for (const v of vids.items ?? []) {
        out.push({
          videoId: v.id,
          title: v.snippet?.title ?? '',
          description: v.snippet?.description ?? '',
          thumbnailUrl: bestThumb(v.snippet?.thumbnails),
          publishedAt: v.snippet?.publishedAt ? new Date(v.snippet.publishedAt) : new Date(),
          viewCount: Number(v.statistics?.viewCount ?? 0),
          likeCount: Number(v.statistics?.likeCount ?? 0),
          commentCount: Number(v.statistics?.commentCount ?? 0),
          duration: v.contentDetails?.duration ?? '',
        });
      }
    }
    return out;
  } catch (err) {
    // A 404 here means the channel's uploads playlist is empty (no public
    // videos yet) — not an error, just nothing to sync.
    if ((err as { status?: number })?.status === 404) {
      console.info('[youtube] Channel has no public videos yet — nothing to sync.');
      return [];
    }
    console.error('[youtube] Channel sync failed:', err);
    return [];
  }
}
