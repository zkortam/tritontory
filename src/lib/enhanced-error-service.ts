import { ErrorHandler, FirebaseError } from './error-handling';

export class EnhancedErrorService {
  // Enhanced error logging with context
  static async logErrorWithContext(
    error: unknown, 
    context: string, 
    userId?: string,
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    const firebaseError = ErrorHandler.handleError(error, context);
    
    // Enhanced logging with more context
    const errorLog = {
      ...firebaseError,
      context,
      userId,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      additionalData,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Enhanced Error Log:', errorLog);
    }

    // In production, you could send to external service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      // await this.sendToErrorService(errorLog);
      console.error('Production Error:', errorLog);
    }
  }

  // Rate limiting error handler
  static handleRateLimitError(userId: string, action: string): FirebaseError {
    return {
      code: 'rate-limit-exceeded',
      message: `Too many ${action} attempts. Please try again later.`,
      details: { userId, action, retryAfter: 60 }
    };
  }

  // Validation error handler
  static handleValidationError(field: string, message: string): FirebaseError {
    return {
      code: 'validation-error',
      message: `${field}: ${message}`,
      details: { field, message }
    };
  }

  // Network error handler
  static handleNetworkError(): FirebaseError {
    return {
      code: 'network-error',
      message: 'Network connection error. Please check your internet connection.',
      details: { retryable: true }
    };
  }

  // Permission error handler
  static handlePermissionError(resource: string): FirebaseError {
    return {
      code: 'permission-denied',
      message: `You don't have permission to access ${resource}.`,
      details: { resource }
    };
  }

  // User-friendly error messages
  static getUserFriendlyMessage(error: FirebaseError): string {
    switch (error.code) {
      case 'rate-limit-exceeded':
        return 'Too many requests. Please wait a moment and try again.';
      case 'validation-error':
        return error.message;
      case 'network-error':
        return 'Connection error. Please check your internet and try again.';
      case 'permission-denied':
        return 'Access denied. Please contact support if you believe this is an error.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  // Check if error is retryable
  static isRetryableError(error: FirebaseError): boolean {
    const retryableCodes = [
      'network-error',
      'unavailable',
      'deadline-exceeded',
      'resource-exhausted'
    ];
    return retryableCodes.includes(error.code);
  }

  // Get retry delay for retryable errors
  static getRetryDelay(error: FirebaseError): number {
    switch (error.code) {
      case 'rate-limit-exceeded':
        return 60000; // 1 minute
      case 'network-error':
        return 5000; // 5 seconds
      case 'unavailable':
        return 10000; // 10 seconds
      default:
        return 3000; // 3 seconds
    }
  }
} 