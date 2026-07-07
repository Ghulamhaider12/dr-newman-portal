import { prisma } from '@/lib/prisma';

export const SETTING_KEYS = [
  'welcome',
  'copyright',
  'commercial',
  'privacy',
  'background_photo',
  'recent_background_photo',
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const SETTING_DEFAULTS: Record<SettingKey, string> = {
  welcome:
    "A personal archive of Dr. Newman's research, lectures, recordings, and writing — freely available to browse and download.",
  copyright:
    '© Dr. A. Newman. Shared for educational and non-commercial use. Please cite Dr. A. Newman and do not redistribute without permission.',
  commercial:
    'Shared for educational and non-commercial use. Please cite Dr. A. Newman and do not redistribute without permission.',
  privacy: 'Your email is used only to follow up on your comment and is never published or shared.',
  background_photo: '',
  recent_background_photo: '',
};

export async function getSettings(): Promise<Record<SettingKey, string>> {
  // During build without DATABASE_URL, return defaults
  if (!process.env.DATABASE_URL) {
    return { ...SETTING_DEFAULTS };
  }

  try {
    const rows = await prisma.siteSetting.findMany();
    const map = new Map(rows.map((r) => [r.key, r.value]));
    const out = {} as Record<SettingKey, string>;
    for (const key of SETTING_KEYS) {
      out[key] = map.get(key) ?? SETTING_DEFAULTS[key];
    }
    return out;
  } catch {
    // Fallback to defaults on any DB error
    return { ...SETTING_DEFAULTS };
  }
}
