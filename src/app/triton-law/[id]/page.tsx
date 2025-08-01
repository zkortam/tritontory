"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LegalService } from "@/lib/firebase-service";
import { LegalArticle } from "@/lib/models";
import { Comments } from "@/components/common/Comments";
import { SocialShare } from "@/components/common/SocialShare";
import { AnalyticsService, generateSessionId } from "@/lib/analytics-service";
// import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Calendar, User, Tag, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { calculateReadingTime } from "@/lib/utils";

export default function LegalArticlePage() {
  const params = useParams();
  // const { user: currentUser } = useAuth();
  const [article, setArticle] = useState<LegalArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<LegalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState(false);

  // Temporarily disabled redirect hook to fix auto-redirect issue
  // useRedirectOnAuth();

  useEffect(() => {
    async function fetchArticle() {
      try {
        const id = params.id as string;

        // Fetch the legal article
        const fetchedArticle = await LegalService.getLegalArticle(id);

        if (!fetchedArticle) {
          setError("Legal analysis not found");
          return;
        }

        setArticle(fetchedArticle);

        // Fetch related articles from the same category
        const related = await LegalService.getLegalArticles(
          fetchedArticle.category,
          false,
          4
        );

        // Filter out the current article
        setRelatedArticles(related.filter(a => a.id !== id));

      } catch (error) {
        console.error("Error fetching legal article:", error);
        setError("Failed to load legal analysis");
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [params.id]);

  // Track click on component mount with error handling
  useEffect(() => {
    if (article && !analyticsError) {
      const trackClick = async () => {
        try {
          const sessionId = generateSessionId();
          await AnalyticsService.trackClick(article.id, 'legal', sessionId);
        } catch (error) {
          console.error("Analytics error:", error);
          setAnalyticsError(true);
        }
      };
      trackClick();
    }
  }, [article, analyticsError]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading legal analysis...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Legal Analysis Not Found</h1>
              <p className="text-gray-400 mb-8">{error || "The legal analysis you're looking for doesn't exist."}</p>
              <Link href="/triton-law">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Law Review
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container px-4 py-4">
          <Link href="/triton-law">
            <Button variant="ghost" className="text-crimson-500 hover:text-crimson-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Law Review
            </Button>
          </Link>
        </div>
      </div>

      <article className="container px-4 py-8 max-w-4xl mx-auto">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-crimson-500 text-white">{article.category}</Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              Legal Analysis
            </Badge>
            {article.featured && (
              <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                Featured
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>

          {article.abstract && (
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              {article.abstract}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(article.publishedAt, { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{calculateReadingTime(article.content || "")} min read</span>
            </div>
          </div>

          {/* Article Actions */}
          <div className="flex gap-3 mb-8">
            <SocialShare
              contentId={article.id}
              contentType="legal"
              title={article.title}
              description={article.abstract || ""}
              url={typeof window !== 'undefined' ? window.location.href : ''}
              image={article.coverImage}
            />
          </div>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div
          className="prose prose-invert prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content || "" }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-400">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:border-crimson-500 hover:text-crimson-500 cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="bg-gray-800 my-12" />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Legal Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  href={`/triton-law/${relatedArticle.id}`}
                  className="group"
                >
                  <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
                    {relatedArticle.coverImage && (
                      <div className="relative aspect-video">
                        <Image
                          src={relatedArticle.coverImage}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-crimson-400 transition-colors">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        {relatedArticle.abstract}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{relatedArticle.authorName}</span>
                        <span>{formatDistanceToNow(relatedArticle.publishedAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
        <Comments contentId={article.id} contentType="legal" />
      </article>
    </div>
  );
} 