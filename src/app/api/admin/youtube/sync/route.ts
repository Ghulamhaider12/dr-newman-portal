import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/apiAuth';
import { fetchChannelVideos, youtubeConfigured } from '@/lib/youtube';

/**
 * Admin: sync all public videos from the configured YouTube channel.
 * Upserts by videoId so re-syncing refreshes stats without duplicating, and
 * preserves each row's isHidden flag.
 */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!youtubeConfigured) {
    return NextResponse.json(
      {
        error: 'YouTube is not configured. Set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID.',
      },
      { status: 400 }
    );
  }

  const videos = await fetchChannelVideos();

  for (const v of videos) {
    await prisma.video.upsert({
      where: { videoId: v.videoId },
      update: {
        title: v.title,
        description: v.description,
        thumbnailUrl: v.thumbnailUrl,
        publishedAt: v.publishedAt,
        viewCount: v.viewCount,
        likeCount: v.likeCount,
        commentCount: v.commentCount,
        duration: v.duration,
        syncedAt: new Date(),
        // isHidden is intentionally left out — an admin's hide choice persists.
      },
      create: {
        videoId: v.videoId,
        title: v.title,
        description: v.description,
        thumbnailUrl: v.thumbnailUrl,
        publishedAt: v.publishedAt,
        viewCount: v.viewCount,
        likeCount: v.likeCount,
        commentCount: v.commentCount,
        duration: v.duration,
      },
    });
  }

  return NextResponse.json({ ok: true, synced: videos.length });
}
