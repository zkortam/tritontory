"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { EnhancedContentService } from "@/lib/firebase-service";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
  initialLikes: number;
  initialHasLiked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function LikeButton({
  contentId,
  contentType,
  initialLikes,
  initialHasLiked = false,
  size = 'md',
  variant = 'ghost',
  className
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user has liked this content
    if (user) {
      checkLikeStatus();
    }
  }, [user, contentId]);

  const checkLikeStatus = async () => {
    if (!user) return;
    
    try {
      const liked = await EnhancedContentService.hasLiked(contentId, contentType, user.uid);
      setHasLiked(liked);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      // Could show a sign-in prompt here
      return;
    }

    setIsLoading(true);
    try {
      await EnhancedContentService.toggleLike(contentId, contentType, user.uid);
      
      // Optimistically update UI
      setLikes(prev => hasLiked ? prev - 1 : prev + 1);
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on error
      setLikes(prev => hasLiked ? prev + 1 : prev - 1);
      setHasLiked(hasLiked);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const buttonSize = size === 'md' ? 'default' : size;

  return (
    <Button
      onClick={handleLike}
      variant={variant}
      size={buttonSize}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        hasLiked && "text-red-400 hover:text-red-300",
        !hasLiked && "text-gray-400 hover:text-gray-300",
        className
      )}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          hasLiked && "fill-current",
          isLoading && "animate-pulse"
        )} 
      />
      <span className="font-medium">
        {likes.toLocaleString()}
      </span>
    </Button>
  );
} 