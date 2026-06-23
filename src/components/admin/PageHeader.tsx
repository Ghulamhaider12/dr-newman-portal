import Link from "next/link";
import { Bell } from "lucide-react";
import { CountBadge } from "@/components/ui/Badge";

export function PageHeader({
  title,
  subtitle,
  pendingCount = 0,
  action,
}: {
  title: string;
  subtitle?: string;
  pendingCount?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-8 py-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {action}
        <Link
          href="/admin/comments"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-control text-ink-muted hover:bg-surface"
          aria-label={`${pendingCount} pending comments`}
        >
          <Bell size={20} />
          {pendingCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5">
              <CountBadge count={pendingCount} />
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
