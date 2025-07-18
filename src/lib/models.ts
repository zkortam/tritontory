// Base content model with common fields
export interface BaseContent {
  id: string;
  title: string;
  publishedAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
}

// Article model for Triton Tory news
export interface Article extends BaseContent {
  content: string; // Rich text content
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  section: 'campus' | 'sports' | 'student-government' | 'san-diego' | 'california' | 'national';
}

// Video model for Triton Today
export interface Video extends BaseContent {
  description: string;
  duration: number; // in seconds
  videoUrl: string;
  thumbnailUrl: string;
  views: number;
  category: string;
  tags: string[];
}

// Research article model for Science Journal
export interface Research extends BaseContent {
  abstract: string;
  content: string; // Rich text content
  coverImage: string;
  department: string;
  contributors: string[];
  references: string[];
  tags: string[];
}

// Legal article model for Law Review
export interface LegalArticle extends BaseContent {
  abstract: string;
  content: string; // Rich text content
  coverImage: string;
  category: string;
  citations: string[];
  tags: string[];
}

// User model
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'viewer';
  bio?: string;
  profileImage?: string;
  department?: string;
  joinedAt: Date;
}

// Comment model
export interface Comment {
  id: string;
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

// Analytics model for content performance
export interface ContentAnalytics {
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
  views: number;
  uniqueViews: number;
  shares: number;
  likes: number;
  comments: number;
  averageReadTime?: number; // Not applicable for videos
  completionRate?: number; // For videos only
}

// Settings model for admin configuration
export interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maxFileSize: string;
  enableComments: boolean;
  requireApproval: boolean;
  autoPublish: boolean;
  newContentAlerts: boolean;
  errorNotifications: boolean;
  weeklyReports: boolean;
  version: string;
  lastUpdated: Date;
  status: string;
}
