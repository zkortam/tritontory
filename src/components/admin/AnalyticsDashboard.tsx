"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  Eye, 
  Share2, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Loader2
} from "lucide-react";
import { AnalyticsService } from "@/lib/analytics-service";
import { ContentAnalytics } from "@/lib/models";

interface AnalyticsSummary {
  totalViews: number;
  totalShares: number;
  totalLikes: number;
  totalComments: number;
  topContent: ContentAnalytics[];
  recentActivity: Array<{type: string; contentId: string; timestamp: Date; contentType: string; platform?: string}>;
}



export function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsService.getAnalyticsSummary();
      setSummary(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getContentTypeColor = (type: string) => {
    const colors = {
      article: '#0066CC',
      video: '#7209B7',
      research: '#0096C7',
      legal: '#D00000'
    };
    return colors[type as keyof typeof colors] || '#666666';
  };

  const getContentTypeLabel = (type: string) => {
    const labels = {
      article: 'Article',
      video: 'Video',
      research: 'Research',
      legal: 'Legal'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || "Failed to load analytics"}</p>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  // Prepare chart data
  const overviewData = [
    { name: 'Views', value: summary.totalViews, icon: Eye, color: '#0066CC' },
    { name: 'Shares', value: summary.totalShares, icon: Share2, color: '#00C49F' },
    { name: 'Likes', value: summary.totalLikes, icon: Heart, color: '#FFBB28' },
    { name: 'Comments', value: summary.totalComments, icon: MessageCircle, color: '#FF8042' },
  ];

  const topContentData = summary.topContent.map((content, index) => ({
    name: `Content ${index + 1}`,
    views: content.views || 0,
    shares: content.shares || 0,
    likes: content.likes || 0,
    comments: content.comments || 0,
    type: getContentTypeLabel(content.contentType),
    color: getContentTypeColor(content.contentType),
  }));

  const contentTypeData = summary.topContent.reduce((acc, content) => {
    const type = content.contentType;
    const existing = acc.find(item => item.name === getContentTypeLabel(type));
    if (existing) {
      existing.value += content.views || 0;
    } else {
      acc.push({
        name: getContentTypeLabel(type),
        value: content.views || 0,
        color: getContentTypeColor(type),
      });
    }
    return acc;
  }, [] as Array<{name: string; value: number; color: string}>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-400">Content performance and user engagement metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as '7d' | '30d' | '90d')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewData.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.name} className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {metric.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: metric.color }}>
                  {formatNumber(metric.value)}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Total {metric.name.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Content Performance */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Content Performance
            </CardTitle>
            <CardDescription>
              Most viewed content by engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topContentData}>
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
                <Bar dataKey="views" fill="#0066CC" name="Views" />
                <Bar dataKey="shares" fill="#00C49F" name="Shares" />
                <Bar dataKey="likes" fill="#FFBB28" name="Likes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Type Distribution */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Content Type Distribution
            </CardTitle>
            <CardDescription>
              Views by content type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Top Performing Content</CardTitle>
          <CardDescription>
            Content with the highest engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.topContent.map((content, index) => (
              <div key={content.contentId} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">Content ID: {content.contentId}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        className="text-xs"
                        style={{ backgroundColor: getContentTypeColor(content.contentType) }}
                      >
                        {getContentTypeLabel(content.contentType)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-blue-400">{formatNumber(content.views || 0)}</p>
                    <p className="text-gray-400">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-400">{formatNumber(content.shares || 0)}</p>
                    <p className="text-gray-400">Shares</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-yellow-400">{formatNumber(content.likes || 0)}</p>
                    <p className="text-gray-400">Likes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-purple-400">{formatNumber(content.comments || 0)}</p>
                    <p className="text-gray-400">Comments</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest user interactions and content activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'view' ? 'bg-blue-400' : 
                  activity.type === 'share' ? 'bg-green-400' : 'bg-purple-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">
                      {activity.type === 'view' ? 'Viewed' : 
                       activity.type === 'share' ? 'Shared' : 'Liked'}
                    </span>
                    {' '}
                    <span className="text-gray-400">
                      {getContentTypeLabel(activity.contentType)} content
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.platform && `via ${activity.platform}`}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 