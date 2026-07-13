import Link from 'next/link';
import { Play } from 'lucide-react';
import { formatDate, formatCount } from '@/lib/utils';

export type VideoCardData = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string | Date;
  viewCount: number;
};

export function VideoCard({ video }: { video: VideoCardData }) {
  return (
    <Link
      href={`/videos/${video.videoId}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-white shadow-card transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface">
        {video.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white opacity-90 transition group-hover:bg-black/75">
            <Play size={22} className="ml-0.5" />
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-serif text-lg font-semibold text-ink group-hover:text-primary">
          {video.title}
        </h3>
        <div className="mt-3 flex items-center gap-4 text-xs text-ink-muted">
          <span>{formatDate(video.publishedAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Play size={12} /> {formatCount(video.viewCount)} views
          </span>
        </div>
      </div>
    </Link>
  );
}
