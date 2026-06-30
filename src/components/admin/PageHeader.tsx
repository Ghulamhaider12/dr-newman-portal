import { NotificationBell } from '@/components/admin/NotificationBell';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  /** @deprecated kept for call-site compatibility; the bell now tracks notifications. */
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
        <NotificationBell />
      </div>
    </div>
  );
}
