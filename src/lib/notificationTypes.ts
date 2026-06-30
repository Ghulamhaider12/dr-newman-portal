import type { NotificationType } from '@prisma/client';

/** Notification as sent to the client (dates serialised to ISO strings). */
export type NotificationDTO = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  fileTitle: string | null;
  isRead: boolean;
  isFavourite: boolean;
  createdAt: string;
};

/** Order used by the "Sort: By type" option and any grouped display. */
export const NOTIF_TYPE_ORDER: NotificationType[] = [
  'COMMENT',
  'DOWNLOAD',
  'UPLOAD',
  'MODERATION',
  'SYSTEM',
  'OTHER',
];
