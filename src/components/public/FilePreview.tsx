import type { FileType } from '@prisma/client';
import { FileTypeBadge } from '@/components/ui/Badge';
import { fileTypeLabel } from '@/lib/fileType';

/**
 * Inline preview of an uploaded file on the detail page. Server component —
 * native <img>/<audio>/<video>/<iframe> need no client JS. The `url` is a
 * directly-loadable file URL (local /uploads path, or a short-lived signed
 * Spaces URL resolved by the page). Office formats can't be rendered natively,
 * so they fall back to a "download to view" card.
 */
export function FilePreview({
  fileType,
  url,
  title,
  compact = false,
}: {
  fileType: FileType;
  url: string;
  title: string;
  /** Smaller media + no top margin — used inside the helping-material dropdown. */
  compact?: boolean;
}) {
  // Top margin only matters for the full-size main-file preview; the compact
  // variant sits inside a panel that supplies its own padding.
  const mt = compact ? '' : 'mt-6';
  const mediaMaxH = compact ? 'max-h-[280px]' : 'max-h-[600px]';
  const pdfH = compact ? 'h-[400px]' : 'h-[600px]';

  // Image
  if (fileType === 'JPG' || fileType === 'PNG') {
    return (
      <div className={`${mt} overflow-hidden rounded-card bg-black/80 p-2 shadow-card`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title}
          className={`mx-auto ${mediaMaxH} w-auto max-w-full rounded-control`}
        />
      </div>
    );
  }

  // Audio
  if (fileType === 'MP3') {
    return (
      <div className={`${mt} rounded-card bg-black/80 p-4 shadow-card`}>
        <audio controls src={url} className="w-full">
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  // Video
  if (fileType === 'MP4') {
    return (
      <div className={`${mt} overflow-hidden rounded-card bg-black/80 p-2 shadow-card`}>
        <video controls src={url} className={`${mediaMaxH} w-full rounded-control`}>
          Your browser does not support the video element.
        </video>
      </div>
    );
  }

  // PDF
  if (fileType === 'PDF') {
    return (
      <div
        className={`${mt} overflow-hidden rounded-card border border-border bg-white shadow-card`}
      >
        <iframe src={url} title={title} className={`${pdfH} w-full`} />
      </div>
    );
  }

  // Office formats (DOC / XLS / PPT) — no native browser preview.
  return (
    <div
      className={`${mt} rounded-card border border-border bg-white ${
        compact ? 'p-4' : 'p-6'
      } text-center shadow-card`}
    >
      <div className="flex justify-center">
        <FileTypeBadge type={fileType} />
      </div>
      <p className="mt-3 text-sm text-ink-muted">
        A preview isn&apos;t available for {fileTypeLabel(fileType)} files. Use the Download button
        below to view it.
      </p>
    </div>
  );
}
