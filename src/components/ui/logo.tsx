"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type LogoVariant = "default" | "white" | "primary";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  href?: string;
}

const sizeClasses: Record<LogoSize, string> = {
  xs: "h-6 w-auto",
  sm: "h-8 w-auto",
  md: "h-10 w-auto",
  lg: "h-12 w-auto",
  xl: "h-16 w-auto",
};

const variantClasses: Record<LogoVariant, string> = {
  default: "", // Removed filter temporarily
  white: "", // Removed filter temporarily
  primary: "", // Removed filter temporarily
};

// Inline SVG fallback logo
const InlineLogo = ({ size, className }: { size: LogoSize; className?: string }) => (
  <svg
    viewBox="0 0 200 200"
    className={cn(sizeClasses[size], className)}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="4"/>
    <text x="100" y="110" textAnchor="middle" fontSize="24" fontWeight="bold" fill="currentColor">
      TT
    </text>
  </svg>
);

export function Logo({
  variant = "default",
  size = "md",
  className,
  href = "/"
}: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(0);
  
  // Array of logo sources to try in order (smallest first for faster loading)
  const logoSources = [
    "/logo-tiny.png",
    "/logo-small.webp",
    "/logo-small.png", 
    "/logo.png",
    "/logo.svg"
  ];

  const logoImage = imageError ? (
    <InlineLogo size={size} className={className} />
  ) : (
    <Image
      src={logoSources[currentSrc]}
      alt="Triton Tory Media"
      width={40}
      height={40}
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      priority
      unoptimized={false}
      onLoad={() => {
        console.log(`Logo loaded successfully from: ${logoSources[currentSrc]}`);
      }}
      onError={() => {
        console.error(`Logo failed to load from: ${logoSources[currentSrc]}`);
        if (currentSrc < logoSources.length - 1) {
          console.log(`Trying next source: ${logoSources[currentSrc + 1]}`);
          setCurrentSrc(currentSrc + 1);
        } else {
          console.error('All logo sources failed, using SVG fallback');
          setImageError(true);
        }
      }}
    />
  );

  if (href) {
    return (
      <Link href={href} className="no-underline">
        {logoImage}
      </Link>
    );
  }

  return logoImage;
}
