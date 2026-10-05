// app/sitemap.ts
import { MetadataRoute } from 'next';
// Nanti import fungsi fetch kamu di sini, misal: import { getNews } from '@/lib/api/news'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://himatknuklir.vercel.app';

  // Contoh rute statis
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tentang`, // Jika ada halaman tentang
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // NANTI: Contoh fetch dinamis untuk artikel/berita
  // const news = await getNews();
  // const newsRoutes = news.map((post) => ({
  //   url: `${baseUrl}/berita/${post.slug}`,
  //   lastModified: new Date(post.updatedAt),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.7,
  // }));

  return [...staticRoutes /*, ...newsRoutes */];
}