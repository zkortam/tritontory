"use client";

import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function AdminAnalyticsPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <AnalyticsDashboard />
        </div>
      </div>
    </ErrorBoundary>
  );
} 