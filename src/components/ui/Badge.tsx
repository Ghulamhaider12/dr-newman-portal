import { cn, categoryColor } from "@/lib/utils";
import { FILE_TYPE_COLOR, fileTypeLabel as ftLabel } from "@/lib/fileType";
import type { FileType } from "@prisma/client";

const CAT_STYLES = {
  medical: "bg-cat-medical-bg text-cat-medical",
  art: "bg-cat-art-bg text-cat-art",
  other: "bg-cat-other-bg text-cat-other",
} as const;

export function CategoryBadge({ name }: { name?: string | null }) {
  const key = categoryColor(name);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-badge px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.04em]",
        CAT_STYLES[key]
      )}
    >
      {name ?? "Other"}
    </span>
  );
}

export function FileTypeBadge({ type }: { type: FileType }) {
  const color = FILE_TYPE_COLOR[type];
  return (
    <span
      className="inline-flex items-center rounded-badge border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.04em]"
      style={{
        color,
        borderColor: `${color}55`,
        backgroundColor: `${color}10`,
      }}
    >
      {ftLabel(type)}
    </span>
  );
}

export function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-warning px-1.5 text-xs font-semibold text-white">
      {count}
    </span>
  );
}
