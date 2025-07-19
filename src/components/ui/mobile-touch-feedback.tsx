"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MobileTouchFeedbackProps {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onTap?: () => void;
  disabled?: boolean;
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
  delay?: number;
}

export function MobileTouchFeedback({ 
  children, 
  className = "", 
  activeClassName = "scale-95 opacity-80",
  onTap,
  disabled = false,
  hapticFeedback = true,
  rippleEffect = true,
  delay = 150
}: MobileTouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleId = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Haptic feedback function
  const triggerHapticFeedback = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration for feedback
    }
  };

  // Add ripple effect
  const addRipple = (event: React.MouseEvent | React.TouchEvent) => {
    if (!rippleEffect) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    let x: number, y: number;
    
    if ('touches' in event) {
      // TouchEvent
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      // MouseEvent
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    const newRipple = { id: rippleId.current++, x, y };
    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (!disabled) {
      setIsPressed(true);
      addRipple(event);
      triggerHapticFeedback();
    }
  };

  const handleTouchEnd = () => {
    if (!disabled) {
      setIsPressed(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onTap?.();
      }, delay);
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (!disabled) {
      setIsPressed(true);
      addRipple(event);
    }
  };

  const handleMouseUp = () => {
    if (!disabled) {
      setIsPressed(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onTap?.();
      }, delay);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setIsPressed(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "mobile-touch-target transition-all duration-150 ease-out mobile-gpu-accelerated relative overflow-hidden",
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
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/20 rounded-full pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '600ms'
          }}
        />
      ))}
    </div>
  );
}

export function MobileButton({ 
  children, 
  className = "", 
  variant = "default",
  size = "md",
  hapticFeedback = true,
  rippleEffect = true,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
}) {
  const baseClasses = "mobile-touch-target font-medium transition-all duration-200 mobile-gpu-accelerated mobile-button";
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  };

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8"
  };

  return (
    <MobileTouchFeedback
      hapticFeedback={hapticFeedback}
      rippleEffect={rippleEffect}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </MobileTouchFeedback>
  );
}

// Enhanced mobile card component
export function MobileCard({ 
  children, 
  className = "", 
  interactive = true,
  hapticFeedback = true,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  hapticFeedback?: boolean;
}) {
  const baseClasses = "mobile-card bg-card text-card-foreground border border-border rounded-lg shadow-sm";
  
  if (!interactive) {
    return (
      <div className={cn(baseClasses, className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <MobileTouchFeedback
      hapticFeedback={hapticFeedback}
      className={cn(baseClasses, "hover:shadow-md transition-shadow duration-200", className)}
      {...props}
    >
      {children}
    </MobileTouchFeedback>
  );
} 