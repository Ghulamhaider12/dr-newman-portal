import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@prisma/client';
import { formatCount } from '@/lib/utils';

/**
 * Create a notification. Fail-soft: any error is swallowed and logged so the
 * main action (a comment, an upload, a settings save) is never blocked.
 */
export async function createNotification(input: {
  type: NotificationType;
  title: string;
  body: string;
  fileId?: number | null;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        type: input.type,
        title: input.title,
        body: input.body,
        fileId: input.fileId ?? null,
      },
    });
  } catch (err) {
    console.error('[notifications] Failed to create notification:', err);
  }
}

const DOWNLOAD_MILESTONES = [100, 500, 1000, 5000, 10000];

/** Emit a DOWNLOAD notification only when a count crosses a milestone. */
export async function notifyDownloadMilestone(
  file: { id: number; title: string },
  downloads: number
): Promise<void> {
  if (!DOWNLOAD_MILESTONES.includes(downloads)) return;
  await createNotification({
    type: 'DOWNLOAD',
    title: `Reached ${formatCount(downloads)} downloads`,
    body: `"${file.title}" has now been downloaded ${formatCount(downloads)} times.`,
    fileId: file.id,
  });
}
