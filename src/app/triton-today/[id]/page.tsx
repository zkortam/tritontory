"use client";

import { useState, useEffect, useRef } from "react";
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
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Auto-play video when it loads
  useEffect(() => {
    if (video && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play failed, that's okay
        console.log("Auto-play failed, user interaction required");
      });
    }
  }, [video]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Track video view when video starts playing
  const trackVideoView = async () => {
    if (video && !hasTrackedView) {
      try {
        await VideoService.incrementViews(video.id);
        setHasTrackedView(true);
      } catch (error) {
        console.error("Error tracking video view:", error);
      }
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
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl mx-auto gap-6">
          {/* Video Player */}
          <div className="relative flex-shrink-0">
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              className="w-full max-w-sm h-[80vh] object-cover rounded-lg"
              loop
              playsInline
              autoPlay
              muted={isMuted}
              onPlay={() => {
                setIsPlaying(true);
                // Track view when video starts playing
                trackVideoView();
              }}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Video Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
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

            {/* Mute Button */}
            <button
              onClick={handleMuteToggle}
              className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Duration Badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-black/80 text-white text-xs">
                {formatDuration(video.duration)}
              </Badge>
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 left-20">
              <Badge className="bg-today-500/90 text-white text-xs">
                {video.category}
              </Badge>
            </div>
          </div>

          {/* Content Sidebar */}
          <div className="flex flex-col justify-between h-[80vh] max-w-sm w-full md:w-auto">
            {/* Video Info */}
            <div className="flex-1">
              <h1 className="text-white font-semibold text-xl mb-3 line-clamp-3">
                {video.title}
              </h1>
              <p className="text-gray-300 text-sm mb-4 line-clamp-4 leading-relaxed">
                {video.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{video.authorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(video.publishedAt, { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(video.views)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLiked(!liked)}
                  className={`${liked ? "border-red-500 text-red-500" : "border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"}`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-red-500' : ''}`} />
                  {liked ? 'Liked' : 'Like'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                >
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
                  size="sm"
                  onClick={() => setSaved(!saved)}
                  className={`${saved ? "border-today-500 text-today-500" : "border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"}`}
                >
                  {saved ? (
                    <Bookmark className="w-4 h-4 mr-2 fill-today-500" />
                  ) : (
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                  )}
                  {saved ? 'Saved' : 'Save'}
                </Button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {video.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>


          </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <Comments
            contentId={video.id}
            contentType="video"
          />
        </div>
      </div>
    </div>
  );
} 