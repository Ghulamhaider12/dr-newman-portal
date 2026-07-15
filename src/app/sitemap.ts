import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_ORIGIN } from '@/lib/site';

// Rebuild the sitemap on each request so newly added library files appear
// promptly (the site is DB-driven and already renders dynamically).
export const dynamic = 'force-dynamic';

/**
 * Serves /sitemap.xml on the real domain. Lists the static public pages plus
 * every library file, giving search engines a clean map of advice4docs.com so
 * they crawl and index the canonical site (not a proxy mirror).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const files = await prisma.file
    .findMany({ select: { id: true, dateUploaded: true } })
    .catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_ORIGIN}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_ORIGIN}/library`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_ORIGIN}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_ORIGIN}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const fileRoutes: MetadataRoute.Sitemap = files.map((f) => ({
    url: `${SITE_ORIGIN}/library/${f.id}`,
    lastModified: f.dateUploaded,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...fileRoutes];
}
