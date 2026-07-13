import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { YouTubeManager } from '@/components/admin/YouTubeManager';
import { youtubeConfigured } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export default async function AdminYouTubePage() {
  const videos = await prisma.video.findMany({
    orderBy: { publishedAt: 'desc' },
  });

  const rows = videos.map((v) => ({
    id: v.id,
    videoId: v.videoId,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    publishedAt: v.publishedAt.toISOString(),
    viewCount: v.viewCount,
    likeCount: v.likeCount,
    commentCount: v.commentCount,
    isHidden: v.isHidden,
    syncedAt: v.syncedAt.toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="YouTube"
        subtitle="Videos synced from the channel. Stats refresh on each sync."
      />
      <div className="p-8">
        <YouTubeManager videos={rows} configured={youtubeConfigured} />
      </div>
    </>
  );
}
