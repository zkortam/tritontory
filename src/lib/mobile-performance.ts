"use client";

import { useEffect, useRef, useState } from "react";

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export function useMobilePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      const largestContentfulPaint = performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0;
      
      // Calculate Cumulative Layout Shift
      let cumulativeLayoutShift = 0;
      const layoutShiftEntries = performance.getEntriesByType('layout-shift');
      layoutShiftEntries.forEach((entry: unknown) => {
        const layoutShift = entry as { hadRecentInput?: boolean; value?: number };
        if (!layoutShift.hadRecentInput && layoutShift.value) {
          cumulativeLayoutShift += layoutShift.value;
        }
      });

      const metrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint,
        largestContentfulPaint,
        cumulativeLayoutShift,
        firstInputDelay: 0, // Will be updated by observer
        timeToInteractive: navigation.domInteractive - navigation.fetchStart
      };

      setMetrics(metrics);
      setIsLoading(false);
    };

    // Set up Performance Observer for First Input Delay
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: unknown) => {
          const firstInput = entry as { entryType?: string; processingStart?: number; startTime?: number };
          if (firstInput.entryType === 'first-input' && typeof firstInput.processingStart === 'number' && typeof firstInput.startTime === 'number') {
            setMetrics(prev => prev ? {
              ...prev,
              firstInputDelay: (firstInput.processingStart || 0) - (firstInput.startTime || 0)
            } : null);
          }
        });
      });

      observerRef.current.observe({ entryTypes: ['first-input'] });
    }

    // Measure performance after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  const logPerformance = () => {
    if (metrics) {
      console.log('Mobile Performance Metrics:', {
        'Load Time': `${metrics.loadTime.toFixed(2)}ms`,
        'First Contentful Paint': `${metrics.firstContentfulPaint.toFixed(2)}ms`,
        'Largest Contentful Paint': `${metrics.largestContentfulPaint.toFixed(2)}ms`,
        'Cumulative Layout Shift': metrics.cumulativeLayoutShift.toFixed(3),
        'First Input Delay': `${metrics.firstInputDelay.toFixed(2)}ms`,
        'Time to Interactive': `${metrics.timeToInteractive.toFixed(2)}ms`
      });
    }
  };

  return { metrics, isLoading, logPerformance };
}

export function useMobileNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
      
      if ('connection' in navigator) {
        const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
        setConnectionType(connection?.effectiveType || 'unknown');
      }
    };

    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  return { isOnline, connectionType };
}

export function useMobileBatteryStatus() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('getBattery' in navigator)) return;

    const getBatteryInfo = async () => {
      try {
        const battery = await (navigator as Navigator & { getBattery(): Promise<{ level: number; charging: boolean; addEventListener: (event: string, callback: () => void) => void; removeEventListener: (event: string, callback: () => void) => void }> }).getBattery();
        
        const updateBatteryInfo = () => {
          setBatteryLevel(battery.level);
          setIsCharging(battery.charging);
        };

        updateBatteryInfo();

        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);

        return () => {
          battery.removeEventListener('levelchange', updateBatteryInfo);
          battery.removeEventListener('chargingchange', updateBatteryInfo);
        };
      } catch (error) {
        console.warn('Battery API not supported:', error);
      }
    };

    getBatteryInfo();
  }, []);

  return { batteryLevel, isCharging };
}

// Mobile optimization utilities
export const mobileOptimizations = {
  // Preload critical resources
  preloadCriticalResources: () => {
    if (typeof window === 'undefined') return;
    
    const criticalResources = [
      '/api/stocks/yahoo',
      '/api/weather/test'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  },

  // Optimize images for mobile
  optimizeImages: () => {
    if (typeof window === 'undefined') return;
    
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.loading = 'lazy';
      img.decoding = 'async';
      
      // Add mobile-specific image optimization
      if (window.innerWidth <= 768) {
        // Use smaller images on mobile
        const src = img.getAttribute('src');
        if (src && !src.includes('w=')) {
          img.src = `${src}?w=400&q=80`;
        }
      }
    });
  },

  // Enable mobile-specific optimizations
  enableMobileOptimizations: () => {
    if (typeof window === 'undefined') return;
    
    // Add mobile-specific classes
    document.body.classList.add('mobile-optimized');
    
    // Optimize scroll performance
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    }

    // Optimize for mobile networks
    if ('connection' in navigator) {
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
      if (connection?.saveData) {
        // Disable non-essential animations and reduce image quality
        document.body.classList.add('save-data-mode');
      }
    }

    // Add mobile-specific meta tags
    const metaTags = [
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'theme-color', content: '#000000' },
      { name: 'msapplication-TileColor', content: '#000000' }
    ];

    metaTags.forEach(tag => {
      if (!document.querySelector(`meta[name="${tag.name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
  },

  // Optimize for slow networks
  optimizeForSlowNetwork: () => {
    if (typeof window === 'undefined') return;
    
    if ('connection' in navigator) {
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
      const isSlowNetwork = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
      
      if (isSlowNetwork) {
        document.body.classList.add('slow-network-mode');
        // Disable non-essential features
        const nonEssentialElements = document.querySelectorAll('.non-essential');
        nonEssentialElements.forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
      }
    }
  },

  // Optimize battery usage
  optimizeBatteryUsage: () => {
    if (typeof window === 'undefined' || !('getBattery' in navigator)) return;
    
    const getBatteryInfo = async () => {
      try {
        const battery = await (navigator as Navigator & { getBattery(): Promise<{ level: number; charging: boolean; addEventListener: (event: string, callback: () => void) => void; removeEventListener: (event: string, callback: () => void) => void }> }).getBattery();
        
        if (battery.level < 0.2 && !battery.charging) {
          // Low battery mode
          document.body.classList.add('low-battery-mode');
          // Reduce animations and non-essential features
          const animations = document.querySelectorAll('.reduce-on-low-battery');
          animations.forEach(el => {
            (el as HTMLElement).style.animation = 'none';
          });
        }
      } catch (error) {
        console.warn('Battery API not supported:', error);
      }
    };

    getBatteryInfo();
  },

  // Add mobile-specific event listeners
  addMobileEventListeners: () => {
    if (typeof window === 'undefined') return;
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        // Recalculate layouts after orientation change
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });

    // Handle visibility changes (app switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // App is in background, pause non-essential operations
        document.body.classList.add('app-background');
      } else {
        // App is in foreground
        document.body.classList.remove('app-background');
      }
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      document.body.classList.remove('offline-mode');
      document.body.classList.add('online-mode');
    });

    window.addEventListener('offline', () => {
      document.body.classList.remove('online-mode');
      document.body.classList.add('offline-mode');
    });
  },

  // Initialize all mobile optimizations
  initialize: () => {
    mobileOptimizations.enableMobileOptimizations();
    mobileOptimizations.preloadCriticalResources();
    mobileOptimizations.optimizeImages();
    mobileOptimizations.optimizeForSlowNetwork();
    mobileOptimizations.optimizeBatteryUsage();
    mobileOptimizations.addMobileEventListeners();
  }
}; 