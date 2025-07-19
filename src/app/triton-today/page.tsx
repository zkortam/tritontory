"use client";

import { useState, useEffect, useRef } from "react";
import { VideoService } from "@/lib/firebase-service";
import { Video } from "@/lib/models";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageCircle, 
  Eye,
  Calendar,
  User
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Comments } from "@/components/common/Comments";
import { SocialShare } from "@/components/common/SocialShare";

export default function TritonTodayPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        const fetchedVideos = await VideoService.getVideos(selectedCategory, false, 50);
        setVideos(fetchedVideos);
        setCurrentVideoIndex(0);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [selectedCategory]);

  useEffect(() => {
    // Pause all videos except current
    videoRefs.current.forEach((videoRef, index) => {
      if (videoRef && index !== currentVideoIndex) {
        videoRef.pause();
      }
    });
  }, [currentVideoIndex]);

  const handleVideoClick = () => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.pause();
        setIsPlaying(false);
      } else {
        currentVideo.play();
        setIsPlaying(true);
      }
    }
  };

  const handleMuteToggle = () => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      currentVideo.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = (videoId: string) => {
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };



  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'down' && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    } else if (direction === 'up' && currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
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
          <p className="text-gray-400">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Videos Found</h1>
            <p className="text-gray-400">No videos available in this category.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Video Container */}
      <div 
        ref={containerRef}
        className="h-screen overflow-y-auto scroll-smooth"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="h-screen flex items-center justify-center relative scroll-snap-start"
            style={{ scrollSnapAlign: 'start' }}
          >
                          {/* Video Player */}
              <div className="relative w-full max-w-sm mx-auto">
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  className="w-full h-[80vh] object-cover rounded-lg"
                  loop
                  playsInline
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    if (index < videos.length - 1) {
                      setCurrentVideoIndex(index + 1);
                    }
                  }}
                  onLoadedMetadata={() => {
                    // Auto-play the first video
                    if (index === 0 && !isPlaying) {
                      const videoElement = videoRefs.current[index];
                      if (videoElement) {
                        videoElement.play().catch(() => {
                          // Auto-play failed, that's okay
                        });
                      }
                    }
                  }}
                />
              
              {/* Video Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handleVideoClick}
                  className="bg-black/50 rounded-full p-4 opacity-0 hover:opacity-100 transition-opacity"
                >
                  {isPlaying && index === currentVideoIndex ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>

              {/* Video Info */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
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
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute right-4 bottom-20 flex flex-col gap-4">
                <button
                  onClick={() => handleLike(video.id)}
                  className="flex flex-col items-center gap-1 text-white"
                >
                  <Heart 
                    className={`w-8 h-8 ${likedVideos.has(video.id) ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                  <span className="text-xs">{video.views}</span>
                </button>
                
                <button className="flex flex-col items-center gap-1 text-white">
                  <MessageCircle className="w-8 h-8" />
                  <span className="text-xs">Comment</span>
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
          </div>
        ))}
      </div>


    </div>
  );
} 