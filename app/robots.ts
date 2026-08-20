import type { MetadataRoute } from 'next';

const SITE = 'https://gwaa.or.kr';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
