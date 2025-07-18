"use client";

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { ContentAnalytics } from "./models";

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

export interface ViewEvent {
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
  userId?: string;
  sessionId: string;
  userAgent: string;
  referrer: string;
  timestamp: Date;
  duration?: number; // For videos
  completionRate?: number; // For videos
}

export interface ShareEvent {
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
  userId?: string;
  platform: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy';
  timestamp: Date;
}

export interface LikeEvent {
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
  userId: string;
  action: 'like' | 'unlike';
  timestamp: Date;
}

export class AnalyticsService {
  // Track a view event
  static async trackView(
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    sessionId: string,
    duration?: number,
    completionRate?: number
  ): Promise<void> {
    try {
      // Create view event
      const viewEvent: Omit<ViewEvent, 'timestamp'> = {
        contentId,
        contentType,
        sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        ...(duration !== undefined && { duration }),
        ...(completionRate !== undefined && { completionRate }),
      };

      await addDoc(collection(db, "view-events"), {
        ...viewEvent,
        timestamp: serverTimestamp(),
      });

      // Update content analytics
      await this.updateContentAnalytics(contentId, contentType, 'view');
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  }

  // Track a share event
  static async trackShare(
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    platform: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy'
  ): Promise<void> {
    try {
      const shareEvent: Omit<ShareEvent, 'timestamp'> = {
        contentId,
        contentType,
        platform,
      };

      await addDoc(collection(db, "share-events"), {
        ...shareEvent,
        timestamp: serverTimestamp(),
      });

      // Update content analytics
      await this.updateContentAnalytics(contentId, contentType, 'share');
    } catch (error) {
      console.error("Error tracking share:", error);
    }
  }

  // Track a like event
  static async trackLike(
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    userId: string,
    action: 'like' | 'unlike'
  ): Promise<void> {
    try {
      const likeEvent: Omit<LikeEvent, 'timestamp'> = {
        contentId,
        contentType,
        userId,
        action,
      };

      await addDoc(collection(db, "like-events"), {
        ...likeEvent,
        timestamp: serverTimestamp(),
      });

      // Update content analytics
      await this.updateContentAnalytics(contentId, contentType, action);
    } catch (error) {
      console.error("Error tracking like:", error);
    }
  }

  // Update content analytics
  private static async updateContentAnalytics(
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    action: 'view' | 'share' | 'like' | 'unlike'
  ): Promise<void> {
    try {
      const analyticsRef = doc(db, "content-analytics", contentId);
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        // Update existing analytics
        const updates: Record<string, any> = {
          updatedAt: serverTimestamp(),
        };

        switch (action) {
          case 'view':
            updates.views = increment(1);
            break;
          case 'share':
            updates.shares = increment(1);
            break;
          case 'like':
            updates.likes = increment(1);
            break;
          case 'unlike':
            updates.likes = increment(-1);
            break;
        }

        await updateDoc(analyticsRef, updates);
      } else {
        // Create new analytics document
        const initialAnalytics: ContentAnalytics = {
          contentId,
          contentType,
          views: action === 'view' ? 1 : 0,
          uniqueViews: action === 'view' ? 1 : 0,
          shares: action === 'share' ? 1 : 0,
          likes: action === 'like' ? 1 : action === 'unlike' ? -1 : 0,
          comments: 0,
        };

        await updateDoc(analyticsRef, {
          ...initialAnalytics,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error updating content analytics:", error);
    }
  }

  // Get analytics for a specific content item
  static async getContentAnalytics(
    contentId: string
  ): Promise<ContentAnalytics | null> {
    try {
      const analyticsRef = doc(db, "content-analytics", contentId);
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        const data = analyticsDoc.data();
        return {
          ...data,
          contentId: analyticsDoc.id,
        } as ContentAnalytics;
      }

      return null;
    } catch (error) {
      console.error("Error fetching content analytics:", error);
      return null;
    }
  }

  // Get analytics for multiple content items
  static async getMultipleContentAnalytics(
    contentIds: string[]
  ): Promise<ContentAnalytics[]> {
    try {
      const analytics: ContentAnalytics[] = [];

      for (const contentId of contentIds) {
        const contentAnalytics = await this.getContentAnalytics(contentId);
        if (contentAnalytics) {
          analytics.push(contentAnalytics);
        }
      }

      return analytics;
    } catch (error) {
      console.error("Error fetching multiple content analytics:", error);
      return [];
    }
  }

  // Get top performing content
  static async getTopContent(
    contentType: 'article' | 'video' | 'research' | 'legal',
    metric: 'views' | 'shares' | 'likes' | 'comments',
    limit: number = 10
  ): Promise<ContentAnalytics[]> {
    try {
      const analyticsQuery = collection(db, "content-analytics");
      const q = query(
        analyticsQuery,
        where("contentType", "==", contentType),
        orderBy(metric, "desc"),
        firestoreLimit(limit)
      );

      const querySnapshot = await getDocs(q);
      const analytics: ContentAnalytics[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        analytics.push({
          ...data,
          contentId: doc.id,
        } as ContentAnalytics);
      });

      return analytics;
    } catch (error) {
      console.error("Error fetching top content:", error);
      return [];
    }
  }

  // Get analytics summary for admin dashboard
  static async getAnalyticsSummary(): Promise<{
    totalViews: number;
    totalShares: number;
    totalLikes: number;
    totalComments: number;
    topContent: ContentAnalytics[];
    recentActivity: Array<{type: string; contentId: string; contentType: string; timestamp: Date; platform?: string}>;
  }> {
    try {
      const analyticsQuery = collection(db, "content-analytics");
      const querySnapshot = await getDocs(analyticsQuery);

      let totalViews = 0;
      let totalShares = 0;
      let totalLikes = 0;
      let totalComments = 0;
      const allAnalytics: ContentAnalytics[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const analytics = {
          ...data,
          contentId: doc.id,
        } as ContentAnalytics;

        totalViews += analytics.views || 0;
        totalShares += analytics.shares || 0;
        totalLikes += analytics.likes || 0;
        totalComments += analytics.comments || 0;
        allAnalytics.push(analytics);
      });

      // Get top content by views
      const topContent = allAnalytics
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentActivity = await this.getRecentActivity(sevenDaysAgo);

      return {
        totalViews,
        totalShares,
        totalLikes,
        totalComments,
        topContent,
        recentActivity,
      };
    } catch (error) {
      console.error("Error fetching analytics summary:", error);
      return {
        totalViews: 0,
        totalShares: 0,
        totalLikes: 0,
        totalComments: 0,
        topContent: [],
        recentActivity: [],
      };
    }
  }

  // Get recent activity
  private static async getRecentActivity(since: Date): Promise<Array<{type: string; contentId: string; contentType: string; timestamp: Date; platform?: string}>> {
    try {
      const activities: Array<{type: string; contentId: string; contentType: string; timestamp: Date; platform?: string}> = [];

      // Get recent views
      const viewsQuery = collection(db, "view-events");
      const viewsSnapshot = await getDocs(
        query(
          viewsQuery,
          where("timestamp", ">=", Timestamp.fromDate(since)),
          orderBy("timestamp", "desc"),
          firestoreLimit(20)
        )
      );

      viewsSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          type: 'view',
          contentId: data.contentId,
          contentType: data.contentType,
          timestamp: convertTimestampToDate(data.timestamp),
        });
      });

      // Get recent shares
      const sharesQuery = collection(db, "share-events");
      const sharesSnapshot = await getDocs(
        query(
          sharesQuery,
          where("timestamp", ">=", Timestamp.fromDate(since)),
          orderBy("timestamp", "desc"),
          firestoreLimit(20)
        )
      );

      sharesSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          type: 'share',
          contentId: data.contentId,
          contentType: data.contentType,
          platform: data.platform,
          timestamp: convertTimestampToDate(data.timestamp),
        });
      });

      // Sort by timestamp and return top 20
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return [];
    }
  }

  // Generate session ID
  static generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
} 