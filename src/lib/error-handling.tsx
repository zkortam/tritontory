"use client";

import React, { useState } from 'react';

export interface FirebaseError {
  code: string;
  message: string;
  details?: unknown;
}

export class ErrorHandler {
  // Handle Firebase Auth errors
  static handleAuthError(error: FirebaseError): FirebaseError {
    const errorCode = error.code || 'unknown';
    let message = 'An authentication error occurred';

    switch (errorCode) {
      case 'auth/user-not-found':
        message = 'No user found with this email address';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      default:
        message = error.message || 'Authentication failed';
    }

    return {
      code: errorCode,
      message,
      details: error
    };
  }

  // Handle Firebase Storage errors
  static handleStorageError(error: FirebaseError): FirebaseError {
    const errorCode = error.code || 'unknown';
    let message = 'A storage error occurred';

    switch (errorCode) {
      case 'storage/unauthorized':
        message = 'You are not authorized to access this file';
        break;
      case 'storage/canceled':
        message = 'Upload was canceled';
        break;
      case 'storage/unknown':
        message = 'An unknown storage error occurred';
        break;
      case 'storage/invalid-checksum':
        message = 'File checksum is invalid';
        break;
      case 'storage/retry-limit-exceeded':
        message = 'Upload retry limit exceeded';
        break;
      case 'storage/invalid-format':
        message = 'Invalid file format';
        break;
      case 'storage/invalid-url':
        message = 'Invalid file URL';
        break;
      default:
        message = error.message || 'Storage operation failed';
    }

    return {
      code: errorCode,
      message,
      details: error
    };
  }

  // Handle Firestore errors
  static handleFirestoreError(error: FirebaseError): FirebaseError {
    const errorCode = error.code || 'unknown';
    let message = 'A database error occurred';

    switch (errorCode) {
      case 'permission-denied':
        message = 'You do not have permission to perform this operation';
        break;
      case 'unavailable':
        message = 'Database is temporarily unavailable';
        break;
      case 'deadline-exceeded':
        message = 'Database operation timed out';
        break;
      case 'resource-exhausted':
        message = 'Database resources exhausted';
        break;
      case 'failed-precondition':
        message = 'Database operation failed due to precondition';
        break;
      case 'aborted':
        message = 'Database operation was aborted';
        break;
      case 'out-of-range':
        message = 'Database operation out of range';
        break;
      case 'unimplemented':
        message = 'Database operation not implemented';
        break;
      case 'internal':
        message = 'Internal database error';
        break;
      case 'data-loss':
        message = 'Data loss occurred';
        break;
      default:
        message = error.message || 'Database operation failed';
    }

    return {
      code: errorCode,
      message,
      details: error
    };
  }

  // Generic error handler
  static handleError(error: unknown, context: string = 'operation'): FirebaseError {
    console.error(`Error in ${context}:`, error);

    // Check if it's a Firebase error
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const firebaseError = error as FirebaseError;
      
      if (firebaseError.code && firebaseError.code.startsWith('auth/')) {
        return this.handleAuthError(firebaseError);
      }
      
      if (firebaseError.code && firebaseError.code.startsWith('storage/')) {
        return this.handleStorageError(firebaseError);
      }
      
      if (firebaseError.code && (firebaseError.code.startsWith('permission-denied') || firebaseError.code.startsWith('unavailable'))) {
        return this.handleFirestoreError(firebaseError);
      }
    }

    // Generic error
    return {
      code: 'unknown',
      message: error instanceof Error ? error.message : `An error occurred during ${context}`,
      details: error
    };
  }

  // Log error for debugging
  static logError(error: FirebaseError, context: string = 'operation'): void {
    console.error(`[${context}] Error:`, {
      code: error.code,
      message: error.message,
      details: error.details
    });
  }
}

// Error boundary component for React components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // You can integrate with services like Sentry, LogRocket, etc.
      console.error("Production error:", {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return <this.props.fallback error={this.state.error} resetError={this.handleRetry} />;
      }

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md w-full">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold">Something went wrong</h2>
              <p className="text-gray-400">We encountered an unexpected error. Please try again.</p>
              
              <div className="space-y-2">
                <button
                  onClick={this.handleRetry}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling async operations with error handling
export function useErrorHandler() {
  const [error, setError] = useState<FirebaseError | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsync = async <T,>(
    asyncFn: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      return result;
    } catch (err: unknown) {
      const firebaseError = ErrorHandler.handleError(err, context);
      setError(firebaseError);
      ErrorHandler.logError(firebaseError, context);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    error,
    loading,
    handleAsync,
    clearError
  };
} 