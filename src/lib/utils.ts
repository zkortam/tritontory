import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate reading time in minutes based on word count
 * Uses standard reading speed of 200 words per minute
 * @param content - The text content to calculate reading time for
 * @returns Reading time in minutes (minimum 1 minute)
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  
  // Count words by splitting on whitespace and filtering out empty strings
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // Standard reading speed: 200 words per minute
  const readingSpeed = 200;
  const readingTime = Math.ceil(wordCount / readingSpeed);
  
  // Return minimum of 1 minute
  return Math.max(1, readingTime);
}

/**
 * Calculate reading time from word count
 * @param wordCount - Number of words
 * @returns Reading time in minutes (minimum 1 minute)
 */
export function calculateReadingTimeFromWordCount(wordCount: number): number {
  const readingSpeed = 200;
  const readingTime = Math.ceil(wordCount / readingSpeed);
  return Math.max(1, readingTime);
}
