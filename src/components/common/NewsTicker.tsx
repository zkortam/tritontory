"use client";

import { useEffect, useRef } from "react";
import type { NewsTicker } from "@/lib/models";


interface NewsTickerProps {
  tickers: NewsTicker[];
}

export function NewsTicker({ tickers }: NewsTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeTickers = tickers.filter(ticker => ticker.isActive);

  // Fallback tickers if none exist
  const displayTickers = activeTickers.length > 0 ? activeTickers : [
    {
      id: "fallback",
      text: "Welcome to Triton Tory - UC San Diego's Premier Student Media • Breaking: New campus initiatives announced • Sports: Tritons advance to finals • Campus: Student center opening next month",
      priority: "medium" as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  useEffect(() => {
    if (!scrollRef.current) return;

    const scrollElement = scrollRef.current;
    let animationId: number;
    let currentPosition = 0;

    const scroll = () => {
      currentPosition += 0.5; // Slower scroll speed
      
      // Reset when we reach the end
      if (currentPosition >= scrollElement.scrollWidth - scrollElement.clientWidth) {
        currentPosition = 0;
      }
      
      scrollElement.scrollLeft = currentPosition;
      animationId = requestAnimationFrame(scroll);
    };

    // Start scrolling after a delay - always scroll regardless of content length
    const timeoutId = setTimeout(() => {
      console.log("Starting ticker scroll, element width:", scrollElement.scrollWidth, "client width:", scrollElement.clientWidth);
      animationId = requestAnimationFrame(scroll);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [displayTickers.length]);

  const priorityColors = {
    low: "bg-blue-600",
    medium: "bg-yellow-600",
    high: "bg-orange-600",
    breaking: "bg-red-600"
  };

  return (
    <div className={`${priorityColors[displayTickers[0].priority]} text-white py-1.5 px-4 overflow-hidden mobile-gpu-accelerated`}>
      <div 
        ref={scrollRef}
        className="flex items-center whitespace-nowrap overflow-hidden mobile-smooth-scroll"
        style={{ 
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Multiple repetitions to ensure continuous scrolling */}
        {[...Array(4)].map((_, repeatIndex) => (
          <div key={repeatIndex} className="flex items-center space-x-3 flex-shrink-0 mr-8">
            <span className="font-medium text-sm">
              {displayTickers.map((ticker, index) => (
                <span key={`${repeatIndex}-${ticker.id}`}>
                  {ticker.text}
                  {index < displayTickers.length - 1 && <span className="text-white/50 mx-4">•</span>}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 