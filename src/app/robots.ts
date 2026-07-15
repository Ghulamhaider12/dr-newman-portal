import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/site';

/**
 * Serves /robots.txt. Allows crawling of the public site, keeps crawlers out of
 * the admin panel and API, and points them at the sitemap on the real domain.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  };
}
