"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";
import { UserProfileService } from "@/lib/firebase-service";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetId: string;
  followType: 'user' | 'topic' | 'department';
  initialIsFollowing?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  children?: React.ReactNode;
}

export function FollowButton({
  targetId,
  followType,
  initialIsFollowing = false,
  size = 'default',
  variant = 'outline',
  className,
  children
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is following this target
    if (user) {
      checkFollowStatus();
    }
  }, [user, targetId, followType]);

  const checkFollowStatus = async () => {
    if (!user) return;
    
    try {
      const following = await UserProfileService.isFollowing(
        user.uid,
        targetId,
        followType
      );
      setIsFollowing(following);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      // Could show a sign-in prompt here
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        await UserProfileService.unfollow(user.uid, targetId, followType);
      } else {
        await UserProfileService.follow(user.uid, targetId, followType);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFollowTypeLabel = () => {
    switch (followType) {
      case 'user': return 'Follow';
      case 'topic': return 'Follow Topic';
      case 'department': return 'Follow Department';
      default: return 'Follow';
    }
  };

  const getUnfollowTypeLabel = () => {
    switch (followType) {
      case 'user': return 'Following';
      case 'topic': return 'Following Topic';
      case 'department': return 'Following Department';
      default: return 'Following';
    }
  };

  return (
    <Button
      onClick={handleFollow}
      variant={isFollowing ? "outline" : variant}
      size={size}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        isFollowing && "border-gray-600 text-gray-300",
        !isFollowing && "hover:bg-primary/90",
        className
      )}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          <span>{children || getUnfollowTypeLabel()}</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>{children || getFollowTypeLabel()}</span>
        </>
      )}
    </Button>
  );
} 