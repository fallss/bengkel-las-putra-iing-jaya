import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.bengkellasbandungbarat.com';

  const routes = [
    '',
    '/tentang-kami',
    '/layanan',
    '/galeri',
    '/artikel',
    '/kontak',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}
