"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy, limit as firestoreLimit } from "firebase/firestore";
import { db } from "./firebase";
import { Article, Video, Research, LegalArticle } from "./models";

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: any): Date => {
  return timestamp.toDate();
};

// Real-time hook for articles
export function useRealtimeArticles(
  categoryFilter?: string,
  sectionFilter?: string,
  featuredOnly: boolean = false,
  limitCount: number = 10
) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const articlesQuery = collection(db, "articles");
    const queryConstraints = [];

    if (categoryFilter) {
      queryConstraints.push(where("category", "==", categoryFilter));
    }

    if (sectionFilter) {
      queryConstraints.push(where("section", "==", sectionFilter));
    }

    if (featuredOnly) {
      queryConstraints.push(where("featured", "==", true));
    }

    // Only show published articles
    queryConstraints.push(where("status", "==", "published"));

    // Order by published date
    queryConstraints.push(orderBy("publishedAt", "desc"));

    // Limit results
    queryConstraints.push(firestoreLimit(limitCount));

    const q = query(articlesQuery, ...queryConstraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const articlesData: Article[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          articlesData.push({
            ...data,
            id: doc.id,
            publishedAt: convertTimestampToDate(data.publishedAt),
            updatedAt: convertTimestampToDate(data.updatedAt),
          } as Article);
        });
        setArticles(articlesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching articles:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categoryFilter, sectionFilter, featuredOnly, limitCount]);

  return { articles, loading, error };
}

// Real-time hook for videos
export function useRealtimeVideos(
  categoryFilter?: string,
  featuredOnly: boolean = false,
  limitCount: number = 10
) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const videosQuery = collection(db, "videos");
    const queryConstraints = [];

    if (categoryFilter) {
      queryConstraints.push(where("category", "==", categoryFilter));
    }

    if (featuredOnly) {
      queryConstraints.push(where("featured", "==", true));
    }

    // Only show published videos
    queryConstraints.push(where("status", "==", "published"));

    // Order by published date
    queryConstraints.push(orderBy("publishedAt", "desc"));

    // Limit results
    queryConstraints.push(firestoreLimit(limitCount));

    const q = query(videosQuery, ...queryConstraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const videosData: Video[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          videosData.push({
            ...data,
            id: doc.id,
            publishedAt: convertTimestampToDate(data.publishedAt),
            updatedAt: convertTimestampToDate(data.updatedAt),
          } as Video);
        });
        setVideos(videosData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching videos:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categoryFilter, featuredOnly, limitCount]);

  return { videos, loading, error };
}

// Real-time hook for research articles
export function useRealtimeResearch(
  departmentFilter?: string,
  featuredOnly: boolean = false,
  limitCount: number = 10
) {
  const [research, setResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const researchQuery = collection(db, "research");
    const queryConstraints = [];

    if (departmentFilter) {
      queryConstraints.push(where("department", "==", departmentFilter));
    }

    if (featuredOnly) {
      queryConstraints.push(where("featured", "==", true));
    }

    // Only show published research
    queryConstraints.push(where("status", "==", "published"));

    // Order by published date
    queryConstraints.push(orderBy("publishedAt", "desc"));

    // Limit results
    queryConstraints.push(firestoreLimit(limitCount));

    const q = query(researchQuery, ...queryConstraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const researchData: Research[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          researchData.push({
            ...data,
            id: doc.id,
            publishedAt: convertTimestampToDate(data.publishedAt),
            updatedAt: convertTimestampToDate(data.updatedAt),
          } as Research);
        });
        setResearch(researchData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching research:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [departmentFilter, featuredOnly, limitCount]);

  return { research, loading, error };
}

// Real-time hook for legal articles
export function useRealtimeLegal(
  categoryFilter?: string,
  featuredOnly: boolean = false,
  limitCount: number = 10
) {
  const [legalArticles, setLegalArticles] = useState<LegalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const legalQuery = collection(db, "legal-articles");
    const queryConstraints = [];

    if (categoryFilter) {
      queryConstraints.push(where("category", "==", categoryFilter));
    }

    if (featuredOnly) {
      queryConstraints.push(where("featured", "==", true));
    }

    // Only show published legal articles
    queryConstraints.push(where("status", "==", "published"));

    // Order by published date
    queryConstraints.push(orderBy("publishedAt", "desc"));

    // Limit results
    queryConstraints.push(firestoreLimit(limitCount));

    const q = query(legalQuery, ...queryConstraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const legalData: LegalArticle[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          legalData.push({
            ...data,
            id: doc.id,
            publishedAt: convertTimestampToDate(data.publishedAt),
            updatedAt: convertTimestampToDate(data.updatedAt),
          } as LegalArticle);
        });
        setLegalArticles(legalData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching legal articles:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categoryFilter, featuredOnly, limitCount]);

  return { legalArticles, loading, error };
} 