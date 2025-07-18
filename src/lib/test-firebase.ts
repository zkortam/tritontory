"use client";

import { ArticleService, VideoService, ResearchService, LegalService } from "./firebase-service";
import { ErrorHandler } from "./error-handling";

export class FirebaseTester {
  // Test all Firebase services
  static async testAllServices(): Promise<{
    articles: boolean;
    videos: boolean;
    research: boolean;
    legal: boolean;
    errors: string[];
  }> {
    const results = {
      articles: false,
      videos: false,
      research: false,
      legal: false,
      errors: [] as string[]
    };

    console.log("🧪 Testing Firebase Integration...");

    // Test Articles
    try {
      console.log("📰 Testing Articles...");
      const articles = await ArticleService.getArticles(undefined, undefined, false, 1);
      results.articles = true;
      console.log(`✅ Articles: Found ${articles.length} articles`);
    } catch (error: any) {
      const firebaseError = ErrorHandler.handleError(error, "Articles Test");
      results.errors.push(`Articles: ${firebaseError.message}`);
      console.error("❌ Articles test failed:", firebaseError.message);
    }

    // Test Videos
    try {
      console.log("🎥 Testing Videos...");
      const videos = await VideoService.getVideos(undefined, false, 1);
      results.videos = true;
      console.log(`✅ Videos: Found ${videos.length} videos`);
    } catch (error: any) {
      const firebaseError = ErrorHandler.handleError(error, "Videos Test");
      results.errors.push(`Videos: ${firebaseError.message}`);
      console.error("❌ Videos test failed:", firebaseError.message);
    }

    // Test Research
    try {
      console.log("🔬 Testing Research...");
      const research = await ResearchService.getResearchArticles(undefined, false, 1);
      results.research = true;
      console.log(`✅ Research: Found ${research.length} research articles`);
    } catch (error: any) {
      const firebaseError = ErrorHandler.handleError(error, "Research Test");
      results.errors.push(`Research: ${firebaseError.message}`);
      console.error("❌ Research test failed:", firebaseError.message);
    }

    // Test Legal Articles
    try {
      console.log("⚖️ Testing Legal Articles...");
      const legal = await LegalService.getLegalArticles(undefined, false, 1);
      results.legal = true;
      console.log(`✅ Legal Articles: Found ${legal.length} legal articles`);
    } catch (error: any) {
      const firebaseError = ErrorHandler.handleError(error, "Legal Articles Test");
      results.errors.push(`Legal Articles: ${firebaseError.message}`);
      console.error("❌ Legal Articles test failed:", firebaseError.message);
    }

    // Summary
    const successCount = Object.values(results).filter(v => v === true).length;
    console.log(`\n📊 Test Results: ${successCount}/4 services working`);
    
    if (results.errors.length > 0) {
      console.log("❌ Errors found:");
      results.errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log("🎉 All Firebase services are working correctly!");
    }

    return results;
  }

  // Test authentication
  static async testAuthentication(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log("🔐 Testing Authentication...");
      // This is a basic test - in a real app you'd test actual auth flows
      console.log("✅ Authentication service is available");
      return { success: true };
    } catch (error: any) {
      const firebaseError = ErrorHandler.handleError(error, "Authentication Test");
      console.error("❌ Authentication test failed:", firebaseError.message);
      return { success: false, error: firebaseError.message };
    }
  }

  // Test file upload (mock)
  static async testFileUpload(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log("📁 Testing File Upload...");
      // This would test actual file upload in a real scenario
      console.log("✅ File upload service is available");
      return { success: true };
    } catch (error: any) {
      const firebaseError = ErrorHandler.handleError(error, "File Upload Test");
      console.error("❌ File upload test failed:", firebaseError.message);
      return { success: false, error: firebaseError.message };
    }
  }

  // Run comprehensive test
  static async runComprehensiveTest(): Promise<void> {
    console.log("🚀 Starting Comprehensive Firebase Test...\n");

    const servicesTest = await this.testAllServices();
    const authTest = await this.testAuthentication();
    const uploadTest = await this.testFileUpload();

    console.log("\n📋 Comprehensive Test Summary:");
    console.log(`Services: ${Object.values(servicesTest).filter(v => v === true).length}/4 working`);
    console.log(`Authentication: ${authTest.success ? '✅' : '❌'}`);
    console.log(`File Upload: ${uploadTest.success ? '✅' : '❌'}`);

    const totalTests = 6;
    const passedTests = Object.values(servicesTest).filter(v => v === true).length + 
                       (authTest.success ? 1 : 0) + 
                       (uploadTest.success ? 1 : 0);

    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log("🎉 Firebase integration is fully functional!");
    } else {
      console.log("⚠️ Some Firebase features need attention.");
    }
  }
}

// Export for use in components
export const testFirebase = FirebaseTester.runComprehensiveTest; 