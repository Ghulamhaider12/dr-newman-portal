import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/apiAuth';
import type { NotificationDTO } from '@/lib/notificationTypes';

/**
 * Admin: list notifications. Optional query params:
 *   status=all|unread|read, favourite=true
 * Returns the list plus unreadCount and favouriteCount. (Filtering/sorting may
 * also be done client-side over this list, which is what the page does.)
 */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const favouriteOnly = searchParams.get('favourite') === 'true';

  const where: Prisma.NotificationWhereInput = {};
  if (status === 'unread') where.isRead = false;
  if (status === 'read') where.isRead = true;
  if (favouriteOnly) where.isFavourite = true;

  const [items, unreadCount, favouriteCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { file: { select: { title: true } } },
    }),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.notification.count({ where: { isFavourite: true } }),
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

  return NextResponse.json({ notifications, unreadCount, favouriteCount });
}
