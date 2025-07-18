"use client";

import {
  collection,
  getDocs,
  query as firestoreQuery,
  where,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "./firebase";
import { Article, Video, Research, LegalArticle } from "./models";

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: unknown): Date => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as {toDate: () => Date}).toDate === 'function') {
    return (timestamp as {toDate: () => Date}).toDate();
  }
  return new Date(timestamp as string | number | Date);
};

export interface SearchResult {
  id: string;
  type: 'article' | 'video' | 'research' | 'legal';
  title: string;
  excerpt?: string;
  description?: string;
  abstract?: string;
  category: string;
  publishedAt: Date;
  authorName: string;
  coverImage?: string;
  thumbnailUrl?: string;
  views?: number;
  department?: string;
}

export class SearchService {
  // Search across all content types
  static async searchAll(query: string, limit: number = 20): Promise<SearchResult[]> {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    const results: SearchResult[] = [];

    try {
      // Search articles
      const articlesQuery = collection(db, "articles");
      const articlesSnapshot = await getDocs(
        firestoreQuery(
          articlesQuery,
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          firestoreLimit(limit)
        )
      );

      articlesSnapshot.forEach((doc) => {
        const data = doc.data();
        const article = {
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
        } as Article;

        if (this.matchesSearch(article, searchTerm)) {
          results.push({
            id: article.id,
            type: 'article',
            title: article.title,
            excerpt: article.excerpt,
            category: article.category,
            publishedAt: article.publishedAt,
            authorName: article.authorName,
            coverImage: article.coverImage,
          });
        }
      });

      // Search videos
      const videosQuery = collection(db, "videos");
      const videosSnapshot = await getDocs(
        firestoreQuery(
          videosQuery,
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          firestoreLimit(limit)
        )
      );

      videosSnapshot.forEach((doc) => {
        const data = doc.data();
        const video = {
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
        } as Video;

        if (this.matchesSearch(video, searchTerm)) {
          results.push({
            id: video.id,
            type: 'video',
            title: video.title,
            description: video.description,
            category: video.category,
            publishedAt: video.publishedAt,
            authorName: video.authorName,
            thumbnailUrl: video.thumbnailUrl,
            views: video.views,
          });
        }
      });

      // Search research
      const researchQuery = collection(db, "research");
      const researchSnapshot = await getDocs(
        firestoreQuery(
          researchQuery,
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          firestoreLimit(limit)
        )
      );

      researchSnapshot.forEach((doc) => {
        const data = doc.data();
        const research = {
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
        } as Research;

        if (this.matchesSearch(research, searchTerm)) {
          results.push({
            id: research.id,
            type: 'research',
            title: research.title,
            abstract: research.abstract,
            category: research.department,
            publishedAt: research.publishedAt,
            authorName: research.authorName,
            coverImage: research.coverImage,
            department: research.department,
          });
        }
      });

      // Search legal articles
      const legalQuery = collection(db, "legal-articles");
      const legalSnapshot = await getDocs(
        firestoreQuery(
          legalQuery,
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          firestoreLimit(limit)
        )
      );

      legalSnapshot.forEach((doc) => {
        const data = doc.data();
        const legal = {
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
        } as LegalArticle;

        if (this.matchesSearch(legal, searchTerm)) {
          results.push({
            id: legal.id,
            type: 'legal',
            title: legal.title,
            abstract: legal.abstract,
            category: legal.category,
            publishedAt: legal.publishedAt,
            authorName: legal.authorName,
            coverImage: legal.coverImage,
          });
        }
      });

      // Sort results by relevance and date
      return this.sortByRelevance(results, searchTerm).slice(0, limit);

    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  // Search by content type
  static async searchByType(
    type: 'article' | 'video' | 'research' | 'legal',
    searchQuery: string,
    limit: number = 10
  ): Promise<SearchResult[]> {
    const searchTerm = searchQuery.toLowerCase().trim();
    if (!searchTerm) return [];

    const results: SearchResult[] = [];

    try {
      let collectionName: string;
      let categoryField: string;

      switch (type) {
        case 'article':
          collectionName = "articles";
          categoryField = "category";
          break;
        case 'video':
          collectionName = "videos";
          categoryField = "category";
          break;
        case 'research':
          collectionName = "research";
          categoryField = "department";
          break;
        case 'legal':
          collectionName = "legal-articles";
          categoryField = "category";
          break;
        default:
          return [];
      }

      const contentQuery = collection(db, collectionName);
      const snapshot = await getDocs(
        firestoreQuery(
          contentQuery,
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          firestoreLimit(limit * 2) // Get more to filter
        )
      );

      snapshot.forEach((doc) => {
        const data = doc.data();
        const content = {
          ...data,
          id: doc.id,
          publishedAt: convertTimestampToDate(data.publishedAt),
        } as Record<string, unknown>;

        if (this.matchesSearch(content, searchTerm)) {
          const result: SearchResult = {
            id: content.id as string,
            type,
            title: content.title as string,
            category: content[categoryField] as string,
            publishedAt: content.publishedAt as Date,
            authorName: content.authorName as string,
          };

          // Add type-specific fields
          if (type === 'article') {
            result.excerpt = content.excerpt as string | undefined;
            result.coverImage = content.coverImage as string | undefined;
          } else if (type === 'video') {
            result.description = content.description as string | undefined;
            result.thumbnailUrl = content.thumbnailUrl as string | undefined;
            result.views = content.views as number | undefined;
          } else if (type === 'research') {
            result.abstract = content.abstract as string | undefined;
            result.coverImage = content.coverImage as string | undefined;
            result.department = content.department as string | undefined;
          } else if (type === 'legal') {
            result.abstract = content.abstract as string | undefined;
            result.coverImage = content.coverImage as string | undefined;
          }

          results.push(result);
        }
      });

      return this.sortByRelevance(results, searchTerm).slice(0, limit);

    } catch (error) {
      console.error(`Search ${type} error:`, error);
      return [];
    }
  }

  // Check if content matches search term
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static matchesSearch(content: any, searchTerm: string): boolean {
    const searchableFields = [
      content.title?.toLowerCase(),
      content.excerpt?.toLowerCase(),
      content.description?.toLowerCase(),
      content.abstract?.toLowerCase(),
      content.category?.toLowerCase(),
      content.department?.toLowerCase(),
      content.authorName?.toLowerCase(),
      ...(content.tags || []).map((tag: string) => tag.toLowerCase()),
    ].filter(Boolean);

    return searchableFields.some(field => field.includes(searchTerm));
  }

  // Sort results by relevance (exact matches first, then partial matches)
  private static sortByRelevance(results: SearchResult[], searchTerm: string): SearchResult[] {
    return results.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
      const bTitleMatch = b.title.toLowerCase().includes(searchTerm);

      // Exact title matches first
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;

      // Then by date (newer first)
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });
  }

  // Get search suggestions based on popular content
  static async getSearchSuggestions(limit: number = 5): Promise<string[]> {
    try {
      const suggestions: string[] = [];
      
      // Get popular categories from articles
      const articlesQuery = collection(db, "articles");
      const articlesSnapshot = await getDocs(
        firestoreQuery(
          articlesQuery,
          where("status", "==", "published"),
          where("featured", "==", true),
          orderBy("publishedAt", "desc"),
          firestoreLimit(limit)
        )
      );

      articlesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category && !suggestions.includes(data.category)) {
          suggestions.push(data.category);
        }
      });

      // Get popular departments from research
      const researchQuery = collection(db, "research");
      const researchSnapshot = await getDocs(
        firestoreQuery(
          researchQuery,
          where("status", "==", "published"),
          where("featured", "==", true),
          orderBy("publishedAt", "desc"),
          firestoreLimit(limit)
        )
      );

      researchSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.department && !suggestions.includes(data.department)) {
          suggestions.push(data.department);
        }
      });

      return suggestions.slice(0, limit);

    } catch (error) {
      console.error("Error getting search suggestions:", error);
      return [];
    }
  }
} 