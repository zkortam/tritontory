"use client";

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
  userAgent: string;
  touchSupport: boolean;
}

export interface ResponsiveConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  enableTouchGestures: boolean;
  enableSwipeNavigation: boolean;
  enablePullToRefresh: boolean;
  optimizeImages: boolean;
  lazyLoad: boolean;
}

export class ResponsiveService {
  private static instance: ResponsiveService;
  private deviceInfo: DeviceInfo | null = null;
  private config: ResponsiveConfig;
  private resizeObserver: ResizeObserver | null = null;
  private orientationChangeHandler: (() => void) | null = null;

  constructor() {
    this.config = {
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200,
      },
      enableTouchGestures: true,
      enableSwipeNavigation: true,
      enablePullToRefresh: true,
      optimizeImages: true,
      lazyLoad: true,
    };
  }

  static getInstance(): ResponsiveService {
    if (!ResponsiveService.instance) {
      ResponsiveService.instance = new ResponsiveService();
    }
    return ResponsiveService.instance;
  }

  // Initialize responsive service
  initialize(): void {
    if (typeof window === 'undefined') return;

    this.detectDevice();
    this.setupResizeObserver();
    this.setupOrientationChange();
    this.setupTouchGestures();
    this.optimizeForDevice();
  }

  // Detect device information
  detectDevice(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        width: 1920,
        height: 1080,
        orientation: 'landscape',
        pixelRatio: 1,
        userAgent: '',
        touchSupport: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent;
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const pixelRatio = window.devicePixelRatio || 1;

    let type: DeviceInfo['type'] = 'desktop';
    if (width <= this.config.breakpoints.mobile) {
      type = 'mobile';
    } else if (width <= this.config.breakpoints.tablet) {
      type = 'tablet';
    }

    const orientation: DeviceInfo['orientation'] = width > height ? 'landscape' : 'portrait';

    this.deviceInfo = {
      type,
      width,
      height,
      orientation,
      pixelRatio,
      userAgent,
      touchSupport,
    };

    return this.deviceInfo;
  }

  // Get current device info
  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  // Check if device is mobile
  isMobile(): boolean {
    return this.deviceInfo?.type === 'mobile';
  }

  // Check if device is tablet
  isTablet(): boolean {
    return this.deviceInfo?.type === 'tablet';
  }

  // Check if device is desktop
  isDesktop(): boolean {
    return this.deviceInfo?.type === 'desktop';
  }

  // Check if device supports touch
  hasTouchSupport(): boolean {
    return this.deviceInfo?.touchSupport || false;
  }

  // Check if device is in portrait mode
  isPortrait(): boolean {
    return this.deviceInfo?.orientation === 'portrait';
  }

  // Check if device is in landscape mode
  isLandscape(): boolean {
    return this.deviceInfo?.orientation === 'landscape';
  }

  // Setup resize observer
  private setupResizeObserver(): void {
    if (typeof window === 'undefined' || !('ResizeObserver' in window)) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.handleResize(width, height);
      }
    });

    this.resizeObserver.observe(document.body);
  }

  // Handle window resize
  private handleResize(width: number, height: number): void {
    if (!this.deviceInfo) return;

    const oldType = this.deviceInfo.type;
    const oldOrientation = this.deviceInfo.orientation;

    this.deviceInfo.width = width;
    this.deviceInfo.height = height;
    this.deviceInfo.orientation = width > height ? 'landscape' : 'portrait';

    // Update device type
    if (width <= this.config.breakpoints.mobile) {
      this.deviceInfo.type = 'mobile';
    } else if (width <= this.config.breakpoints.tablet) {
      this.deviceInfo.type = 'tablet';
    } else {
      this.deviceInfo.type = 'desktop';
    }

    // Handle device type change
    if (oldType !== this.deviceInfo.type) {
      this.handleDeviceTypeChange(oldType, this.deviceInfo.type);
    }

    // Handle orientation change
    if (oldOrientation !== this.deviceInfo.orientation) {
      this.handleOrientationChange(oldOrientation, this.deviceInfo.orientation);
    }

    // Update CSS custom properties
    this.updateCSSVariables();
  }

  // Setup orientation change detection
  private setupOrientationChange(): void {
    if (typeof window === 'undefined') return;

    this.orientationChangeHandler = () => {
      setTimeout(() => {
        this.detectDevice();
        this.updateCSSVariables();
      }, 100);
    };

    window.addEventListener('orientationchange', this.orientationChangeHandler);
  }

  // Handle device type change
  private handleDeviceTypeChange(oldType: string, newType: string): void {
    console.log(`Device type changed from ${oldType} to ${newType}`);
    
    // Update viewport meta tag for mobile
    if (newType === 'mobile') {
      this.updateViewportMeta();
    }

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('deviceTypeChange', {
      detail: { oldType, newType }
    }));
  }

  // Handle orientation change
  private handleOrientationChange(oldOrientation: string, newOrientation: string): void {
    console.log(`Orientation changed from ${oldOrientation} to ${newOrientation}`);
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('orientationChange', {
      detail: { oldOrientation, newOrientation }
    }));
  }

  // Update viewport meta tag
  private updateViewportMeta(): void {
    if (typeof window === 'undefined') return;

    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }

    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
  }

  // Update CSS custom properties
  private updateCSSVariables(): void {
    if (typeof window === 'undefined' || !this.deviceInfo) return;

    const root = document.documentElement;
    root.style.setProperty('--device-width', `${this.deviceInfo.width}px`);
    root.style.setProperty('--device-height', `${this.deviceInfo.height}px`);
    root.style.setProperty('--device-type', this.deviceInfo.type);
    root.style.setProperty('--device-orientation', this.deviceInfo.orientation);
    root.style.setProperty('--device-pixel-ratio', this.deviceInfo.pixelRatio.toString());
  }

  // Setup touch gestures
  private setupTouchGestures(): void {
    if (typeof window === 'undefined' || !this.config.enableTouchGestures) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const endTime = Date.now();
        const duration = endTime - startTime;
        const distanceX = endX - startX;
        const distanceY = endY - startY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Detect swipe gestures
        if (duration < 300 && distance > 50) {
          if (Math.abs(distanceX) > Math.abs(distanceY)) {
            // Horizontal swipe
            if (distanceX > 0) {
              this.handleSwipeRight();
            } else {
              this.handleSwipeLeft();
            }
          } else {
            // Vertical swipe
            if (distanceY > 0) {
              this.handleSwipeDown();
            } else {
              this.handleSwipeUp();
            }
          }
        }
      }
    }, { passive: true });
  }

  // Handle swipe gestures
  private handleSwipeLeft(): void {
    if (!this.config.enableSwipeNavigation) return;
    console.log('Swipe left detected');
    // Navigate to next page or open menu
    window.dispatchEvent(new CustomEvent('swipeLeft'));
  }

  private handleSwipeRight(): void {
    if (!this.config.enableSwipeNavigation) return;
    console.log('Swipe right detected');
    // Navigate to previous page or close menu
    window.dispatchEvent(new CustomEvent('swipeRight'));
  }

  private handleSwipeUp(): void {
    console.log('Swipe up detected');
    // Scroll to top or trigger action
    window.dispatchEvent(new CustomEvent('swipeUp'));
  }

  private handleSwipeDown(): void {
    if (!this.config.enablePullToRefresh) return;
    console.log('Swipe down detected');
    // Pull to refresh
    window.dispatchEvent(new CustomEvent('swipeDown'));
  }

  // Optimize for current device
  private optimizeForDevice(): void {
    if (!this.deviceInfo) return;

    if (this.deviceInfo.type === 'mobile') {
      this.optimizeForMobile();
    } else if (this.deviceInfo.type === 'tablet') {
      this.optimizeForTablet();
    } else {
      this.optimizeForDesktop();
    }
  }

  // Mobile optimizations
  private optimizeForMobile(): void {
    // Enable touch-friendly interactions
    document.body.classList.add('mobile-optimized');
    
    // Optimize images
    if (this.config.optimizeImages) {
      this.optimizeImagesForMobile();
    }

    // Enable lazy loading
    if (this.config.lazyLoad) {
      this.enableLazyLoading();
    }

    // Add mobile-specific CSS
    this.addMobileStyles();
  }

  // Tablet optimizations
  private optimizeForTablet(): void {
    document.body.classList.add('tablet-optimized');
    
    // Optimize for touch and mouse
    this.addTabletStyles();
  }

  // Desktop optimizations
  private optimizeForDesktop(): void {
    document.body.classList.add('desktop-optimized');
    
    // Enable hover effects
    this.addDesktopStyles();
  }

  // Optimize images for mobile
  private optimizeImagesForMobile(): void {
    if (typeof window === 'undefined') return;

    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      const src = img.getAttribute('src');
      if (src && !src.includes('mobile')) {
        // Add mobile-specific image handling
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
      }
    });
  }

  // Enable lazy loading
  private enableLazyLoading(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }

  // Add mobile-specific styles
  private addMobileStyles(): void {
    if (typeof window === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      .mobile-optimized {
        --touch-target-size: 44px;
        --font-size-base: 18px;
        --spacing-unit: 8px;
      }
      
      .mobile-optimized button,
      .mobile-optimized a {
        min-height: var(--touch-target-size);
        min-width: var(--touch-target-size);
        padding: 12px;
      }
      
      .mobile-optimized input,
      .mobile-optimized textarea {
        font-size: var(--font-size-base);
        padding: 12px;
      }
      
      .mobile-optimized .text-sm {
        font-size: 16px;
      }
      
      .mobile-optimized .text-base {
        font-size: 18px;
      }
    `;
    document.head.appendChild(style);
  }

  // Add tablet-specific styles
  private addTabletStyles(): void {
    if (typeof window === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      .tablet-optimized {
        --touch-target-size: 40px;
        --font-size-base: 18px;
        --spacing-unit: 12px;
      }
    `;
    document.head.appendChild(style);
  }

  // Add desktop-specific styles
  private addDesktopStyles(): void {
    if (typeof window === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      .desktop-optimized {
        --touch-target-size: 32px;
        --font-size-base: 14px;
        --spacing-unit: 16px;
      }
      
      .desktop-optimized button:hover,
      .desktop-optimized a:hover {
        transform: translateY(-1px);
        transition: transform 0.2s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // Get responsive breakpoint
  getBreakpoint(): string {
    if (!this.deviceInfo) return 'desktop';

    if (this.deviceInfo.width <= this.config.breakpoints.mobile) {
      return 'mobile';
    } else if (this.deviceInfo.width <= this.config.breakpoints.tablet) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<ResponsiveConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Cleanup
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.orientationChangeHandler) {
      window.removeEventListener('orientationchange', this.orientationChangeHandler);
    }

    document.body.classList.remove('mobile-optimized', 'tablet-optimized', 'desktop-optimized');
  }
}

// Export singleton instance
export const responsiveService = ResponsiveService.getInstance(); 