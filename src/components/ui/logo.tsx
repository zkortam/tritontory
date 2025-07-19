"use client";

import Link from "next/link";
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
  default: "",
  white: "",
  primary: "",
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
  
  // Use the most reliable logo source
  const logoSrc = "/logo-small.png";

  const logoImage = imageError ? (
    <InlineLogo size={size} className={className} />
  ) : (
    <img
      src={logoSrc}
      alt="Triton Tory Media"
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onLoad={() => {
        console.log(`Logo loaded successfully from: ${logoSrc}`);
      }}
      onError={(e) => {
        console.error(`Logo failed to load from: ${logoSrc}`, e);
        setImageError(true);
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
