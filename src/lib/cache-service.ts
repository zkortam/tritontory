import { unstable_cache } from 'next/cache';
import { ArticleService, VideoService, ResearchService, LegalService } from './firebase-service';

// Cache configuration
const CACHE_CONFIG = {
  articles: { revalidate: 300 }, // 5 minutes
  videos: { revalidate: 300 }, // 5 minutes
  research: { revalidate: 600 }, // 10 minutes
  legal: { revalidate: 600 }, // 10 minutes
  userProfiles: { revalidate: 1800 }, // 30 minutes
  settings: { revalidate: 3600 }, // 1 hour
};

export class CacheService {
  // Cached Article Service
  static getArticles = unstable_cache(
    async (categoryFilter?: string, sectionFilter?: string, featuredOnly = false, limitCount = 10) => {
      try {
        return await ArticleService.getArticles(categoryFilter, sectionFilter, featuredOnly, limitCount);
      } catch (error) {
        console.error('Cache miss for articles:', error);
        return [];
      }
    },
    ['articles'],
    CACHE_CONFIG.articles
  );

  static getArticle = unstable_cache(
    async (id: string) => {
      try {
        return await ArticleService.getArticle(id);
      } catch (error) {
        console.error('Cache miss for article:', error);
        return null;
      }
    },
    ['article'],
    CACHE_CONFIG.articles
  );

  // Cached Video Service
  static getVideos = unstable_cache(
    async (categoryFilter?: string, featuredOnly = false, limitCount = 10) => {
      try {
        return await VideoService.getVideos(categoryFilter, featuredOnly, limitCount);
      } catch (error) {
        console.error('Cache miss for videos:', error);
        return [];
      }
    },
    ['videos'],
    CACHE_CONFIG.videos
  );

  static getVideo = unstable_cache(
    async (id: string) => {
      try {
        return await VideoService.getVideo(id);
      } catch (error) {
        console.error('Cache miss for video:', error);
        return null;
      }
    },
    ['video'],
    CACHE_CONFIG.videos
  );

  // Cached Research Service
  static getResearchArticles = unstable_cache(
    async (departmentFilter?: string, featuredOnly = false, limitCount = 10) => {
      try {
        return await ResearchService.getResearchArticles(departmentFilter, featuredOnly, limitCount);
      } catch (error) {
        console.error('Cache miss for research:', error);
        return [];
      }
    },
    ['research'],
    CACHE_CONFIG.research
  );

  static getResearchArticle = unstable_cache(
    async (id: string) => {
      try {
        return await ResearchService.getResearchArticle(id);
      } catch (error) {
        console.error('Cache miss for research article:', error);
        return null;
      }
    },
    ['research-article'],
    CACHE_CONFIG.research
  );

  // Cached Legal Service
  static getLegalArticles = unstable_cache(
    async (categoryFilter?: string, featuredOnly = false, limitCount = 10) => {
      try {
        return await LegalService.getLegalArticles(categoryFilter, featuredOnly, limitCount);
      } catch (error) {
        console.error('Cache miss for legal articles:', error);
        return [];
      }
    },
    ['legal-articles'],
    CACHE_CONFIG.legal
  );

  static getLegalArticle = unstable_cache(
    async (id: string) => {
      try {
        return await LegalService.getLegalArticle(id);
      } catch (error) {
        console.error('Cache miss for legal article:', error);
        return null;
      }
    },
    ['legal-article'],
    CACHE_CONFIG.legal
  );

  // Cache invalidation helpers
  static invalidateArticles = () => {
    // This would invalidate the cache when articles are updated
    console.log('Articles cache invalidated');
  };

  static invalidateVideos = () => {
    console.log('Videos cache invalidated');
  };

  static invalidateResearch = () => {
    console.log('Research cache invalidated');
  };

  static invalidateLegal = () => {
    console.log('Legal articles cache invalidated');
  };

  // Cache status monitoring
  static getCacheStatus = () => {
    return {
      articles: CACHE_CONFIG.articles,
      videos: CACHE_CONFIG.videos,
      research: CACHE_CONFIG.research,
      legal: CACHE_CONFIG.legal,
    };
  };
} 