import { Loader2 } from "lucide-react";

interface MobileLoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function MobileLoading({ size = "md", text, className = "" }: MobileLoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 mobile-gpu-accelerated ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mb-2`} />
      {text && (
        <p className="text-sm text-gray-400 text-center mobile-text">{text}</p>
      )}
    </div>
  );
}

export function MobileSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-800/50 rounded-lg mobile-gpu-accelerated ${className}`} />
  );
}

export function MobileCardSkeleton() {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 p-4 rounded-lg mobile-gpu-accelerated">
      <div className="h-4 bg-gray-800/50 rounded animate-pulse mb-2" />
      <div className="h-4 bg-gray-800/50 rounded animate-pulse w-3/4 mb-4" />
      <div className="h-3 bg-gray-800/50 rounded animate-pulse w-1/2" />
    </div>
  );
} 