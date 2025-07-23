"use client";

import Image from "next/image";
import { getTeamById } from "@/lib/teams-config";
import { cn } from "@/lib/utils";

interface TeamLogoProps {
  teamId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  clickable?: boolean;
}

export function TeamLogo({ 
  teamId, 
  size = 'md', 
  className,
  showName = false,
  clickable = true 
}: TeamLogoProps) {
  const team = getTeamById(teamId);
  
  if (!team) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-800 rounded-lg",
        size === 'sm' && "w-12 h-12",
        size === 'md' && "w-18 h-18", 
        size === 'lg' && "w-24 h-24",
        size === 'xl' && "w-36 h-36",
        className
      )}>
        <span className="text-xs text-gray-400">?</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-18 h-18", 
    lg: "w-24 h-24",
    xl: "w-36 h-36"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base", 
    xl: "text-lg"
  };

  const logoElement = (
    <div className={cn(
      "flex items-center gap-2",
      showName && "flex-col text-center"
    )}>
      <div className={cn(
        "relative overflow-hidden rounded-lg",
        sizeClasses[size],
        clickable && "cursor-pointer hover:scale-105 transition-transform duration-200",
        className
      )}>
        <Image
          src={team.logo}
          alt={`${team.name} logo`}
          fill
          className="object-contain p-1"
        />
      </div>
      {showName && (
        <span className={cn(
          "font-medium text-white",
          textSizes[size]
        )}>
          {team.shortName}
        </span>
      )}
    </div>
  );

  if (clickable) {
    return (
      <a
        href={team.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
        title={`Visit ${team.name} on Instagram`}
      >
        {logoElement}
      </a>
    );
  }

  return logoElement;
} 