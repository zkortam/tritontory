"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { VideoService } from "@/lib/firebase-service";
import { Video } from "@/lib/models";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Eye,
  Calendar,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TritonTodayPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [isScrollLocked, setIsScrollLocked] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [videoDurations, setVideoDurations] = useState<{ [key: string]: number }>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupVideoRef = useRef<HTMLVideoElement>(null);

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
        videoRef.currentTime = 0; // Reset to beginning
      }
    });

    // Play current video
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      currentVideo.play().catch(() => {
        // Auto-play failed, that's okay
      });
    }
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





  const handleScroll = useCallback((direction: 'up' | 'down') => {
    if (direction === 'down' && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      // Scroll to next video
      const nextVideo = document.querySelector(`[data-video-index="${currentVideoIndex + 1}"]`);
      if (nextVideo) {
        nextVideo.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (direction === 'up' && currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
      // Scroll to previous video
      const prevVideo = document.querySelector(`[data-video-index="${currentVideoIndex - 1}"]`);
      if (prevVideo) {
        prevVideo.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [currentVideoIndex, videos.length]);

  // Add intersection observer for autoplay when video enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoIndex = parseInt(entry.target.getAttribute('data-video-index') || '0');
          
          if (entry.isIntersecting) {
            // Video is now visible - play it and update current index
            console.log(`Video ${videoIndex} is now visible`);
            setCurrentVideoIndex(videoIndex);
          } else {
            // Video is not visible - pause it
            console.log(`Video ${videoIndex} is no longer visible`);
            const videoRef = videoRefs.current[videoIndex];
            if (videoRef) {
              videoRef.pause();
              videoRef.currentTime = 0;
            }
          }
        });
      },
      {
        threshold: 0.8, // Video must be 80% visible to be considered "in view"
        rootMargin: '0px'
      }
    );

    // Observe all video containers
    const videoContainers = document.querySelectorAll('[data-video-index]');
    videoContainers.forEach((container) => {
      observer.observe(container);
    });

    return () => {
      observer.disconnect();
    };
  }, [videos.length, handleScroll]);

  // Add touch/swipe support
  useEffect(() => {
    let startY = 0;
    let endY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endY = e.changedTouches[0].clientY;
      const diff = startY - endY;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
          // Swipe up - next video
          handleScroll('down');
        } else {
          // Swipe down - previous video
          handleScroll('up');
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentVideoIndex, videos.length]);

  // Lock/unlock page scroll
  useEffect(() => {
    if (isScrollLocked) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isScrollLocked]);

  const formatDuration = (seconds: number, videoIndex?: number, videoId?: string) => {
    // If duration is 0 or undefined, try to get it from stored durations first
    if ((!seconds || seconds === 0) && videoId && videoDurations[videoId]) {
      seconds = videoDurations[videoId];
    }
    
    // If still no duration, try to get it from the video element
    if (!seconds || seconds === 0) {
      if (videoIndex !== undefined) {
        const videoElement = videoRefs.current[videoIndex];
        if (videoElement && videoElement.duration && !isNaN(videoElement.duration)) {
          seconds = videoElement.duration;
        }
      }
    }
    
    // If still no valid duration, return "0:00"
    if (!seconds || seconds === 0 || isNaN(seconds)) {
      return "0:00";
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
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

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setShowVideoPopup(true);
  };

  const handleClosePopup = () => {
    setShowVideoPopup(false);
    setSelectedVideo(null);
    if (popupVideoRef.current) {
      popupVideoRef.current.pause();
    }
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
    <div className="min-h-screen bg-black text-white relative">
      {/* Video Container */}
      <div 
        ref={containerRef}
        className="video-container shorts-container scrollbar-hide"
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            data-video-index={index}
            className="shorts-item"
          >
            <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl mx-auto px-4 gap-6 h-full pb-[50px]">
              {/* Video Player */}
              <div className="relative flex-shrink-0">
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  className="w-full max-w-sm h-[80vh] object-cover rounded-lg"
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
                    // Capture video duration when metadata is loaded
                    const videoElement = videoRefs.current[index];
                    if (videoElement && videoElement.duration && !isNaN(videoElement.duration)) {
                      setVideoDurations(prev => ({
                        ...prev,
                        [video.id]: videoElement.duration
                      }));
                    }
                    
                    // Auto-play if this is the first video and no video is currently playing
                    if (index === 0 && currentVideoIndex === 0) {
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
                    {formatDuration(video.duration, index, video.id)}
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
                  <h3 className="text-white font-semibold text-xl mb-3 line-clamp-3">
                    {video.title}
                  </h3>
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
                </div>


              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-3">
        {/* View Library Button */}
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full shadow-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          View Library
        </button>

        {/* Unlock Scroll Button */}
        <button
          onClick={() => setIsScrollLocked(!isScrollLocked)}
          className="bg-today-500 hover:bg-today-600 text-white px-4 py-2 rounded-full shadow-lg transition-colors duration-200 flex items-center gap-2"
        >
          {isScrollLocked ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Unlock Scroll
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Lock Scroll
            </>
          )}
        </button>
      </div>

      {/* Library View */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Video Library</h2>
              <button
                onClick={() => setShowLibrary(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors"
              >
                Close
              </button>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                >
                  <div className="relative aspect-[9/16]">
                    <video
                      src={video.videoUrl}
                      poster={video.thumbnailUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Duration Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/80 text-white text-xs">
                        {formatDuration(video.duration, videos.indexOf(video), video.id)}
                      </Badge>
                    </div>
                    
                    {/* View Count */}
                    <div className="absolute top-2 left-2">
                      <div className="flex items-center gap-1 text-white text-xs bg-black/50 px-2 py-1 rounded">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(video.views)}</span>
                      </div>
                    </div>
                    
                    {/* Video Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-300 text-xs line-clamp-2 mb-2">
                        {video.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="truncate">{video.authorName}</span>
                        <span>{formatDistanceToNow(video.publishedAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video Popup */}
      {showVideoPopup && selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full">
            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video Player */}
            <div className="relative">
              <video
                ref={popupVideoRef}
                src={selectedVideo.videoUrl}
                poster={selectedVideo.thumbnailUrl}
                className="w-full aspect-[9/16] object-cover rounded-lg"
                loop
                playsInline
                autoPlay
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => {
                    if (popupVideoRef.current) {
                      if (isPlaying) {
                        popupVideoRef.current.pause();
                        setIsPlaying(false);
                      } else {
                        popupVideoRef.current.play();
                        setIsPlaying(true);
                      }
                    }
                  }}
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
                className="absolute top-4 left-4 bg-black/50 rounded-full p-2 text-white"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Duration Badge */}
              <div className="absolute top-4 left-16">
                <Badge className="bg-black/80 text-white text-xs">
                  {formatDuration(selectedVideo.duration, videos.indexOf(selectedVideo), selectedVideo.id)}
                </Badge>
              </div>
            </div>

            {/* Video Info */}
            <div className="mt-4 text-white">
              <h3 className="text-xl font-semibold mb-2">{selectedVideo.title}</h3>
              <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{selectedVideo.authorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(selectedVideo.publishedAt, { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(selectedVideo.views)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 