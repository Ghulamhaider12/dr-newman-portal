import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Calendar, HardDrive, Download, FileText } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { CategoryBadge, FileTypeBadge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { YouTubePlayer } from '@/components/public/YouTubePlayer';
import { Comments, type PublicComment } from '@/components/public/Comments';
import { formatDate, formatFileSize, formatCount } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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
      },
    }),
    getSettings(),
  ]);

  if (!file) notFound();

  const comments: PublicComment[] = file.comments.map((c) => ({
    id: c.id,
    content: c.content,
    email: c.email,
    createdAt: c.createdAt,
  }));

  return (
    <div>
      {/* Hero banner with background image */}
      {/* Breadcrumb */}
      <div className="container-page pt-10">
        <nav className="flex items-center gap-2 text-sm text-ink-muted">
          <Link href="/library" className="text-accent hover:text-accent-hover hover:underline">
            Library
          </Link>
          <ChevronRight size={14} />
          <span className="truncate">{file.title}</span>
        </nav>
      </div>

      {/* Detail — the photo sits behind the file information, softened by a
          light scrim so the text stays readable */}
      <section className="relative mt-6 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/morning-line.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="container-page relative grid gap-12 py-10 lg:grid-cols-2">
          {/* Left: file */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge name={file.category?.name} />
              <FileTypeBadge type={file.fileType} />
            </div>
            <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]">
              {file.title}
            </h1>

            {file.description && (
              <div
                className="prose-portal mt-5 text-lg text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] [&_p]:text-white [&_strong]:text-white"
                dangerouslySetInnerHTML={{ __html: file.description }}
              />
            )}

            {/* YouTube Player */}
            {file.isYoutube && (
              <div className="mt-6">
                <YouTubePlayer url={file.url} />
              </div>
            )}

            {/* Metadata */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
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

            {/* Action (non-YouTube only) */}
            {!file.isYoutube && (
              <div className="mt-7">
                <ButtonLink href={`/library/${file.id}/download`} variant="success" size="lg">
                  <Download size={18} />
                  Download
                </ButtonLink>
              </div>
            )}

            {/* Copyright notice */}
            <div className="mt-8 rounded-card border border-warning/30 bg-[#FBF3EA] p-4">
              <p className="text-sm text-[#8a5524]">
                <HardDrive size={15} className="mr-1.5 inline" />
                {settings.commercial}
              </p>
            </div>
          </div>

          {/* Right: comments */}
          <div>
            <Comments fileId={file.id} comments={comments} privacyNote={settings.privacy} />
          </div>
        </div>
      </section>
    </div>
  );
}
