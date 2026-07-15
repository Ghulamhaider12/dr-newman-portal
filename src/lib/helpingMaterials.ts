import { detectFileType } from '@/lib/fileType';
import type { FileType, Prisma } from '@prisma/client';

/** Raw helping-material entry as sent from the admin form. */
type HelpingMaterialInput = {
  title?: string;
  filename?: string;
  storageKey?: string;
  fileSize?: unknown;
};

/**
 * Validate + normalize helping-material entries into Prisma nested-create rows.
 * Drops any entry without an uploaded object or a detectable file type, so the
 * caller can pass the raw form array straight through.
 */
export function mapHelpingMaterials(
  input: unknown
): Prisma.HelpingMaterialCreateWithoutFileInput[] {
  if (!Array.isArray(input)) return [];

  const rows: Prisma.HelpingMaterialCreateWithoutFileInput[] = [];
  for (const raw of input as HelpingMaterialInput[]) {
    const storageKey = (raw?.storageKey ?? '').trim();
    if (!storageKey) continue;
    const filename = (raw?.filename ?? '').trim();
    const fileType = detectFileType(filename || storageKey) as FileType | null;
    if (!fileType) continue;

    rows.push({
      title: (raw?.title ?? '').trim(),
      filename,
      storageKey,
      fileType,
      fileSize: Number(raw?.fileSize) || 0,
      position: rows.length,
    });
  }
  return rows;
}
