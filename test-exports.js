// Test file to verify Firebase service exports
const { ArticleService, VideoService, ResearchService, LegalService, UserService, TEST_EXPORT } = require('./src/lib/firebase-service.ts');

console.log('Testing Firebase service exports...');
console.log('TEST_EXPORT:', TEST_EXPORT);
console.log('ArticleService:', typeof ArticleService);
console.log('VideoService:', typeof VideoService);
console.log('ResearchService:', typeof ResearchService);
console.log('LegalService:', typeof LegalService);
console.log('UserService:', typeof UserService);

if (ArticleService && typeof ArticleService.getArticles === 'function') {
  console.log('✅ ArticleService.getArticles is a function');
} else {
  console.log('❌ ArticleService.getArticles is NOT a function');
}

if (VideoService && typeof VideoService.getVideos === 'function') {
  console.log('✅ VideoService.getVideos is a function');
} else {
  console.log('❌ VideoService.getVideos is NOT a function');
}

if (ResearchService && typeof ResearchService.getResearchArticles === 'function') {
  console.log('✅ ResearchService.getResearchArticles is a function');
} else {
  console.log('❌ ResearchService.getResearchArticles is NOT a function');
}

if (LegalService && typeof LegalService.getLegalArticles === 'function') {
  console.log('✅ LegalService.getLegalArticles is a function');
} else {
  console.log('❌ LegalService.getLegalArticles is NOT a function');
} 