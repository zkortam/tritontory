"use client";

export interface AccessibilityViolation {
  type: 'error' | 'warning' | 'info';
  element: string;
  message: string;
  wcagCriteria?: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

export interface AccessibilityReport {
  violations: AccessibilityViolation[];
  score: number;
  timestamp: Date;
  pageUrl: string;
}

export class AccessibilityService {
  private static instance: AccessibilityService;
  private violations: AccessibilityViolation[] = [];

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  // Run comprehensive accessibility audit
  auditPage(): AccessibilityReport {
    this.violations = [];
    
    this.checkImages();
    this.checkHeadings();
    this.checkLinks();
    this.checkForms();
    this.checkColorContrast();
    this.checkKeyboardNavigation();
    this.checkARIA();
    this.checkSemanticHTML();
    this.checkFocusManagement();
    this.checkTextAlternatives();

    const score = this.calculateScore();
    
    return {
      violations: this.violations,
      score,
      timestamp: new Date(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    };
  }

  // Check for missing alt text on images
  private checkImages(): void {
    if (typeof window === 'undefined') return;

    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      const src = img.getAttribute('src');
      
      if (!alt && !img.hasAttribute('aria-label') && !img.hasAttribute('aria-labelledby')) {
        this.violations.push({
          type: 'error',
          element: `img[${index}]`,
          message: 'Image missing alt text or ARIA label',
          wcagCriteria: '1.1.1',
          impact: 'critical',
        });
      }

      if (alt === '' && !img.hasAttribute('role') && !img.hasAttribute('aria-hidden')) {
        this.violations.push({
          type: 'warning',
          element: `img[${index}]`,
          message: 'Image with empty alt text should be decorative or have role="presentation"',
          wcagCriteria: '1.1.1',
          impact: 'moderate',
        });
      }
    });
  }

  // Check heading hierarchy
  private checkHeadings(): void {
    if (typeof window === 'undefined') return;

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels: number[] = [];
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      headingLevels.push(level);
      
      // Check for skipped heading levels
      if (index > 0) {
        const prevLevel = headingLevels[index - 1];
        if (level - prevLevel > 1) {
          this.violations.push({
            type: 'error',
            element: heading.tagName.toLowerCase(),
            message: `Heading level skipped from h${prevLevel} to h${level}`,
            wcagCriteria: '1.3.1',
            impact: 'serious',
          });
        }
      }
    });

    // Check for multiple h1 elements
    const h1Elements = document.querySelectorAll('h1');
    if (h1Elements.length > 1) {
      this.violations.push({
        type: 'warning',
        element: 'h1',
        message: 'Multiple h1 elements found. Consider using only one main heading per page.',
        wcagCriteria: '1.3.1',
        impact: 'moderate',
      });
    }
  }

  // Check link accessibility
  private checkLinks(): void {
    if (typeof window === 'undefined') return;

    const links = document.querySelectorAll('a');
    links.forEach((link, index) => {
      const text = link.textContent?.trim();
      const href = link.getAttribute('href');
      
      // Check for empty links
      if (!text && !link.hasAttribute('aria-label')) {
        this.violations.push({
          type: 'error',
          element: `a[${index}]`,
          message: 'Link has no accessible text',
          wcagCriteria: '2.4.4',
          impact: 'critical',
        });
      }

      // Check for generic link text
      if (text && ['click here', 'read more', 'learn more', 'here', 'link'].includes(text.toLowerCase())) {
        this.violations.push({
          type: 'warning',
          element: `a[${index}]`,
          message: 'Link text is not descriptive. Consider more specific text.',
          wcagCriteria: '2.4.4',
          impact: 'moderate',
        });
      }

      // Check for external links
      if (href && href.startsWith('http') && !link.hasAttribute('aria-label')) {
        const hasExternalIndicator = text?.includes('external') || text?.includes('new window');
        if (!hasExternalIndicator) {
          this.violations.push({
            type: 'info',
            element: `a[${index}]`,
            message: 'External link should indicate it opens in new window',
            wcagCriteria: '3.2.1',
            impact: 'minor',
          });
        }
      }
    });
  }

  // Check form accessibility
  private checkForms(): void {
    if (typeof window === 'undefined') return;

    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id');
      const name = input.getAttribute('name');
      const type = input.getAttribute('type');
      
      // Check for missing labels
      if (!id && !input.hasAttribute('aria-label') && !input.hasAttribute('aria-labelledby')) {
        this.violations.push({
          type: 'error',
          element: `${input.tagName.toLowerCase()}[${index}]`,
          message: 'Form control missing label or ARIA label',
          wcagCriteria: '3.3.2',
          impact: 'critical',
        });
      }

      // Check for required fields
      if (input.hasAttribute('required') && !input.hasAttribute('aria-required')) {
        this.violations.push({
          type: 'warning',
          element: `${input.tagName.toLowerCase()}[${index}]`,
          message: 'Required field should have aria-required="true"',
          wcagCriteria: '3.3.2',
          impact: 'moderate',
        });
      }

      // Check for error states
      if (input.hasAttribute('aria-invalid') && !input.hasAttribute('aria-describedby')) {
        this.violations.push({
          type: 'warning',
          element: `${input.tagName.toLowerCase()}[${index}]`,
          message: 'Invalid field should have error description',
          wcagCriteria: '3.3.1',
          impact: 'moderate',
        });
      }
    });
  }

  // Check color contrast (basic implementation)
  private checkColorContrast(): void {
    if (typeof window === 'undefined') return;

    // This is a simplified check. In a real implementation, you'd use a library like axe-core
    // or integrate with a color contrast analyzer
    const elements = document.querySelectorAll('*');
    elements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Basic check for high contrast colors
      if (color && backgroundColor) {
        // This would need a proper color contrast calculation
        // For now, we'll just log that this check was performed
        console.log('Color contrast check performed for:', element);
      }
    });
  }

  // Check keyboard navigation
  private checkKeyboardNavigation(): void {
    if (typeof window === 'undefined') return;

    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
    let hasTabIndex = false;
    
    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex');
      
      if (tabIndex === '-1') {
        hasTabIndex = true;
      }
      
      // Check for focusable elements that can't be reached
      if (element.hasAttribute('disabled') && tabIndex !== '-1') {
        this.violations.push({
          type: 'warning',
          element: element.tagName.toLowerCase(),
          message: 'Disabled element should have tabindex="-1"',
          wcagCriteria: '2.1.1',
          impact: 'moderate',
        });
      }
    });

    if (!hasTabIndex) {
      this.violations.push({
        type: 'info',
        element: 'body',
        message: 'Consider adding skip links for keyboard navigation',
        wcagCriteria: '2.4.1',
        impact: 'minor',
      });
    }
  }

  // Check ARIA usage
  private checkARIA(): void {
    if (typeof window === 'undefined') return;

    const elements = document.querySelectorAll('[aria-*]');
    elements.forEach((element) => {
      const ariaAttributes = Array.from(element.attributes)
        .filter(attr => attr.name.startsWith('aria-'))
        .map(attr => attr.name);

      // Check for invalid ARIA attributes
      ariaAttributes.forEach(attr => {
        if (!this.isValidARIAAttribute(attr)) {
          this.violations.push({
            type: 'error',
            element: element.tagName.toLowerCase(),
            message: `Invalid ARIA attribute: ${attr}`,
            wcagCriteria: '4.1.2',
            impact: 'serious',
          });
        }
      });

      // Check for missing required ARIA attributes
      if (element.hasAttribute('aria-expanded') && !element.hasAttribute('aria-controls')) {
        this.violations.push({
          type: 'warning',
          element: element.tagName.toLowerCase(),
          message: 'aria-expanded should be used with aria-controls',
          wcagCriteria: '4.1.2',
          impact: 'moderate',
        });
      }
    });
  }

  // Check semantic HTML
  private checkSemanticHTML(): void {
    if (typeof window === 'undefined') return;

    // Check for proper use of semantic elements
    const divs = document.querySelectorAll('div');
    divs.forEach((div) => {
      const role = div.getAttribute('role');
      const className = div.className;
      
      // Check if div should be a semantic element
      if (className.includes('button') && !role && !div.querySelector('button')) {
        this.violations.push({
          type: 'warning',
          element: 'div',
          message: 'Consider using button element instead of div with button styling',
          wcagCriteria: '4.1.2',
          impact: 'moderate',
        });
      }

      if (className.includes('link') && !role && !div.querySelector('a')) {
        this.violations.push({
          type: 'warning',
          element: 'div',
          message: 'Consider using anchor element instead of div with link styling',
          wcagCriteria: '4.1.2',
          impact: 'moderate',
        });
      }
    });
  }

  // Check focus management
  private checkFocusManagement(): void {
    if (typeof window === 'undefined') return;

    // Check for focus traps
    const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    modals.forEach((modal) => {
      if (!modal.hasAttribute('aria-modal')) {
        this.violations.push({
          type: 'warning',
          element: 'dialog',
          message: 'Modal should have aria-modal="true"',
          wcagCriteria: '2.4.3',
          impact: 'moderate',
        });
      }
    });
  }

  // Check text alternatives
  private checkTextAlternatives(): void {
    if (typeof window === 'undefined') return;

    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach((media) => {
      const hasCaptions = media.querySelector('track[kind="captions"]');
      const hasTranscript = document.querySelector(`[aria-describedby="${media.id}"]`);
      
      if (!hasCaptions && !hasTranscript) {
        this.violations.push({
          type: 'warning',
          element: media.tagName.toLowerCase(),
          message: 'Media should have captions or transcript',
          wcagCriteria: '1.2.1',
          impact: 'serious',
        });
      }
    });
  }

  // Validate ARIA attribute
  private isValidARIAAttribute(attr: string): boolean {
    const validAttributes = [
      'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
      'aria-expanded', 'aria-controls', 'aria-current', 'aria-selected',
      'aria-checked', 'aria-pressed', 'aria-required', 'aria-invalid',
      'aria-modal', 'aria-live', 'aria-atomic', 'aria-relevant',
      'aria-busy', 'aria-dropeffect', 'aria-grabbed', 'aria-activedescendant',
      'aria-autocomplete', 'aria-multiline', 'aria-multiselectable',
      'aria-orientation', 'aria-readonly', 'aria-sort', 'aria-valuemax',
      'aria-valuemin', 'aria-valuenow', 'aria-valuetext', 'aria-level',
      'aria-posinset', 'aria-setsize', 'aria-colcount', 'aria-colindex',
      'aria-colspan', 'aria-rowcount', 'aria-rowindex', 'aria-rowspan'
    ];
    
    return validAttributes.includes(attr);
  }

  // Calculate accessibility score
  private calculateScore(): number {
    if (this.violations.length === 0) return 100;

    let score = 100;
    const weights = {
      critical: 20,
      serious: 15,
      moderate: 10,
      minor: 5,
    };

    this.violations.forEach(violation => {
      score -= weights[violation.impact];
    });

    return Math.max(0, score);
  }

  // Generate accessibility report
  generateReport(): void {
    const report = this.auditPage();
    
    console.log('=== Accessibility Report ===');
    console.log(`Score: ${report.score}/100`);
    console.log(`Violations: ${report.violations.length}`);
    console.log(`Page: ${report.pageUrl}`);
    console.log(`Timestamp: ${report.timestamp.toISOString()}`);
    
    if (report.violations.length > 0) {
      console.log('\n=== Violations ===');
      report.violations.forEach((violation, index) => {
        console.log(`${index + 1}. [${violation.type.toUpperCase()}] ${violation.element}: ${violation.message}`);
        if (violation.wcagCriteria) {
          console.log(`   WCAG: ${violation.wcagCriteria} (${violation.impact} impact)`);
        }
      });
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendReportToAnalytics(report);
    }
  }

  // Send report to analytics
  private async sendReportToAnalytics(report: AccessibilityReport): Promise<void> {
    try {
      // This would integrate with your analytics service
      console.log('Sending accessibility report to analytics:', report);
    } catch (error) {
      console.error('Error sending accessibility report:', error);
    }
  }

  // Add skip link
  addSkipLink(): void {
    if (typeof window === 'undefined') return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Enable high contrast mode
  enableHighContrast(): void {
    if (typeof window === 'undefined') return;

    document.documentElement.classList.add('high-contrast');
    localStorage.setItem('highContrast', 'true');
  }

  // Disable high contrast mode
  disableHighContrast(): void {
    if (typeof window === 'undefined') return;

    document.documentElement.classList.remove('high-contrast');
    localStorage.removeItem('highContrast');
  }

  // Increase font size
  increaseFontSize(): void {
    if (typeof window === 'undefined') return;

    const currentSize = parseInt(localStorage.getItem('fontSize') || '16');
    const newSize = Math.min(currentSize + 2, 24);
    document.documentElement.style.fontSize = `${newSize}px`;
    localStorage.setItem('fontSize', newSize.toString());
  }

  // Decrease font size
  decreaseFontSize(): void {
    if (typeof window === 'undefined') return;

    const currentSize = parseInt(localStorage.getItem('fontSize') || '16');
    const newSize = Math.max(currentSize - 2, 12);
    document.documentElement.style.fontSize = `${newSize}px`;
    localStorage.setItem('fontSize', newSize.toString());
  }

  // Reset font size
  resetFontSize(): void {
    if (typeof window === 'undefined') return;

    document.documentElement.style.fontSize = '16px';
    localStorage.removeItem('fontSize');
  }

  // Initialize accessibility features
  initialize(): void {
    if (typeof window === 'undefined') return;

    // Add skip link
    this.addSkipLink();

    // Restore user preferences
    const highContrast = localStorage.getItem('highContrast');
    if (highContrast === 'true') {
      this.enableHighContrast();
    }

    const fontSize = localStorage.getItem('fontSize');
    if (fontSize) {
      document.documentElement.style.fontSize = `${fontSize}px`;
    }

    // Run initial audit
    this.generateReport();
  }
}

// Export singleton instance
export const accessibilityService = AccessibilityService.getInstance(); 