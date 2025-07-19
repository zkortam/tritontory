"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface MobileErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class MobileErrorBoundary extends React.Component<
  MobileErrorBoundaryProps,
  MobileErrorBoundaryState
> {
  constructor(props: MobileErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): MobileErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Mobile Error Boundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultMobileErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultMobileErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: Error; 
  resetError: () => void; 
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center mobile-safe-area">
      <div className="text-center max-w-md mx-auto mobile-gpu-accelerated">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-3 mobile-heading">
          Something went wrong
        </h2>
        
        <p className="text-gray-400 mb-6 mobile-text">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        
        {error && process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer mb-2">
              Error Details (Development)
            </summary>
            <pre className="text-xs text-red-400 bg-red-900/20 p-3 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={resetError}
            className="w-full mobile-touch-target"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="w-full mobile-touch-target"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook for functional components
export function useMobileErrorHandler() {
  const handleError = React.useCallback((error: unknown, errorInfo?: unknown) => {
    console.error("Mobile error caught:", error, errorInfo);
    
    // You can add error reporting service here
    // Example: Sentry.captureException(error);
    
    // Show user-friendly error message
    if (typeof window !== 'undefined') {
      // You could show a toast notification here
      console.error("User-friendly error message:", (error as Error).message);
    }
  }, []);

  return { handleError };
} 