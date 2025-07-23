"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResearchService } from "@/lib/firebase-service";
import { Research } from "@/lib/models";
import { Comments } from "@/components/common/Comments";
import { SocialShare } from "@/components/common/SocialShare";
import { AnalyticsService, generateSessionId } from "@/lib/analytics-service";
// import { useAuth } from "@/lib/auth-context";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  BookOpen,
  Dna,
  FlaskConical,
  Atom,
  Brain,
  Leaf,
  Database,
  Zap,
  Microscope
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { calculateReadingTime } from "@/lib/utils";

export default function TritonScienceArticlePage() {
  const params = useParams();
  // const { user: currentUser } = useAuth();
  const [research, setResearch] = useState<Research | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyticsError, setAnalyticsError] = useState(false);

  // Temporarily disabled redirect hook to fix auto-redirect issue
  // useRedirectOnAuth();

  useEffect(() => {
    async function fetchResearch() {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const researchData = await ResearchService.getResearchArticle(params.id as string);
        setResearch(researchData);
      } catch (error) {
        console.error("Error fetching research:", error);
        setError("Failed to load research article");
      } finally {
        setLoading(false);
      }
    }

    fetchResearch();
  }, [params.id]);

  // Track click on component mount with error handling
  useEffect(() => {
    if (research && !analyticsError) {
      const trackClick = async () => {
        try {
          console.log(`Tracking click for research article: ${research.id}`);
          const sessionId = generateSessionId();
          await AnalyticsService.trackClick(research.id, 'research', sessionId);
          console.log(`Successfully tracked click for: ${research.id}`);
        } catch (error) {
          console.error("Analytics error:", error);
          setAnalyticsError(true);
        }
      };
      trackClick();
    }
  }, [research, analyticsError]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !research) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Research article not found</div>
          <Link href="/triton-science">
            <Button variant="outline">Back to Research</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getDepartmentIcon = (department: string) => {
    const icons = {
      'Biology': <Dna className="h-5 w-5" />,
      'Chemistry': <FlaskConical className="h-5 w-5" />,
      'Physics': <Atom className="h-5 w-5" />,
      'Neuroscience': <Brain className="h-5 w-5" />,
      'Environmental Science': <Leaf className="h-5 w-5" />,
      'Computer Science': <Database className="h-5 w-5" />,
      'Engineering': <Zap className="h-5 w-5" />,
    };
    return icons[department as keyof typeof icons] || <Microscope className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container px-4 py-4">
          <Link href="/triton-science">
            <Button variant="ghost" className="text-science-500 hover:text-science-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Research
            </Button>
          </Link>
        </div>
      </div>

      <article className="container px-4 py-8 max-w-4xl mx-auto">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-science-500 text-white flex items-center gap-2">
              {getDepartmentIcon(research.department)}
              {research.department}
            </Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              Research
            </Badge>
            {research.featured && (
              <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                Featured
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {research.title}
          </h1>

          {research.abstract && (
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              {research.abstract}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{research.authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(research.publishedAt, { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{calculateReadingTime(research.content)} min read</span>
            </div>
          </div>

          {/* Article Actions */}
          <div className="flex gap-3 mb-8">
            <SocialShare
              contentId={research.id}
              contentType="research"
              title={research.title}
              description={research.abstract || ""}
              url={typeof window !== 'undefined' ? window.location.href : ''}
              image={research.coverImage}
            />
          </div>

          {/* Cover Image */}
          {research.coverImage && (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
              <Image
                src={research.coverImage}
                alt={research.title}
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
          dangerouslySetInnerHTML={{ __html: research.content }}
        />

        {/* Contributors */}
        {research.contributors && research.contributors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Contributors</h3>
            <div className="flex flex-wrap gap-2">
              {research.contributors.map((contributor, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  {contributor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {research.tags && research.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-400">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {research.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:border-science-500 hover:text-science-500 cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="bg-gray-800 my-12" />

        {/* Comments */}
        <Comments contentId={research.id} contentType="research" />
      </article>
    </div>
  );
} 