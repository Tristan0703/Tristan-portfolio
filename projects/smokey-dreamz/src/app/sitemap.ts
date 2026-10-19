import { MetadataRoute } from 'next';
import { branches } from '@/components/branches/branchData';

const BASE_URL = 'https://smokey-dreamz.co.za';

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/menu`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/locations`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  const branchRoutes = Object.values(branches)
    .filter((b) => b.hasPage)
    .map((b) => {
      const slug = b.id === 'randpark' ? 'randpark-ridge' : b.id;
      return {
        url: `${BASE_URL}/locations/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      };
    });

  return [...publicRoutes, ...branchRoutes];
}
