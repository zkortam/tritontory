"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface MobileTouchFeedbackProps {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onTap?: () => void;
  disabled?: boolean;
}

export function MobileTouchFeedback({ 
  children, 
  className = "", 
  activeClassName = "scale-95 opacity-80",
  onTap,
  disabled = false 
}: MobileTouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    if (!disabled) {
      setIsPressed(false);
      onTap?.();
    }
  };

  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    if (!disabled) {
      setIsPressed(false);
      onTap?.();
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setIsPressed(false);
    }
  };

  return (
    <div
      className={cn(
        "mobile-touch-target transition-all duration-150 ease-out mobile-gpu-accelerated",
        isPressed && activeClassName,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        WebkitTapHighlightColor: "transparent",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none"
      }}
    >
      {children}
    </div>
  );
}

export function MobileButton({ 
  children, 
  className = "", 
  variant = "default",
  size = "md",
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const baseClasses = "mobile-touch-target font-medium transition-all duration-200 mobile-gpu-accelerated";
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={{
        WebkitTapHighlightColor: "transparent",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none"
      }}
      {...props}
    >
      {children}
    </button>
  );
} 