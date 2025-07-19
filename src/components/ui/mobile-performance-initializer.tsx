"use client";

import { useEffect } from "react";
import { mobileOptimizations } from "@/lib/mobile-performance";

export function MobilePerformanceInitializer() {
  useEffect(() => {
    // Enable mobile optimizations
    mobileOptimizations.enableMobileOptimizations();
    
    // Preload critical resources
    mobileOptimizations.preloadCriticalResources();
    
    // Optimize images
    mobileOptimizations.optimizeImages();
    
    // Add mobile-specific meta tags
    const meta = document.createElement('meta');
    meta.name = 'mobile-web-app-capable';
    meta.content = 'yes';
    document.head.appendChild(meta);
    
    const meta2 = document.createElement('meta');
    meta2.name = 'apple-mobile-web-app-capable';
    meta2.content = 'yes';
    document.head.appendChild(meta2);
    
    const meta3 = document.createElement('meta');
    meta3.name = 'apple-mobile-web-app-status-bar-style';
    meta3.content = 'black-translucent';
    document.head.appendChild(meta3);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(meta);
      document.head.removeChild(meta2);
      document.head.removeChild(meta3);
    };
  }, []);

  return null;
} 