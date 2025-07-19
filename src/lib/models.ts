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
  likes: number;
  likedBy: string[]; // Array of user IDs who liked this content
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

// Enhanced User Profile model
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'viewer';
  bio?: string;
  profileImage?: string;
  department?: string;
  major?: string;
  graduationYear?: string;
  joinedAt: Date;
  updatedAt: Date;
  
  // Social features
  followers: string[]; // Array of user IDs following this user
  following: string[]; // Array of user IDs this user is following
  followingTopics: string[]; // Array of topics/departments this user follows
  followingAuthors: string[]; // Array of author IDs this user follows
  
  // Reading preferences
  readingHistory: Array<{
    contentId: string;
    contentType: 'article' | 'video' | 'research' | 'legal';
    readAt: Date;
    readTime?: number; // Time spent reading in seconds
  }>;
  
  // Content authored
  authoredContent: Array<{
    contentId: string;
    contentType: 'article' | 'video' | 'research' | 'legal';
    title: string;
    publishedAt: Date;
  }>;
  
  // Preferences
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newsletterSubscription: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
  
  // Statistics
  stats: {
    totalArticles: number;
    totalViews: number;
    totalLikes: number;
    totalFollowers: number;
    totalFollowing: number;
  };
}

// Follow model for tracking follows
export interface Follow {
  id: string;
  followerId: string; // User who is following
  followingId: string; // User being followed
  followType: 'user' | 'topic' | 'department';
  createdAt: Date;
}

// Enhanced Comment model with threading
export interface Comment {
  id: string;
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
  authorId: string;
  authorName: string;
  authorProfileImage?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  
  // Threading support
  parentId?: string; // ID of parent comment for replies
  replies: string[]; // Array of reply comment IDs
  depth: number; // Nesting level (0 for top-level comments)
  
  // Engagement
  likes: number;
  likedBy: string[]; // Array of user IDs who liked this comment
  
  // Moderation
  isEdited: boolean;
  editHistory?: Array<{
    content: string;
    editedAt: Date;
  }>;
}

// Search Query model for analytics
export interface SearchQuery {
  id: string;
  query: string;
  userId?: string;
  timestamp: Date;
  resultsCount: number;
  clickedResult?: string;
  filters?: {
    dateRange?: string;
    category?: string;
    author?: string;
    tags?: string[];
    popularity?: string;
  };
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

// News Ticker model for breaking news
export interface NewsTicker {
  id: string;
  text: string;
  priority: 'low' | 'medium' | 'high' | 'breaking';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  link?: string;
}

export interface SportBanner {
  id: string;
  isEnabled: boolean;
  sport: 'basketball' | 'soccer' | 'baseball' | 'fencing' | 'tennis';
  homeTeamId: string; // Team ID from teams-config
  awayTeamId: string; // Team ID from teams-config
  homeScore: number;
  awayScore: number;
  gameStatus: 'scheduled' | 'live' | 'halftime' | 'final' | 'postponed';
  gameTime: string; // "7:30 PM" or "Q3 8:45" or "2nd Half 67'" etc.
  venue: string;
  date: Date;
  period?: string; // "Q1", "Q2", "Halftime", "2nd Half", etc.
  timeRemaining?: string; // "8:45", "67'", "15:30", etc.
  substitutions?: Substitution[];
  highlights?: GameHighlight[];
  lastUpdated: Date;
  createdBy: string;
  updatedBy: string;
}

export interface Substitution {
  id: string;
  playerOut: string;
  playerIn: string;
  minute: string;
  team: 'home' | 'away';
}

export interface GameHighlight {
  id: string;
  type: 'goal' | 'basket' | 'run' | 'point' | 'foul' | 'card';
  player: string;
  team: 'home' | 'away';
  minute: string;
  description: string;
}

export interface SportBannerSettings {
  id: string;
  isEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  showSubstitutions: boolean;
  showHighlights: boolean;
  bannerStyle: 'minimal' | 'detailed' | 'full';
  lastUpdated: Date;
}
