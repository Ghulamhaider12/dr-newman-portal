import {
  MessageSquare,
  Download,
  Upload,
  CheckCircle2,
  Shield,
  Info,
  type LucideIcon,
} from 'lucide-react';
import type { NotificationType } from '@prisma/client';

/**
 * Per-type icon and colour treatment. Tints/foregrounds reuse the existing
 * design-system palette so the module reads as native. Do not invent new values.
 */
export const NOTIF_META: Record<
  NotificationType,
  { label: string; icon: LucideIcon; tint: string; fg: string }
> = {
  COMMENT: { label: 'Comment', icon: MessageSquare, tint: '#F6ECE0', fg: '#B87333' },
  DOWNLOAD: { label: 'Download', icon: Download, tint: '#E5F0F2', fg: '#4A90A4' },
  UPLOAD: { label: 'Upload', icon: Upload, tint: '#EBF3FA', fg: '#2C5F8A' },
  MODERATION: { label: 'Moderation', icon: CheckCircle2, tint: '#E7F1E8', fg: '#3A7D44' },
  SYSTEM: { label: 'System', icon: Shield, tint: '#F7F9FC', fg: '#5A6778' },
  OTHER: { label: 'Other', icon: Info, tint: '#F7F9FC', fg: '#5A6778' },
};
