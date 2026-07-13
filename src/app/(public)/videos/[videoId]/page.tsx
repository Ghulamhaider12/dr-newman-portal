import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Play, ThumbsUp, MessageSquare, Calendar } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { YouTubePlayer } from '@/components/public/YouTubePlayer';
import { formatDate, formatCount } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function VideoDetailPage({ params }: { params: { videoId: string } }) {
  const video = await prisma.video.findUnique({
    where: { videoId: params.videoId },
  });
  if (!video || video.isHidden) notFound();

  return (
    <div className="container-page py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/videos" className="text-accent hover:text-accent-hover hover:underline">
          Videos
        </Link>
        <ChevronRight size={14} />
        <span className="truncate">{video.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          <YouTubePlayer url={`https://www.youtube.com/watch?v=${video.videoId}`} />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold leading-tight text-ink">
            {video.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={15} /> {formatDate(video.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Play size={15} /> {formatCount(video.viewCount)} views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUp size={15} /> {formatCount(video.likeCount)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare size={15} /> {formatCount(video.commentCount)}
            </span>
          </div>
          {video.description && (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
