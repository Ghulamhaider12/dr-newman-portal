import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Calendar, HardDrive, Download, FileText, ExternalLink } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { CategoryBadge, FileTypeBadge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { YouTubePlayer } from '@/components/public/YouTubePlayer';
import { FilePreview } from '@/components/public/FilePreview';
import { HelpingMaterials } from '@/components/public/HelpingMaterials';
import { Comments, type PublicComment } from '@/components/public/Comments';
import { getSignedDownloadUrl } from '@/lib/spaces';
import { formatDate, formatFileSize, formatCount } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Self-referencing canonical so search engines attribute this page to the real
// domain (metadataBase), not a reverse-proxy mirror re-hosting our content.
export function generateMetadata({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  return id ? { alternates: { canonical: `/library/${id}` } } : {};
}

export default async function FileDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) notFound();

  const [file, settings] = await Promise.all([
    prisma.file.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        comments: {
          where: { isApproved: true, isPublic: true },
          orderBy: { createdAt: 'desc' },
        },
        helpingMaterials: { orderBy: { position: 'asc' } },
      },
    }),
    getSettings(),
  ]);

  if (!file) notFound();

  // Resolve a directly-loadable URL for inline preview (non-YouTube uploads
  // only). Uses a longer signed-URL window than a plain download so video
  // playback/seeking isn't cut off. Loading a preview does NOT hit the download
  // route, so it never inflates the download counter.
  const previewUrl =
    !file.isYoutube && file.storageKey
      ? await getSignedDownloadUrl(file.storageKey, 60 * 60)
      : null;

  // Signed preview URLs for each helping material (same 1-hour window as the
  // main preview), resolved concurrently.
  const materials = await Promise.all(
    file.helpingMaterials.map(async (m) => ({
      ...m,
      previewUrl: await getSignedDownloadUrl(m.storageKey, 60 * 60),
    }))
  );

  const comments: PublicComment[] = file.comments.map((c) => ({
    id: c.id,
    content: c.content,
    email: c.email,
    createdAt: c.createdAt,
  }));

  return (
    <div>
      {/* Detail — one photographic backdrop spans the hero and the content
          below it. A single top-to-bottom gradient keeps the white hero text
          legible and eases into a softer tint behind the content cards, so there
          is no seam between two clashing images. */}
      <section className="relative overflow-hidden bg-primary text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/newman-dawn.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/30" />

        <div className="relative">
          {/* Hero */}
          <div className="container-page pb-10 pt-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/80">
              <Link href="/library" className="hover:text-white hover:underline">
                Library
              </Link>
              <ChevronRight size={14} />
              <span className="truncate text-white/90">{file.title}</span>
            </nav>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <CategoryBadge name={file.category?.name} />
              <FileTypeBadge type={file.fileType} />
            </div>

            <h1 className="mt-4 max-w-3xl font-serif text-3xl font-semibold leading-tight text-white md:text-4xl">
              {file.title}
            </h1>

            {/* Metadata */}
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={15} /> Uploaded {formatDate(file.dateUploaded)}
              </span>
              {!file.isYoutube && (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <FileText size={15} /> {file.fileType}
                    {file.fileSize ? ` · ${formatFileSize(file.fileSize)}` : ''}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Download size={15} /> {formatCount(file.downloads)} downloads
                  </span>
                </>
              )}
            </div>

            {/* Actions (non-YouTube only) */}
            {!file.isYoutube && (
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href={`/library/${file.id}/download`} variant="success" size="lg">
                  <Download size={18} />
                  Download
                </ButtonLink>
                {file.fileType === 'PDF' && previewUrl && (
                  <ButtonLink
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    variant="secondary"
                    size="lg"
                  >
                    <ExternalLink size={18} />
                    Open PDF
                  </ButtonLink>
                )}
              </div>
            )}
          </div>

          {/* Content grid */}
          <div className="container-page grid grid-cols-1 gap-8 pb-14 lg:grid-cols-3">
            {/* Main: description + preview */}
            <div className="min-w-0 space-y-8 lg:col-span-2">
              {file.description && (
                <div className="rounded-card border border-border bg-white p-6 shadow-card">
                  <div
                    className="prose-portal text-lg text-ink"
                    dangerouslySetInnerHTML={{ __html: file.description }}
                  />
                </div>
              )}

              {/* YouTube player or inline file preview (image/audio/video/PDF;
                  Office files fall back to a download prompt) */}
              {file.isYoutube ? (
                <YouTubePlayer url={file.url} />
              ) : (
                previewUrl && (
                  <FilePreview fileType={file.fileType} url={previewUrl} title={file.title} />
                )
              )}

              {/* Copyright notice */}
              <div className="rounded-card border border-warning/30 bg-[#FBF3EA] p-4">
                <p className="text-sm text-[#8a5524]">
                  <HardDrive size={15} className="mr-1.5 inline" />
                  {settings.commercial}
                </p>
              </div>
            </div>

            {/* Sidebar: helping material + comments */}
            <aside className="min-w-0 space-y-8">
              <HelpingMaterials fileId={file.id} materials={materials} />
              <Comments fileId={file.id} comments={comments} privacyNote={settings.privacy} />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
