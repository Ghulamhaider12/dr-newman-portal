import { prisma } from '@/lib/prisma';

export const SETTING_KEYS = [
  'hero_title',
  'welcome',
  'about',
  'copyright',
  'commercial',
  'privacy',
  'background_photo',
  'recent_background_photo',
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const SETTING_DEFAULTS: Record<SettingKey, string> = {
  hero_title: 'Medicine, art, and a life of inquiry',
  welcome:
    "A personal archive of Dr. Newman's research, lectures, recordings, and writing — freely available to browse and download.",
  about:
    'Dr. A. Newman is a physician and researcher who has spent a career at the meeting point of medicine, art, and the written word. This portal is a personal library — a place to share research papers, lectures, recordings, and writing with students, colleagues, and anyone curious.\n\nEverything here is offered freely for educational and non-commercial use. If a piece is useful to you, please cite Dr. A. Newman and do not redistribute it without permission.',
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
