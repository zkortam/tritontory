import { MetadataRoute } from 'next';
import { SEOService } from '@/lib/seo-service';
import { 
  ArticleService, 
  VideoService, 
  ResearchService, 
  LegalService 
} from '@/lib/firebase-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all content for sitemap
    const [articles, videos, research, legal] = await Promise.all([
      ArticleService.getAllArticles(),
      VideoService.getAllVideos(),
      ResearchService.getAllResearchArticles(),
      LegalService.getAllLegalArticles(),
    ]);

    // Prepare content data for sitemap
    const contentData = [
      ...articles.map(article => ({
        id: article.id,
        updatedAt: article.updatedAt,
        type: 'article' as const,
      })),
      ...videos.map(video => ({
        id: video.id,
        updatedAt: video.updatedAt,
        type: 'video' as const,
      })),
      ...research.map(research => ({
        id: research.id,
        updatedAt: research.updatedAt,
        type: 'research' as const,
      })),
      ...legal.map(legal => ({
        id: legal.id,
        updatedAt: legal.updatedAt,
        type: 'legal' as const,
      })),
    ];

    // Generate sitemap data
    return SEOService.generateSitemapData(contentData);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return basic sitemap if content fetch fails
    return [
      {
        url: 'https://tritontory.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: 'https://tritontory.com/triton-tory',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: 'https://tritontory.com/triton-today',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: 'https://tritontory.com/triton-science',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: 'https://tritontory.com/triton-law',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];
  }
} 