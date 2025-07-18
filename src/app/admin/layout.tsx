"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { RequireAdmin } from "@/lib/rbac";
import { Sidebar } from "./components/sidebar";

// Admin layout that uses the AuthProvider from root layout
export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Don't apply authentication checks to login pages
  if (pathname?.startsWith('/admin/login')) {
    return <>{children}</>;
  }
  
  return <ProtectedLayout>{children}</ProtectedLayout>;
}

// Inner layout component that checks authentication and admin status
function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push("/admin/login");
    } else if (!loading && user && !isAdmin()) {
      // Redirect to login if not admin
      router.push("/admin/login");
    }
  }, [user, loading, isAdmin, router]);

  // Show loading state while checking auth
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

  // If authenticated and admin, show admin layout
  if (user && isAdmin()) {
    return (
      <RequireAdmin>
        <div className="flex min-h-screen bg-gray-950 text-white">
          <Sidebar />
          <div className="flex-1 p-8">
            <main className="mx-auto max-w-7xl">{children}</main>
          </div>
        </div>
      </RequireAdmin>
    );
  }

  // Fallback: empty div while redirecting
  return <div className="min-h-screen bg-black"></div>;
}
