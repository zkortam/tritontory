"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { VideoService } from "@/lib/firebase-service";
import { Video } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Comments } from "@/components/common/Comments";
import { SocialShare } from "@/components/common/SocialShare";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Eye,
  Calendar,
  User,
  Bookmark,
  BookmarkPlus,
  Clock
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function VideoPage() {
  const params = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const id = params.id as string;
        const fetchedVideo = await VideoService.getVideo(id);

        if (!fetchedVideo) {
          setError("Video not found");
          return;
        }

        setVideo(fetchedVideo);

        // Fetch related videos from the same category
        const related = await VideoService.getVideos(
          fetchedVideo.category,
          false,
          6
        );

        // Filter out the current video
        setRelatedVideos(related.filter(v => v.id !== id));

      } catch (error) {
        console.error("Error fetching video:", error);
        setError("Failed to load video");
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [params.id]);

  const handleVideoClick = () => {
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
        setIsPlaying(false);
      } else {
        videoElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleMuteToggle = () => {
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-today-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
              <p className="text-gray-400 mb-8">{error || "The video you're looking for doesn't exist."}</p>
              <Link href="/triton-today">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Videos
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
          <Link href="/triton-today">
            <Button variant="ghost" className="text-today-500 hover:text-today-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Videos
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video */}
          <div className="lg:col-span-2">
            <div className="relative">
              <video
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                className="w-full aspect-[9/16] max-w-md mx-auto object-cover rounded-lg"
                loop
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Overlay */}
              <div className="absolute inset-0 flex items-center justify-center max-w-md mx-auto">
                <button
                  onClick={handleVideoClick}
                  className="bg-black/50 rounded-full p-4 opacity-0 hover:opacity-100 transition-opacity"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>

              {/* Video Controls */}
              <div className="absolute top-4 right-4 max-w-md mx-auto">
                <button
                  onClick={handleMuteToggle}
                  className="bg-black/50 rounded-full p-2 text-white"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Duration Badge */}
              <div className="absolute top-4 left-4 max-w-md mx-auto">
                <Badge className="bg-black/80 text-white text-xs">
                  {formatDuration(video.duration)}
                </Badge>
              </div>
            </div>

            {/* Video Info */}
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{formatViews(video.views)} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDistanceToNow(video.publishedAt, { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4 p-4 bg-gray-900/50 rounded-lg">
                <div className="w-12 h-12 bg-today-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{video.authorName}</h3>
                  <p className="text-sm text-gray-400">Content Creator</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-300 leading-relaxed">{video.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mb-8">
                <Button
                  variant="outline"
                  onClick={() => setLiked(!liked)}
                  className={liked ? "border-red-500 text-red-500" : ""}
                >
                  <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-red-500' : ''}`} />
                  {liked ? 'Liked' : 'Like'}
                </Button>
                
                <Button variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comment
                </Button>
                
                <SocialShare
                  contentId={video.id}
                  contentType="video"
                  title={video.title}
                  description={video.description}
                  url={window.location.href}
                  image={video.thumbnailUrl}
                />
                
                <Button
                  variant="outline"
                  onClick={() => setSaved(!saved)}
                  className={saved ? "border-today-500 text-today-500" : ""}
                >
                  {saved ? (
                    <Bookmark className="w-4 h-4 mr-2 fill-today-500" />
                  ) : (
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                  )}
                  {saved ? 'Saved' : 'Save'}
                </Button>
              </div>

              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge className="bg-today-500 text-white">
                  {video.category}
                </Badge>
                {video.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Comments */}
              <div className="mb-8">
                <Comments
                  contentId={video.id}
                  contentType="video"
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-xl font-bold mb-6">Related Videos</h2>
              <div className="space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <Link key={relatedVideo.id} href={`/triton-today/${relatedVideo.id}`}>
                    <Card className="bg-gray-900/50 border-gray-800 hover:border-today-500/50 transition-colors cursor-pointer">
                      <div className="relative aspect-[9/16] overflow-hidden rounded-t-lg">
                        <video
                          src={relatedVideo.videoUrl}
                          poster={relatedVideo.thumbnailUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-black/80 text-white text-xs">
                            {formatDuration(relatedVideo.duration)}
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center gap-2 text-white text-sm">
                            <Eye className="w-4 h-4" />
                            <span>{formatViews(relatedVideo.views)}</span>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white line-clamp-2 mb-2">
                          {relatedVideo.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{relatedVideo.authorName}</span>
                          <span>{formatDistanceToNow(relatedVideo.publishedAt, { addSuffix: true })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              
              {relatedVideos.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No related videos found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 