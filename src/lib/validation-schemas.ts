import { z } from 'zod';

// Article validation schema
export const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().min(1, "Excerpt is required").max(500, "Excerpt must be less than 500 characters"),
  category: z.enum(['campus', 'sports', 'student-government', 'san-diego', 'california', 'national']),
  section: z.enum(['campus', 'sports', 'student-government', 'san-diego', 'california', 'national']),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

// Comment validation schema
export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment must be less than 1000 characters"),
  contentType: z.enum(['article', 'video', 'research', 'legal']),
  contentId: z.string().min(1, "Content ID is required"),
  parentId: z.string().optional(),
});

// User profile validation schema
export const userProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  department: z.string().max(100, "Department must be less than 100 characters").optional(),
});

// Search query validation schema
export const searchQuerySchema = z.object({
  query: z.string().min(1, "Search query is required").max(100, "Search query must be less than 100 characters"),
  filters: z.object({
    dateRange: z.enum(['today', 'week', 'month', 'year']).optional(),
    category: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    popularity: z.enum(['most-liked', 'most-viewed', 'recent']).optional(),
    contentType: z.enum(['article', 'video', 'research', 'legal']).optional(),
  }).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Rate limiting validation schema
export const rateLimitSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  action: z.string().min(1, "Action is required"),
  limit: z.number().min(1, "Limit must be at least 1"),
  windowMs: z.number().min(1000, "Window must be at least 1000ms"),
});

// Export types for use in components
export type ArticleInput = z.infer<typeof articleSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type RateLimitInput = z.infer<typeof rateLimitSchema>; 