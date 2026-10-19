import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/menu', '/locations', '/feed'],
        disallow: [
          '/membership',
          '/membership/card',
          '/membership/edit',
          '/staff',
          '/admin',
          '/api',
          '/verify',
          '/welcome',
        ],
      },
    ],
    sitemap: 'https://smokey-dreamz.co.za/sitemap.xml',
  };
}
