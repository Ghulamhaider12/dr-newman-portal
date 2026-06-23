import Link from "next/link";
import { Download, Youtube } from "lucide-react";
import { CategoryBadge, FileTypeBadge } from "@/components/ui/Badge";
import { formatDate, formatCount, htmlToText } from "@/lib/utils";
import type { FileType } from "@prisma/client";

export type FileCardData = {
  id: number;
  title: string;
  description: string;
  fileType: FileType;
  isYoutube: boolean;
  downloads: number;
  dateUploaded: string | Date;
  category: { name: string } | null;
};

export function FileCard({ file }: { file: FileCardData }) {
  const excerpt = htmlToText(file.description, 130);
  return (
    <Link
      href={`/library/${file.id}`}
      className="group flex flex-col rounded-card border border-border bg-white p-6 shadow-card transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategoryBadge name={file.category?.name} />
        <FileTypeBadge type={file.fileType} />
      </div>
      <h3 className="font-serif text-xl font-semibold text-ink group-hover:text-primary">
        {file.title}
      </h3>
      {excerpt && (
        <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{excerpt}</p>
      )}
      <div className="mt-4 flex items-center gap-4 text-xs text-ink-muted">
        <span>{formatDate(file.dateUploaded)}</span>
        <span className="inline-flex items-center gap-1">
          {file.isYoutube ? (
            <>
              <Youtube size={14} /> Video
            </>
          ) : (
            <>
              <Download size={14} /> {formatCount(file.downloads)} downloads
            </>
          )}
        </span>
      </div>
    </Link>
  );
}
