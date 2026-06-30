import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/apiAuth';

/** Admin: mark every notification as read. */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
  return NextResponse.json({ ok: true });
}
