// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/login', 
        '/auth-test'
      ], // Memblokir bot dari area dashboard dan otentikasi
    },
    sitemap: 'https://himatknuklir.vercel.app/sitemap.xml',
  };
}