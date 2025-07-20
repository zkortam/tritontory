"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { VideoService } from "@/lib/firebase-service";
import { Video } from "@/lib/models";
import { Badge } from "@/components/ui/badge";
import { 
  Menu,
  ChevronUp,
  ChevronDown,
  Home
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function TritonTodayPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [nextVideoIndex, setNextVideoIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollAnimationRef = useRef<number>();

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
        videoRef.currentTime = 0;
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

  const handleScroll = useCallback((direction: 'up' | 'down') => {
    if (isScrolling || isTransitioning) return; // Prevent multiple scrolls
    
    setIsScrolling(true);
    setIsTransitioning(true);
    
    if (direction === 'down' && currentVideoIndex < videos.length - 1) {
      // Scroll to next video
      const nextIndex = currentVideoIndex + 1;
      setNextVideoIndex(nextIndex);
      
      // Animate current video up and next video in
      const startTime = performance.now();
      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / 400, 1); // 400ms animation
        
        // Smooth easing
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        // Move current video up and next video in
        setScrollOffset(-100 * easeOut);
        
        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(animateScroll);
        } else {
          // Complete the transition
          setCurrentVideoIndex(nextIndex);
          setNextVideoIndex(null);
          setScrollOffset(0);
          setIsScrolling(false);
          setIsTransitioning(false);
        }
      };
      
      scrollAnimationRef.current = requestAnimationFrame(animateScroll);
    } else if (direction === 'up' && currentVideoIndex > 0) {
      // Scroll to previous video
      const prevIndex = currentVideoIndex - 1;
      setNextVideoIndex(prevIndex);
      
      // Animate current video down and previous video in
      const startTime = performance.now();
      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / 400, 1); // 400ms animation
        
        // Smooth easing
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        // Move current video down and previous video in
        setScrollOffset(100 * easeOut);
        
        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(animateScroll);
        } else {
          // Complete the transition
          setCurrentVideoIndex(prevIndex);
          setNextVideoIndex(null);
          setScrollOffset(0);
          setIsScrolling(false);
          setIsTransitioning(false);
        }
      };
      
      scrollAnimationRef.current = requestAnimationFrame(animateScroll);
    } else {
      setIsScrolling(false);
      setIsTransitioning(false);
    }
  }, [currentVideoIndex, videos.length, isScrolling, isTransitioning]);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Touch/swipe handling with elastic effect
  useEffect(() => {
    let startY = 0;
    let startTime = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isDragging = true;
      resetControlsTimeout();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      const currentY = e.touches[0].clientY;
      const diff = startY - currentY;
      
      // Apply elastic resistance
      const resistance = 0.6;
      const elasticDiff = diff * resistance;
      
      setScrollOffset(elasticDiff);
      
      // Prepare next video for transition
      if (Math.abs(diff) > 10) {
        if (diff > 0 && currentVideoIndex < videos.length - 1) {
          // Swiping up - prepare next video
          setNextVideoIndex(currentVideoIndex + 1);
        } else if (diff < 0 && currentVideoIndex > 0) {
          // Swiping down - prepare previous video
          setNextVideoIndex(currentVideoIndex - 1);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      const diff = startY - endY;
      const duration = endTime - startTime;
      
      isDragging = false;
      
      console.log('Touch end:', { diff, duration, threshold: Math.abs(diff) > 50, quick: duration < 300 });
      
      // Only handle as swipe if it's quick and has enough distance
      if (duration < 300 && Math.abs(diff) > 20) {
        if (diff > 0) {
          // Swipe up - go to next video
          console.log('Swiping up to next video');
          handleScroll('down');
        } else {
          // Swipe down - go to previous video
          console.log('Swiping down to previous video');
          handleScroll('up');
        }
      } else {
        // Reset position with elastic animation
        const startOffset = scrollOffset;
        const resetStartTime = performance.now();
        
        const animateReset = (currentTime: number) => {
          const elapsed = currentTime - resetStartTime;
          const progress = Math.min(elapsed / 200, 1);
          
          // Elastic easing
          const easeOut = 1 - Math.pow(1 - progress, 3);
          
          setScrollOffset(startOffset * (1 - easeOut));
          
          if (progress < 1) {
            requestAnimationFrame(animateReset);
          } else {
            setScrollOffset(0);
            setNextVideoIndex(null);
          }
        };
        
        requestAnimationFrame(animateReset);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, [currentVideoIndex, videos.length, handleScroll]);

  // Lock body scroll for mobile
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Hide the navigation header on mobile for this page
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      
      // Restore header visibility when leaving the page
      if (header) {
        header.style.display = '';
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-today-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Videos Found</h1>
          <p className="text-gray-400">No videos available in this category.</p>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentVideoIndex];
  const nextVideo = nextVideoIndex !== null ? videos[nextVideoIndex] : null;

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Full Screen Video Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full mobile-video-scroll"
        onClick={resetControlsTimeout}
        style={{
          transform: `translateY(${scrollOffset}px)`,
          transition: isTransitioning ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {/* Current Video */}
        <div className="absolute inset-0">
          <video
            ref={(el) => {
              videoRefs.current[currentVideoIndex] = el;
            }}
            src={currentVideo.videoUrl}
            poster={currentVideo.thumbnailUrl}
            className="w-full h-full object-cover mobile-video-touch"
            loop
            playsInline
            muted={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              if (currentVideoIndex < videos.length - 1) {
                setCurrentVideoIndex(currentVideoIndex + 1);
              }
            }}
            onLoadedMetadata={() => {
              const videoElement = videoRefs.current[currentVideoIndex];
              if (videoElement && currentVideoIndex === 0) {
                videoElement.play().catch(() => {
                  // Auto-play failed, that's okay
                });
              }
            }}
            onClick={handleVideoClick}
          />
        </div>

        {/* Next Video (for smooth transitions) */}
        {nextVideo && (
          <div 
            className="absolute inset-0"
            style={{
              transform: `translateY(${scrollOffset > 0 ? -100 : 100}%)`,
              transition: 'none'
            }}
          >
            <video
              ref={(el) => {
                if (nextVideoIndex !== null) {
                  videoRefs.current[nextVideoIndex] = el;
                }
              }}
              src={nextVideo.videoUrl}
              poster={nextVideo.thumbnailUrl}
              className="w-full h-full object-cover"
              loop
              playsInline
              muted={true}
            />
          </div>
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

        {/* Top Controls - Only show on mobile */}
        <div className={`absolute top-0 left-0 right-0 z-20 transition-opacity duration-300 mobile-video-controls ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between p-4 pt-12">
            {/* Back/Home Button */}
            <Link 
              href="/"
              className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors mobile-touch-target"
            >
              <Home className="w-5 h-5" />
            </Link>

            {/* Menu Button */}
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors mobile-touch-target"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Video Info - TikTok Style - Moved Higher */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 mobile-video-info ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="p-4 pb-12">
            {/* Video Info */}
            <div className="mb-4">
              <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                {currentVideo.title}
              </h3>
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                {currentVideo.description}
              </p>
              
              {/* Author and Stats - Moved Higher */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-today-500 to-today-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {currentVideo.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{currentVideo.authorName}</div>
                    <div className="text-gray-400 text-xs">{formatDistanceToNow(currentVideo.publishedAt, { addSuffix: true })}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <Badge className="bg-today-500/90 text-white text-xs">
                    {currentVideo.category}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Swipe Indicators */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              {currentVideoIndex > 0 && (
                <div className="absolute top-20 text-white/60">
                  <ChevronUp className="w-6 h-6" />
                </div>
              )}
              {currentVideoIndex < videos.length - 1 && (
                <div className="absolute bottom-32 text-white/60">
                  <ChevronDown className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Floating Menu - Mobile Only */}
      {showMenu && (
        <div className="absolute top-20 right-4 z-30">
          <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[200px] border border-gray-800">
            <div className="space-y-3">
              <Link 
                href="/triton-tory"
                className="flex items-center space-x-3 text-white hover:text-today-400 transition-colors mobile-touch-target py-2"
                onClick={() => setShowMenu(false)}
              >
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <span className="text-sm">Triton Tory</span>
              </Link>
              
              <Link 
                href="/triton-science"
                className="flex items-center space-x-3 text-white hover:text-science-400 transition-colors mobile-touch-target py-2"
                onClick={() => setShowMenu(false)}
              >
                <div className="w-6 h-6 bg-science-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-sm">Science Journal</span>
              </Link>
              
              <Link 
                href="/triton-law"
                className="flex items-center space-x-3 text-white hover:text-law-400 transition-colors mobile-touch-target py-2"
                onClick={() => setShowMenu(false)}
              >
                <div className="w-6 h-6 bg-law-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">L</span>
                </div>
                <span className="text-sm">Law Review</span>
              </Link>
              
              <Link 
                href="/playground"
                className="flex items-center space-x-3 text-white hover:text-purple-400 transition-colors mobile-touch-target py-2"
                onClick={() => setShowMenu(false)}
              >
                <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <span className="text-sm">Playground</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 