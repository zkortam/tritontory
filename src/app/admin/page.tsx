"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Newspaper, 
  Video, 
  Microscope, 
  Scale, 
  Users, 
  AlertCircle,
  Loader2,
  Plus,
  MessageCircle
} from "lucide-react";
import { 
  ArticleService, 
  VideoService, 
  ResearchService, 
  LegalService,
  UserService 
} from "@/lib/firebase-service";

// Content type to icon mapping
const contentTypeIcons = {
  article: Newspaper,
  video: Video,
  research: Microscope,
  legal: Scale,
};

interface DashboardStats {
  articles: number;
  videos: number;
  research: number;
  legal: number;
  users: number;
  publishedArticles: number;
  publishedVideos: number;
  publishedResearch: number;
  publishedLegal: number;
}

interface RecentContent {
  id: string;
  title: string;
  type: 'article' | 'video' | 'research' | 'legal';
  author: string;
  publishedAt: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    articles: 0,
    videos: 0,
    research: 0,
    legal: 0,
    users: 0,
    publishedArticles: 0,
    publishedVideos: 0,
    publishedResearch: 0,
    publishedLegal: 0,
  });
  const [recentContent, setRecentContent] = useState<RecentContent[]>([]);
  const [contentChartData, setContentChartData] = useState<any[]>([]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all content in parallel
      const [allArticles, allVideos, allResearch, allLegal, allUsers] = await Promise.all([
        ArticleService.getAllArticles(),
        VideoService.getAllVideos(),
        ResearchService.getAllResearchArticles(),
        LegalService.getAllLegalArticles(),
        UserService.getUsers(),
      ]);

      // Calculate stats
      const publishedArticles = allArticles.filter(a => a.status === "published");
      const publishedVideos = allVideos.filter(v => v.status === "published");
      const publishedResearch = allResearch.filter(r => r.status === "published");
      const publishedLegal = allLegal.filter(l => l.status === "published");

      setStats({
        articles: allArticles.length,
        videos: allVideos.length,
        research: allResearch.length,
        legal: allLegal.length,
        users: allUsers.length,
        publishedArticles: publishedArticles.length,
        publishedVideos: publishedVideos.length,
        publishedResearch: publishedResearch.length,
        publishedLegal: publishedLegal.length,
      });

      // Get recent content (last 5 items from each type)
      const recentArticles = publishedArticles.slice(0, 2).map(article => ({
        id: article.id,
        title: article.title,
        type: 'article' as const,
        author: article.authorName,
        publishedAt: formatTimeAgo(article.publishedAt),
      }));

      const recentVideos = publishedVideos.slice(0, 2).map(video => ({
        id: video.id,
        title: video.title,
        type: 'video' as const,
        author: video.authorName,
        publishedAt: formatTimeAgo(video.publishedAt),
      }));

      const recentResearch = publishedResearch.slice(0, 2).map(research => ({
        id: research.id,
        title: research.title,
        type: 'research' as const,
        author: research.authorName,
        publishedAt: formatTimeAgo(research.publishedAt),
      }));

      const recentLegal = publishedLegal.slice(0, 2).map(legal => ({
        id: legal.id,
        title: legal.title,
        type: 'legal' as const,
        author: legal.authorName,
        publishedAt: formatTimeAgo(legal.publishedAt),
      }));

      // Combine and sort by date
      const allRecent = [...recentArticles, ...recentVideos, ...recentResearch, ...recentLegal]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 5);

      setRecentContent(allRecent);

      // Generate chart data (simplified - in a real app you'd aggregate by month)
      const chartData = [
        { name: "Articles", count: publishedArticles.length, color: "#0066CC" },
        { name: "Videos", count: publishedVideos.length, color: "#7209B7" },
        { name: "Research", count: publishedResearch.length, color: "#0096C7" },
        { name: "Legal", count: publishedLegal.length, color: "#D00000" },
      ];
      setContentChartData(chartData);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} months ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={fetchDashboardData} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-900/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Articles</CardTitle>
            <Newspaper className="h-4 w-4 text-tory-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.articles}</div>
            <p className="text-xs text-gray-400">
              {stats.publishedArticles} published
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <Video className="h-4 w-4 text-today-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.videos}</div>
            <p className="text-xs text-gray-400">
              {stats.publishedVideos} published
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Research</CardTitle>
            <Microscope className="h-4 w-4 text-science-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.research}</div>
            <p className="text-xs text-gray-400">
              {stats.publishedResearch} published
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Legal</CardTitle>
            <Scale className="h-4 w-4 text-law-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.legal}</div>
            <p className="text-xs text-gray-400">
              {stats.publishedLegal} published
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-gray-400">Registered</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Distribution Chart */}
      <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
          <CardTitle>Content Distribution</CardTitle>
          <CardDescription>Overview of published content across all platforms</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  />
                <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      {/* Recent Content */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
            <CardTitle>Recent Content</CardTitle>
          <CardDescription>Latest published content across all platforms</CardDescription>
        </CardHeader>
        <CardContent>
          {recentContent.length > 0 ? (
          <div className="space-y-4">
              {recentContent.map((content) => {
                const IconComponent = contentTypeIcons[content.type];
                const getTypeColor = (type: string) => {
                  switch (type) {
                    case 'article': return 'text-tory-500';
                    case 'video': return 'text-today-500';
                    case 'research': return 'text-science-500';
                    case 'legal': return 'text-law-500';
                    default: return 'text-gray-400';
                  }
                };

              return (
                  <div key={content.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                    <div className="flex items-center space-x-4">
                      <IconComponent className={`h-5 w-5 ${getTypeColor(content.type)}`} />
                      <div>
                        <h4 className="font-medium line-clamp-1">{content.title}</h4>
                        <p className="text-sm text-gray-400">
                          by {content.author} • {content.publishedAt}
                        </p>
                  </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                  </Button>
                </div>
              );
            })}
          </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No recent content available.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/articles/create">
          <Card className="bg-gray-900 border-gray-800 hover:border-tory-500 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <Newspaper className="h-8 w-8 mx-auto text-tory-500" />
              <CardTitle className="text-lg">Create Article</CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/videos/create">
          <Card className="bg-gray-900 border-gray-800 hover:border-today-500 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <Video className="h-8 w-8 mx-auto text-today-500" />
              <CardTitle className="text-lg">Upload Video</CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/research/create">
          <Card className="bg-gray-900 border-gray-800 hover:border-science-500 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <Microscope className="h-8 w-8 mx-auto text-science-500" />
              <CardTitle className="text-lg">Add Research</CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/legal/create">
          <Card className="bg-gray-900 border-gray-800 hover:border-law-500 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <Scale className="h-8 w-8 mx-auto text-law-500" />
              <CardTitle className="text-lg">Write Legal</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Management Tools */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/analytics">
          <Card className="bg-gray-900 border-gray-800 hover:border-blue-500 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <BarChart className="h-8 w-8 mx-auto text-blue-500" />
              <CardTitle className="text-lg">Analytics</CardTitle>
              <CardDescription>View performance metrics</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/comments">
          <Card className="bg-gray-900 border-gray-800 hover:border-green-500 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <MessageCircle className="h-8 w-8 mx-auto text-green-500" />
              <CardTitle className="text-lg">Comments</CardTitle>
              <CardDescription>Moderate user feedback</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="bg-gray-900 border-gray-800 hover:border-purple-500 transition-colors cursor-pointer">
            <CardHeader className="text-center">
              <Users className="h-8 w-8 mx-auto text-purple-500" />
              <CardTitle className="text-lg">Users</CardTitle>
              <CardDescription>Manage user accounts</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
