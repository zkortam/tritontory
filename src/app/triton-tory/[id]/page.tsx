"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArticleService } from "@/lib/firebase-service";
import { Article } from "@/lib/models";
import { Comments } from "@/components/common/Comments";
import { SocialShare } from "@/components/common/SocialShare";
import { LikeButton } from "@/components/common/LikeButton";
import { FollowButton } from "@/components/common/FollowButton";
import { AnalyticsService } from "@/lib/analytics-service";
import { useRedirectOnAuth } from "@/lib/auth-context";
import { ArrowLeft, Calendar, User, Tag, BookOpen, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { calculateReadingTime } from "@/lib/utils";

export default function ArticlePage() {
  const params = useParams();
  useRedirectOnAuth(); // Track current page for redirect after auth
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const id = params.id as string;

        // Fetch the article
        const fetchedArticle = await ArticleService.getArticle(id);

        if (!fetchedArticle) {
          setError("Article not found");
          return;
        }

        setArticle(fetchedArticle);

        // Fetch related articles from the same category
        const related = await ArticleService.getArticles(
          fetchedArticle.category,
          undefined,
          false,
          4
        );

        // Filter out the current article
        setRelatedArticles(related.filter(a => a.id !== id));

      } catch {
        console.error("Error fetching article");
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [params.id]);



  // Track view on component mount
  useEffect(() => {
    if (article) {
      const sessionId = AnalyticsService.generateSessionId();
      AnalyticsService.trackView(article.id, 'article', sessionId);
    }
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tory-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading article...</p>
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
              <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
              <p className="text-gray-400 mb-8">{error || "The article you're looking for doesn't exist."}</p>
              <Link href="/triton-tory">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Articles
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
          <Link href="/triton-tory">
            <Button variant="ghost" className="text-tory-500 hover:text-tory-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Triton Tory
            </Button>
          </Link>
        </div>
      </div>

      <article className="container px-4 py-8 max-w-4xl mx-auto">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-tory-500 text-white">{article.category}</Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {article.section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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

          {article.excerpt && (
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              {article.excerpt}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <Link 
                href={`/profile/${article.authorId}`}
                className="hover:text-tory-400 transition-colors cursor-pointer"
              >
                {article.authorName}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(article.publishedAt, { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{calculateReadingTime(article.content)} min read</span>
            </div>
            {article.likes > 0 && (
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>{article.likes} likes</span>
              </div>
            )}
          </div>

          {/* Article Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <LikeButton
              contentId={article.id}
              contentType="article"
              initialLikes={article.likes || 0}
              size="md"
              variant="outline"
            />
            <FollowButton
              targetId={article.authorId}
              followType="user"
              size="default"
              variant="outline"
            >
              Follow Author
            </FollowButton>
            <SocialShare
              contentId={article.id}
              contentType="article"
              title={article.title}
              description={article.excerpt || ""}
              url={window.location.href}
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
          dangerouslySetInnerHTML={{ __html: article.content }}
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
                  className="border-gray-600 text-gray-300 hover:border-tory-500 hover:text-tory-500 cursor-pointer"
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
          <section>
            <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  href={`/triton-tory/${relatedArticle.id}`}
                  className="group"
                >
                  <article className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800 hover:border-tory-500 transition-colors">
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
                      <Badge className="bg-tory-500 text-white mb-2 text-xs">
                        {relatedArticle.category}
                      </Badge>
                      <h4 className="font-semibold line-clamp-2 group-hover:text-tory-500 transition-colors">
                        {relatedArticle.title}
                      </h4>
                      {relatedArticle.excerpt && (
                        <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                          {relatedArticle.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <span>{relatedArticle.authorName}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(relatedArticle.publishedAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Comments Section */}
      <div className="container px-4 py-8 max-w-4xl mx-auto">
        <Comments contentId={article.id} contentType="article" />
      </div>
    </div>
  );
}
