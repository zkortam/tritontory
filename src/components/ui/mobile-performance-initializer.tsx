"use client";

import { useEffect } from "react";
import { mobileOptimizations } from "@/lib/mobile-performance";

export function MobilePerformanceInitializer() {
  useEffect(() => {
    // Initialize all mobile optimizations
    mobileOptimizations.initialize();
    
    // Clean up on unmount
    return () => {
      // Remove mobile-specific classes
      document.body.classList.remove('mobile-optimized', 'save-data-mode', 'slow-network-mode', 'low-battery-mode', 'app-background', 'online-mode', 'offline-mode');
    };
  }, []);

  return null;
} 