import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/public/VideoCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: "Videos — Dr. Newman's Content Portal" };

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    where: { isHidden: false },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <>
      <section className="bg-primary-light">
        <div className="container-page py-16">
          <h1 className="font-serif text-3xl font-semibold text-ink">Videos</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Talks, lectures, and recordings from Dr. Newman&apos;s YouTube channel.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        {videos.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-surface p-16 text-center">
            <p className="font-serif text-xl text-ink">No videos yet.</p>
            <p className="mt-2 text-sm text-ink-muted">Please check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                video={{
                  videoId: v.videoId,
                  title: v.title,
                  thumbnailUrl: v.thumbnailUrl,
                  publishedAt: v.publishedAt,
                  viewCount: v.viewCount,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
