import { articleSchema, commentSchema, userProfileSchema } from '../validation-schemas';

describe('Validation Schemas', () => {
  describe('articleSchema', () => {
    it('should validate a valid article', () => {
      const validArticle = {
        title: 'Test Article',
        content: 'This is a test article with sufficient content.',
        excerpt: 'A brief excerpt of the article.',
        category: 'campus',
        section: 'campus',
        tags: ['test', 'campus'],
        featured: false,
        status: 'draft'
      };

      const result = articleSchema.safeParse(validArticle);
      expect(result.success).toBe(true);
    });

    it('should reject an article with empty title', () => {
      const invalidArticle = {
        title: '',
        content: 'This is a test article with sufficient content.',
        excerpt: 'A brief excerpt of the article.',
        category: 'campus',
        section: 'campus'
      };

      const result = articleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });

    it('should reject an article with insufficient content', () => {
      const invalidArticle = {
        title: 'Test Article',
        content: 'Short',
        excerpt: 'A brief excerpt of the article.',
        category: 'campus',
        section: 'campus'
      };

      const result = articleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Content must be at least 10 characters');
      }
    });
  });

  describe('commentSchema', () => {
    it('should validate a valid comment', () => {
      const validComment = {
        content: 'This is a valid comment.',
        contentType: 'article',
        contentId: '123',
        parentId: '456'
      };

      const result = commentSchema.safeParse(validComment);
      expect(result.success).toBe(true);
    });

    it('should reject an empty comment', () => {
      const invalidComment = {
        content: '',
        contentType: 'article',
        contentId: '123'
      };

      const result = commentSchema.safeParse(invalidComment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Comment cannot be empty');
      }
    });
  });

  describe('userProfileSchema', () => {
    it('should validate a valid user profile', () => {
      const validProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        bio: 'A brief bio about the user.',
        department: 'Computer Science'
      };

      const result = userProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid email', () => {
      const invalidProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      };

      const result = userProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });
  });
}); 