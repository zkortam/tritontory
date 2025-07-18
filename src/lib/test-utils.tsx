
import { Article, Video, Research, LegalArticle, User, Comment, ContentAnalytics } from './models';

// Simple mock data generators
export const createMockArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 'test-article-1',
  title: 'Test Article Title',
  content: '<p>This is a test article content.</p>',
  excerpt: 'This is a test article excerpt.',
  authorId: 'test-author-1',
  authorName: 'Test Author',
  category: 'News',
  section: 'campus',
  tags: ['test', 'campus', 'news'],
  coverImage: 'https://example.com/test-image.jpg',
  featured: false,
  status: 'published',
  publishedAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockVideo = (overrides: Partial<Video> = {}): Video => ({
  id: 'test-video-1',
  title: 'Test Video Title',
  description: 'This is a test video description.',
  authorId: 'test-author-1',
  authorName: 'Test Author',
  category: 'News',
  tags: ['test', 'video', 'news'],
  videoUrl: 'https://example.com/test-video.mp4',
  thumbnailUrl: 'https://example.com/test-thumbnail.jpg',
  duration: 120,
  views: 0,
  featured: false,
  status: 'published',
  publishedAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockResearch = (overrides: Partial<Research> = {}): Research => ({
  id: 'test-research-1',
  title: 'Test Research Title',
  abstract: 'This is a test research abstract.',
  content: '<p>This is test research content.</p>',
  authorId: 'test-author-1',
  authorName: 'Test Author',
  department: 'Computer Science',
  tags: ['test', 'research', 'science'],
  coverImage: 'https://example.com/test-research.jpg',
  contributors: ['Test Contributor'],
  references: ['Test Reference'],
  featured: false,
  status: 'published',
  publishedAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockLegalArticle = (overrides: Partial<LegalArticle> = {}): LegalArticle => ({
  id: 'test-legal-1',
  title: 'Test Legal Article Title',
  abstract: 'This is a test legal article abstract.',
  content: '<p>This is test legal content.</p>',
  authorId: 'test-author-1',
  authorName: 'Test Author',
  category: 'Constitutional Law',
  tags: ['test', 'legal', 'constitutional'],
  coverImage: 'https://example.com/test-legal.jpg',
  citations: ['Test Citation'],
  featured: false,
  status: 'published',
  publishedAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'viewer',
  joinedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 'test-comment-1',
  contentId: 'test-article-1',
  contentType: 'article',
  content: 'This is a test comment.',
  authorId: 'test-user-1',
  authorName: 'Test User',
  status: 'approved',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockContentAnalytics = (overrides: Partial<ContentAnalytics> = {}): ContentAnalytics => ({
  contentId: 'test-article-1',
  contentType: 'article',
  views: 100,
  uniqueViews: 80,
  shares: 20,
  likes: 50,
  comments: 10,
  averageReadTime: 3,
  completionRate: 0.75,
  ...overrides,
});

// Test data sets
export const testArticles = [
  createMockArticle({ id: 'article-1', title: 'First Article', category: 'News' }),
  createMockArticle({ id: 'article-2', title: 'Second Article', category: 'Sports' }),
  createMockArticle({ id: 'article-3', title: 'Third Article', category: 'Politics' }),
];

export const testVideos = [
  createMockVideo({ id: 'video-1', title: 'First Video', category: 'News' }),
  createMockVideo({ id: 'video-2', title: 'Second Video', category: 'Sports' }),
  createMockVideo({ id: 'video-3', title: 'Third Video', category: 'Entertainment' }),
];

export const testResearch = [
  createMockResearch({ id: 'research-1', title: 'First Research', department: 'Computer Science' }),
  createMockResearch({ id: 'research-2', title: 'Second Research', department: 'Biology' }),
  createMockResearch({ id: 'research-3', title: 'Third Research', department: 'Physics' }),
];

export const testLegal = [
  createMockLegalArticle({ id: 'legal-1', title: 'First Legal', category: 'Constitutional Law' }),
  createMockLegalArticle({ id: 'legal-2', title: 'Second Legal', category: 'Criminal Law' }),
  createMockLegalArticle({ id: 'legal-3', title: 'Third Legal', category: 'Civil Law' }),
];

// Simple test utilities
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Mock service responses
export const mockServiceResponses = {
  articles: {
    getAll: [createMockArticle(), createMockArticle({ id: 'test-article-2', title: 'Second Test Article' })],
    getById: createMockArticle(),
    getByCategory: [createMockArticle()],
    getBySection: [createMockArticle()],
  },
  videos: {
    getAll: [createMockVideo(), createMockVideo({ id: 'test-video-2', title: 'Second Test Video' })],
    getById: createMockVideo(),
    getByCategory: [createMockVideo()],
  },
  research: {
    getAll: [createMockResearch(), createMockResearch({ id: 'test-research-2', title: 'Second Test Research' })],
    getById: createMockResearch(),
    getByDepartment: [createMockResearch()],
  },
  legal: {
    getAll: [createMockLegalArticle(), createMockLegalArticle({ id: 'test-legal-2', title: 'Second Test Legal' })],
    getById: createMockLegalArticle(),
    getByCategory: [createMockLegalArticle()],
  },
  comments: {
    getAll: [createMockComment(), createMockComment({ id: 'test-comment-2', content: 'Second test comment' })],
    getByContent: [createMockComment()],
  },
  analytics: {
    getContentAnalytics: createMockContentAnalytics(),
    getAnalyticsSummary: {
      totalViews: 1000,
      totalShares: 200,
      totalLikes: 500,
      totalComments: 100,
      topContent: [createMockContentAnalytics()],
      recentActivity: [],
    },
  },
}; 