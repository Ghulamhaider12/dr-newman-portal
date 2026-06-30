import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { NotificationsManager } from '@/components/admin/NotificationsManager';
import type { NotificationDTO } from '@/lib/notificationTypes';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const [items, pendingCount] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: { file: { select: { title: true } } },
    }),
    prisma.comment.count({ where: { isApproved: null } }),
  ]);

  const notifications: NotificationDTO[] = items.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    fileTitle: n.file?.title ?? null,
    isRead: n.isRead,
    isFavourite: n.isFavourite,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Recent activity across your library — favourite, filter, and sort."
        pendingCount={pendingCount}
      />
      <div className="p-8">
        <NotificationsManager initial={notifications} />
      </div>
    </>
  );
}
