import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedHeroBackground } from "@/components/ui/animated-hero-background";
import { ArticleService, VideoService, ResearchService, LegalService } from "@/lib/firebase-service";
import { Article, Video, Research, LegalArticle } from "@/lib/models";
import { Badge } from "@/components/ui/badge";
import { StockTicker } from "@/components/common/StockTicker";
import { 
  Newspaper, 
  Video as VideoIcon, 
  Microscope, 
  Scale, 
  Play
} from "lucide-react";



export default async function Home() {
  // Fetch real data from Firebase with error handling
  let latestArticles: Article[] = [];
  let latestVideos: Video[] = [];
  let latestResearch: Research[] = [];
  let latestLegal: LegalArticle[] = [];

  // Fetch each content type individually to handle partial failures
  try {
    latestArticles = await ArticleService.getArticles(undefined, undefined, false, 2);
  } catch (error) {
    console.error("Error fetching latest articles:", error);
  }

  try {
    latestVideos = await VideoService.getVideos(undefined, false, 1);
  } catch (error) {
    console.error("Error fetching latest videos:", error);
  }

  try {
    latestResearch = await ResearchService.getResearchArticles(undefined, false, 1);
  } catch (error) {
    console.error("Error fetching latest research:", error);
  }

  try {
    latestLegal = await LegalService.getLegalArticles(undefined, false, 1);
  } catch (error) {
    console.error("Error fetching latest legal articles:", error);
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return formatDate(date);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="pb-20">
      {/* Stock Ticker */}
      <StockTicker />
      
      {/* Hero Section - News Style */}
      <section className="relative min-h-screen overflow-hidden pt-16">
        {/* Animated background */}
        <AnimatedHeroBackground />

        {/* Hero Content */}
        <div className="container relative z-10 mobile-safe-area py-8">
          {/* Header */}
          <div className="text-center mb-12 fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
              Triton Tory Media
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              The comprehensive voice of UC San Diego
            </p>
          </div>

          {/* 3-Column News Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Column 1: Campus News */}
            <div className="space-y-6">
              {latestArticles.length > 0 ? (
                latestArticles.map((article) => (
                  <Link key={article.id} href={`/triton-tory/${article.id}`} className="block">
                    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-tory-500 transition-all duration-300 h-[280px] cursor-pointer group relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-tory-500 rounded-full"></div>
                          <Badge className="bg-tory-500 text-white text-xs">
                            {article.category || 'Campus'}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-tory-300 transition-colors">{article.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-16">
                        <p className="text-sm text-gray-400 line-clamp-3">
                          {article.excerpt}
                        </p>
                      </CardContent>
                      <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{formatTimeAgo(article.publishedAt)}</span>
                          <span className="text-xs text-tory-400 group-hover:text-tory-300 transition-colors">Read More →</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                // Fallback content when no articles are available
                <>
                  <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-tory-500 transition-all duration-300 h-[280px] relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-tory-500 rounded-full"></div>
                        <Badge className="bg-tory-500 text-white text-xs">Campus</Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">Welcome to Triton Tory Media</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-16">
                      <p className="text-sm text-gray-400 line-clamp-3">
                        Stay tuned for the latest campus news, events, and stories from UC San Diego.
                      </p>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Coming soon</span>
                        <span className="text-xs text-tory-400">Explore</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-tory-500 transition-all duration-300 h-[280px] relative">
                    <CardHeader className="pb-3">
                      <Badge className="bg-tory-500 text-white text-xs w-fit">Campus</Badge>
                      <CardTitle className="text-lg line-clamp-2">Student Journalism at UCSD</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-16">
                      <p className="text-sm text-gray-400 line-clamp-3">
                        Our team of student reporters is working hard to bring you the most important stories from campus.
                      </p>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Coming soon</span>
                        <span className="text-xs text-tory-400">Learn More</span>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>

            {/* Column 2: Local News */}
            <div className="space-y-6">
              {latestResearch.length > 0 ? (
                latestResearch.map((research) => (
                  <Link key={research.id} href={`/triton-science/${research.id}`} className="block">
                    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-blue-500 transition-all duration-300 h-[280px] cursor-pointer group relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <Badge className="bg-blue-500 text-white text-xs">Research</Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-300 transition-colors">{research.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-16">
                        <p className="text-sm text-gray-400 line-clamp-3">
                          {research.abstract}
                        </p>
                      </CardContent>
                      <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{formatTimeAgo(research.publishedAt)}</span>
                          <span className="text-xs text-blue-400 group-hover:text-blue-300 transition-colors">Read More →</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-blue-500 transition-all duration-300 h-[280px] relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <Badge className="bg-blue-500 text-white text-xs">Research</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">Scientific Discoveries</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-16">
                    <p className="text-sm text-gray-400 line-clamp-3">
                      Explore groundbreaking research and discoveries happening across UC San Diego.
                    </p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Coming soon</span>
                      <span className="text-xs text-blue-400">Explore</span>
                    </div>
                  </div>
                </Card>
              )}

              {latestLegal.length > 0 ? (
                latestLegal.map((legal) => (
                  <Link key={legal.id} href={`/triton-law/${legal.id}`} className="block">
                    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-blue-500 transition-all duration-300 h-[280px] cursor-pointer group relative">
                      <CardHeader className="pb-3">
                        <Badge className="bg-blue-500 text-white text-xs w-fit">Legal</Badge>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-300 transition-colors">{legal.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-16">
                        <p className="text-sm text-gray-400 line-clamp-3">
                          {legal.abstract}
                        </p>
                      </CardContent>
                      <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{formatTimeAgo(legal.publishedAt)}</span>
                          <span className="text-xs text-blue-400 group-hover:text-blue-300 transition-colors">Read More →</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-blue-500 transition-all duration-300 h-[280px] relative">
                  <CardHeader className="pb-3">
                    <Badge className="bg-blue-500 text-white text-xs w-fit">Legal</Badge>
                    <CardTitle className="text-lg line-clamp-2">Legal Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-16">
                    <p className="text-sm text-gray-400 line-clamp-3">
                      Student-led legal analysis on campus policies and broader legal developments.
                    </p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Coming soon</span>
                      <span className="text-xs text-blue-400">Explore</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Column 3: Latest Video */}
            <div>
              {latestVideos.length > 0 ? (
                latestVideos.map((video) => (
                  <Link key={video.id} href={`/triton-today/${video.id}`} className="block">
                    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-today-500 transition-all duration-300 h-[572px] cursor-pointer group relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-today-500 rounded-full"></div>
                          <Badge className="bg-today-500 text-white text-xs">Latest Video</Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-today-300 transition-colors">{video.title}</CardTitle>
                      </CardHeader>
                      <div className="relative aspect-video overflow-hidden rounded-lg mx-4 mb-4">
                        <Image
                          src={video.thumbnailUrl || "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-16 h-16 bg-today-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <CardContent className="pt-0 pb-16">
                        <p className="text-sm text-gray-400 line-clamp-3">
                          {video.description}
                        </p>
                      </CardContent>
                      <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{formatTimeAgo(video.publishedAt)} • {formatViews(video.views)} views</span>
                          <span className="text-xs text-today-400 group-hover:text-today-300 transition-colors">Watch Now →</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                // Fallback content when no videos are available
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-today-500 transition-all duration-300 h-[572px] relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-today-500 rounded-full"></div>
                      <Badge className="bg-today-500 text-white text-xs">Video Content</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">Triton Today Videos</CardTitle>
                  </CardHeader>
                  <div className="relative aspect-video overflow-hidden rounded-lg mx-4 mb-4">
                    <Image
                      src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
                      alt="Video Placeholder"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-16 h-16 bg-today-500 rounded-full flex items-center justify-center">
                        <VideoIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-0 pb-16">
                    <p className="text-sm text-gray-400 line-clamp-3">
                      Short-form news videos and visual storytelling from our student reporters.
                    </p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Coming soon</span>
                      <span className="text-xs text-today-400">Explore</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Quick Navigation Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mobile-gpu-accelerated">
            <Link href="/triton-tory" className="group">
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-tory-500 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 p-3 rounded-lg bg-gradient-to-br from-tory-500 to-tory-600 group-hover:scale-110 transition-transform">
                    <Newspaper className="w-full h-full text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">News & Articles</h3>
                  <p className="text-sm text-gray-400">Latest campus news and in-depth reporting</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/triton-today" className="group">
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-today-500 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 p-3 rounded-lg bg-gradient-to-br from-today-500 to-today-600 group-hover:scale-110 transition-transform">
                    <VideoIcon className="w-full h-full text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Video Content</h3>
                  <p className="text-sm text-gray-400">Visual storytelling and multimedia journalism</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/triton-science" className="group">
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-science-500 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 p-3 rounded-lg bg-gradient-to-br from-science-500 to-science-600 group-hover:scale-110 transition-transform">
                    <Microscope className="w-full h-full text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Science Journal</h3>
                  <p className="text-sm text-gray-400">Research highlights and scientific discoveries</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/triton-law" className="group">
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-law-500 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 p-3 rounded-lg bg-gradient-to-br from-law-500 to-law-600 group-hover:scale-110 transition-transform">
                    <Scale className="w-full h-full text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Law Review</h3>
                  <p className="text-sm text-gray-400">Legal analysis and policy discussions</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
