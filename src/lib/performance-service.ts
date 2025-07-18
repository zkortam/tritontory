"use client";

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  domContentLoaded: number;
  windowLoad: number;
}

export interface ResourceMetrics {
  name: string;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'other';
  size: number;
  duration: number;
  startTime: number;
  transferSize: number;
}

export class PerformanceService {
  private static instance: PerformanceService;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private resourceMetrics: Map<string, ResourceMetrics[]> = new Map();

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // Measure page load performance
  measurePageLoad(pageName: string): PerformanceMetrics | null {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    const largestContentfulPaint = performance.getEntriesByType('largest-contentful-paint')[0] as PerformanceEntry;

    const metrics: PerformanceMetrics = {
      pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: largestContentfulPaint?.startTime || 0,
      cumulativeLayoutShift: this.getCumulativeLayoutShift(),
      firstInputDelay: this.getFirstInputDelay(),
      timeToInteractive: navigation.domInteractive - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      windowLoad: navigation.loadEventEnd - navigation.fetchStart,
    };

    this.metrics.set(pageName, metrics);
    this.logPerformanceMetrics(pageName, metrics);
    return metrics;
  }

  // Measure resource loading performance
  measureResourceLoading(pageName: string): ResourceMetrics[] {
    if (typeof window === 'undefined' || !window.performance) {
      return [];
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resourceMetrics: ResourceMetrics[] = resources.map(resource => ({
      name: resource.name,
      type: this.getResourceType(resource.name),
      size: resource.transferSize,
      duration: resource.duration,
      startTime: resource.startTime,
      transferSize: resource.transferSize,
    }));

    this.resourceMetrics.set(pageName, resourceMetrics);
    this.logResourceMetrics(pageName, resourceMetrics);
    return resourceMetrics;
  }

  // Get cumulative layout shift
  private getCumulativeLayoutShift(): number {
    if (typeof window === 'undefined') return 0;

    // Use Performance Observer if available
    if ('PerformanceObserver' in window) {
      let cls = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as PerformanceEntry & {hadRecentInput?: boolean}).hadRecentInput) {
            cls += (entry as PerformanceEntry & {value?: number}).value || 0;
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      return cls;
    }

    return 0;
  }

  // Get first input delay
  private getFirstInputDelay(): number {
    if (typeof window === 'undefined') return 0;

    if ('PerformanceObserver' in window) {
      let fid = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            fid = (entry as PerformanceEntry & {processingStart?: number}).processingStart || 0 - entry.startTime;
            break;
          }
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
      return fid;
    }

    return 0;
  }

  // Determine resource type from URL
  private getResourceType(url: string): ResourceMetrics['type'] {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (extension === 'js') return 'script';
    if (extension === 'css') return 'stylesheet';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) return 'image';
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(extension || '')) return 'font';
    
    return 'other';
  }

  // Log performance metrics
  private logPerformanceMetrics(pageName: string, metrics: PerformanceMetrics) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metrics for ${pageName}:`, {
        pageLoadTime: `${metrics.pageLoadTime.toFixed(2)}ms`,
        firstContentfulPaint: `${metrics.firstContentfulPaint.toFixed(2)}ms`,
        largestContentfulPaint: `${metrics.largestContentfulPaint.toFixed(2)}ms`,
        cumulativeLayoutShift: metrics.cumulativeLayoutShift.toFixed(3),
        firstInputDelay: `${metrics.firstInputDelay.toFixed(2)}ms`,
        timeToInteractive: `${metrics.timeToInteractive.toFixed(2)}ms`,
      });
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendMetricsToAnalytics(pageName, metrics);
    }
  }

  // Log resource metrics
  private logResourceMetrics(pageName: string, metrics: ResourceMetrics[]) {
    if (process.env.NODE_ENV === 'development') {
      const totalSize = metrics.reduce((sum, resource) => sum + resource.size, 0);
      const totalDuration = metrics.reduce((sum, resource) => sum + resource.duration, 0);

      console.log(`Resource Metrics for ${pageName}:`, {
        totalResources: metrics.length,
        totalSize: `${(totalSize / 1024).toFixed(2)}KB`,
        totalDuration: `${totalDuration.toFixed(2)}ms`,
        averageSize: `${(totalSize / metrics.length / 1024).toFixed(2)}KB`,
        averageDuration: `${(totalDuration / metrics.length).toFixed(2)}ms`,
      });

      // Group by type
      const byType = metrics.reduce((acc, resource) => {
        acc[resource.type] = (acc[resource.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('Resources by type:', byType);
    }
  }

  // Send metrics to analytics service
  private async sendMetricsToAnalytics(pageName: string, metrics: PerformanceMetrics) {
    try {
      // This would integrate with your analytics service
      // For now, we'll just log it in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Sending performance metrics to analytics:', {
          pageName,
          metrics,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending performance metrics:', error);
      }
    }
  }

  // Get performance metrics for a page
  getMetrics(pageName: string): PerformanceMetrics | undefined {
    return this.metrics.get(pageName);
  }

  // Get resource metrics for a page
  getResourceMetrics(pageName: string): ResourceMetrics[] | undefined {
    return this.resourceMetrics.get(pageName);
  }

  // Get all metrics
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return this.metrics;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
    this.resourceMetrics.clear();
  }

  // Check if performance is good
  isPerformanceGood(metrics: PerformanceMetrics): boolean {
    return (
      metrics.pageLoadTime < 3000 &&
      metrics.firstContentfulPaint < 1800 &&
      metrics.largestContentfulPaint < 2500 &&
      metrics.cumulativeLayoutShift < 0.1 &&
      metrics.firstInputDelay < 100
    );
  }

  // Get performance score (0-100)
  getPerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // Deduct points for poor performance
    if (metrics.pageLoadTime > 3000) score -= 20;
    if (metrics.firstContentfulPaint > 1800) score -= 20;
    if (metrics.largestContentfulPaint > 2500) score -= 20;
    if (metrics.cumulativeLayoutShift > 0.1) score -= 20;
    if (metrics.firstInputDelay > 100) score -= 20;

    return Math.max(0, score);
  }

  // Monitor long tasks
  monitorLongTasks(callback?: (task: PerformanceEntry) => void): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn('Long task detected:', {
            name: entry.name,
            duration: `${entry.duration.toFixed(2)}ms`,
            startTime: entry.startTime,
          });

          if (callback) {
            callback(entry);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  // Monitor memory usage
  monitorMemoryUsage(): void {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return;
    }

    const memory = (performance as Performance & {memory?: {usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number}}).memory;
    if (memory) {
      console.log('Memory usage:', {
        usedJSHeapSize: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        totalJSHeapSize: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      });
    }
  }

  // Optimize images
  optimizeImages(): void {
    if (typeof window === 'undefined') return;

    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      // Add loading="lazy" if not already present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }

      // Add decoding="async" if not already present
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  // Preload critical resources
  preloadCriticalResources(resources: string[]): void {
    if (typeof window === 'undefined') return;

    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = this.getResourceType(resource);
      document.head.appendChild(link);
    });
  }

  // Debounce function calls
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function calls
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// Export singleton instance
export const performanceService = PerformanceService.getInstance(); 