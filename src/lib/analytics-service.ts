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
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { ContentAnalytics } from "./models";

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

export interface ClickEvent {
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

// Generate a unique session ID
export const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export class AnalyticsService {
  // Track a click event
  static async trackClick(
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    sessionId: string,
    duration?: number,
    completionRate?: number
  ): Promise<void> {
    try {
      console.log(`Starting click tracking for ${contentId} (${contentType})`);
      
      // Create click event
      const clickEvent: Omit<ClickEvent, 'timestamp'> = {
        contentId,
        contentType,
        sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        ...(duration !== undefined && { duration }),
        ...(completionRate !== undefined && { completionRate }),
      };

      console.log('Adding click event to Firestore...');
      await addDoc(collection(db, "click-events"), {
        ...clickEvent,
        timestamp: serverTimestamp(),
      });
      console.log('Click event added successfully');

      // Update content analytics
      console.log('Updating content analytics...');
      await this.updateContentAnalytics(contentId, contentType, 'click');
      console.log('Content analytics updated successfully');
    } catch (error) {
      console.error("Error tracking click:", error);
      throw error; // Re-throw to let calling code handle it
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
    action: 'click' | 'share' | 'like' | 'unlike'
  ): Promise<void> {
    try {
      console.log(`Updating analytics for ${contentId}, action: ${action}`);
      const analyticsRef = doc(db, "content-analytics", contentId);
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        console.log(`Analytics document exists for ${contentId}, updating...`);
        // Update existing analytics
        const updates = {
          updatedAt: serverTimestamp(),
          ...(action === 'click' && { clicks: increment(1) }),
          ...(action === 'share' && { shares: increment(1) }),
          ...(action === 'like' && { likes: increment(1) }),
          ...(action === 'unlike' && { likes: increment(-1) }),
        };

        await updateDoc(analyticsRef, updates);
        console.log(`Analytics updated successfully for ${contentId}`);
      } else {
        console.log(`No analytics document exists for ${contentId}, creating new one...`);
        // Create new analytics document
        const initialAnalytics: ContentAnalytics = {
          contentId,
          contentType,
          clicks: action === 'click' ? 1 : 0,
          uniqueClicks: action === 'click' ? 1 : 0,
          shares: action === 'share' ? 1 : 0,
          likes: action === 'like' ? 1 : action === 'unlike' ? -1 : 0,
          comments: 0,
        };

        await setDoc(analyticsRef, {
          ...initialAnalytics,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`New analytics document created for ${contentId}`);
      }
    } catch (error) {
      console.error(`Error updating content analytics for ${contentId}:`, error);
      throw error; // Re-throw to let calling code handle it
    }
  }

  // Get analytics for a specific content item
  static async getContentAnalytics(
    contentId: string
  ): Promise<ContentAnalytics | null> {
    try {
      console.log(`Attempting to fetch analytics for content: ${contentId}`);
      const analyticsRef = doc(db, "content-analytics", contentId);
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        const data = analyticsDoc.data();
        console.log(`Found analytics data for ${contentId}:`, data);
        return {
          ...data,
          contentId: analyticsDoc.id,
        } as ContentAnalytics;
      }

      console.log(`No analytics document found for ${contentId}`);
      return null;
    } catch (error) {
      console.error(`Error fetching content analytics for ${contentId}:`, error);
      return null;
    }
  }

  // Get top performing content
  static async getTopContent(
    contentType: 'article' | 'video' | 'research' | 'legal',
    metric: 'clicks' | 'shares' | 'likes' | 'comments',
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
    totalClicks: number;
    totalShares: number;
    totalLikes: number;
    totalComments: number;
    topContent: ContentAnalytics[];
    recentActivity: Array<{type: string; contentId: string; contentType: string; timestamp: Date; platform?: string}>;
  }> {
    try {
      const analyticsQuery = collection(db, "content-analytics");
      const querySnapshot = await getDocs(analyticsQuery);

      let totalClicks = 0;
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

        totalClicks += analytics.clicks || 0;
        totalShares += analytics.shares || 0;
        totalLikes += analytics.likes || 0;
        totalComments += analytics.comments || 0;
        allAnalytics.push(analytics);
      });

      // Get top content by clicks
      const topContent = allAnalytics
        .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
        .slice(0, 5);

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentActivity = await this.getRecentActivity(sevenDaysAgo);

      return {
        totalClicks,
        totalShares,
        totalLikes,
        totalComments,
        topContent,
        recentActivity,
      };
    } catch (error) {
      console.error("Error fetching analytics summary:", error);
      return {
        totalClicks: 0,
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

      // Get recent clicks
      const clicksQuery = collection(db, "click-events");
      const clicksSnapshot = await getDocs(
        query(
          clicksQuery,
          where("timestamp", ">=", Timestamp.fromDate(since)),
          orderBy("timestamp", "desc"),
          firestoreLimit(20)
        )
      );

      clicksSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          type: 'click',
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

  // Legacy method for backward compatibility
  static async trackView(
    contentId: string,
    contentType: 'article' | 'video' | 'research' | 'legal',
    sessionId: string,
    duration?: number,
    completionRate?: number
  ): Promise<void> {
    // Redirect to trackClick for backward compatibility
    return this.trackClick(contentId, contentType, sessionId, duration, completionRate);
  }
} 