"use client";

import { ReactNode } from 'react';
import { useAuth } from './auth-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';

interface RequireRoleProps {
  children: ReactNode;
  requiredRole: 'admin' | 'editor' | 'author' | 'viewer';
  fallback?: ReactNode;
}

interface RequireAdminProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAdmin({ children, fallback }: RequireAdminProps) {
  const { isAdmin, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
          <p className="text-lg font-medium text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Alert className="max-w-md bg-red-900/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Alert className="max-w-md bg-red-900/50 border-red-800">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don&apos;t have admin privileges to access this page. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

export function RequireRole({ children, requiredRole, fallback }: RequireRoleProps) {
  const { hasRole, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
          <p className="text-lg font-medium text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Alert className="max-w-md bg-red-900/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Alert className="max-w-md bg-red-900/50 border-red-800">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don&apos;t have permission to access this page. Required role: {requiredRole}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

export function useRequireRole(requiredRole: 'admin' | 'editor' | 'author' | 'viewer') {
  const { hasRole, loading, user } = useAuth();

  return {
    hasAccess: hasRole(requiredRole),
    loading,
    isAuthenticated: !!user,
  };
}

// Permission-based components
interface RequirePermissionProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}

export function RequirePermission({ children, permission, fallback }: RequirePermissionProps) {
  const { hasPermission, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  if (!user || !hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="bg-red-900/50 border-red-800">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don&apos;t have permission to perform this action.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
} 