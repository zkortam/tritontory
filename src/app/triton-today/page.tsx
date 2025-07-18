import { VideoService } from "@/lib/firebase-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function TritonTodayPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categoryFilter = params.category;
  
  // Fetch videos from Firebase
  const featuredVideos = await VideoService.getVideos(undefined, true, 4);
  const allVideos = await VideoService.getVideos(categoryFilter, false, 12);

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="container px-4 md:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
          Triton Today
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Short-form video content and campus updates delivered in 30-60 second segments
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Link href="/triton-today">
          <Button 
            variant={!categoryFilter ? "default" : "outline"}
            size="sm"
          >
            All Videos
          </Button>
        </Link>
        <Link href="/triton-today?category=Campus">
          <Button 
            variant={categoryFilter === "Campus" ? "default" : "outline"}
            size="sm"
          >
            Campus Life
          </Button>
        </Link>
        <Link href="/triton-today?category=Interview">
          <Button 
            variant={categoryFilter === "Interview" ? "default" : "outline"}
            size="sm"
          >
            Interviews
          </Button>
        </Link>
        <Link href="/triton-today?category=Events">
          <Button 
            variant={categoryFilter === "Events" ? "default" : "outline"}
            size="sm"
          >
            Events Coverage
          </Button>
        </Link>
      </div>

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVideos.map((video) => (
              <Card key={video.id} className="bg-black/40 border-gray-800 hover:border-today-500/50 transition-colors">
                <div className="relative aspect-[9/16] overflow-hidden rounded-t-lg">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-black/80 text-white">
                      {formatDuration(video.duration)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Eye className="w-4 h-4" />
                      <span>{formatViews(video.views)}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded-full p-3">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{video.authorName}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(video.publishedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Videos */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          {categoryFilter ? `${categoryFilter} Videos` : 'All Videos'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allVideos.map((video) => (
            <Card key={video.id} className="bg-black/40 border-gray-800 hover:border-today-500/50 transition-colors">
              <div className="relative aspect-[9/16] overflow-hidden rounded-t-lg">
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/80 text-white">
                    {formatDuration(video.duration)}
                  </Badge>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{formatViews(video.views)}</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded-full p-3">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                <CardDescription className="line-clamp-2">{video.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{video.authorName}</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(video.publishedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {allVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No videos found in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
} 