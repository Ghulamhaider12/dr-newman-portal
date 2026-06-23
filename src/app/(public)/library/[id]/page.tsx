import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calendar, HardDrive, Download, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { CategoryBadge, FileTypeBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { CopyBox } from "@/components/public/CopyBox";
import { Comments, type PublicComment } from "@/components/public/Comments";
import { formatDate, formatFileSize, formatCount, parseYoutube } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FileDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!id) notFound();

  const [file, settings] = await Promise.all([
    prisma.file.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        comments: {
          where: { isApproved: true, isPublic: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    getSettings(),
  ]);

  if (!file) notFound();

  const watchUrl = file.isYoutube ? parseYoutube(file.url) ?? file.url : null;
  const comments: PublicComment[] = file.comments.map((c) => ({
    id: c.id,
    content: c.content,
    email: c.email,
    createdAt: c.createdAt,
  }));

  return (
    <div className="container-page py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/library" className="text-accent hover:text-accent-hover hover:underline">
          Library
        </Link>
        <ChevronRight size={14} />
        <span className="truncate">{file.title}</span>
      </nav>

      <div className="mt-6 grid gap-12 lg:grid-cols-2">
        {/* Left: file */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge name={file.category?.name} />
            <FileTypeBadge type={file.fileType} />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink">
            {file.title}
          </h1>

          {file.description && (
            <div
              className="prose-portal mt-5 text-lg text-ink"
              dangerouslySetInnerHTML={{ __html: file.description }}
            />
          )}

          {/* Metadata */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={15} /> Uploaded {formatDate(file.dateUploaded)}
            </span>
            {!file.isYoutube && (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <FileText size={15} /> {file.fileType}
                  {file.fileSize ? ` · ${formatFileSize(file.fileSize)}` : ""}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Download size={15} /> {formatCount(file.downloads)} downloads
                </span>
              </>
            )}
          </div>

          {/* Action */}
          <div className="mt-7">
            {file.isYoutube && watchUrl ? (
              <CopyBox url={watchUrl} />
            ) : (
              <ButtonLink
                href={`/library/${file.id}/download`}
                variant="success"
                size="lg"
              >
                <Download size={18} />
                Download
              </ButtonLink>
            )}
          </div>

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
          <Comments
            fileId={file.id}
            comments={comments}
            privacyNote={settings.privacy}
          />
        </div>
      </div>
    </div>
  );
}
