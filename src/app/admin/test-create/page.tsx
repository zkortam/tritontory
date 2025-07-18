"use client";

import { useAuth } from "@/lib/auth-context";

export default function TestCreatePage() {
  const { user, loading, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Create Page</h1>
        <p className="text-gray-400">Testing if admin layout works</p>
      </div>

      <div className="space-y-4">
        <div>
          <strong>Loading:</strong> {loading ? "Yes" : "No"}
        </div>
        
        <div>
          <strong>User:</strong> {user ? user.email : "None"}
        </div>
        
        <div>
          <strong>Is Admin:</strong> {isAdmin() ? "Yes" : "No"}
        </div>
        
        <div>
          <strong>Page Loaded:</strong> Yes
        </div>
      </div>

      <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Simple Form Test</h2>
        <input 
          type="text" 
          placeholder="Test input" 
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
        />
      </div>
    </div>
  );
} 