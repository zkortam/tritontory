"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Avatar.displayName = "Avatar"

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => (
          <img
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        alt=""
        {...props}
      />
  )
)
AvatarImage.displayName = "AvatarImage"

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gray-700 text-gray-300",
        className
      )}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

// Custom avatar component with colored background and initials
interface CustomAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (name?: string): string => {
  if (!name) return 'bg-gray-600';
  
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];
  
  // Generate consistent color based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg' | 'xl'): string => {
  switch (size) {
    case 'sm': return 'h-8 w-8 text-sm';
    case 'md': return 'h-10 w-10 text-base';
    case 'lg': return 'h-12 w-12 text-lg';
    case 'xl': return 'h-16 w-16 text-xl';
    default: return 'h-10 w-10 text-base';
  }
};

const CustomAvatar = React.forwardRef<HTMLDivElement, CustomAvatarProps>(
  ({ name, imageUrl, size = 'md', className, ...props }, ref) => {
    const initials = getInitials(name);
    const colorClass = getAvatarColor(name);
    const sizeClasses = getSizeClasses(size);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses,
          className
        )}
        {...props}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div className={cn(
            "flex h-full w-full items-center justify-center rounded-full text-white font-semibold",
            colorClass
          )}>
            {initials}
          </div>
        )}
      </div>
    );
  }
);
CustomAvatar.displayName = "CustomAvatar"

export { Avatar, AvatarImage, AvatarFallback, CustomAvatar } 