import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/login', '/member', '/client/'],
    },
    sitemap: 'https://www.bengkellasbandungbarat.com/sitemap.xml',
  };
}
