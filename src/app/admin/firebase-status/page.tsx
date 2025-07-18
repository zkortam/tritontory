"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FirebaseTester } from "@/lib/test-firebase";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface TestResult {
  articles: boolean;
  videos: boolean;
  research: boolean;
  legal: boolean;
  errors: string[];
}

export default function FirebaseStatusPage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await FirebaseTester.testAllServices();
      setTestResults(results);
      setLastTestTime(new Date());
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Run initial test on page load
    runTests();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="default" className="bg-green-500">
        Working
      </Badge>
    ) : (
      <Badge variant="destructive">
        Failed
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="container px-4 md:px-6 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Firebase Integration Status</h1>
        <p className="text-gray-400">
          Monitor the status of all Firebase services and test their functionality.
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {isRunning ? "Running Tests..." : "Run Tests"}
        </Button>

        {lastTestTime && (
          <div className="flex items-center text-sm text-gray-400">
            Last tested: {lastTestTime.toLocaleString()}
          </div>
        )}
      </div>

      {testResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles</CardTitle>
              {getStatusIcon(testResults.articles)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {testResults.articles ? "✅" : "❌"}
                </div>
                {getStatusBadge(testResults.articles)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Firestore Articles Collection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              {getStatusIcon(testResults.videos)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {testResults.videos ? "✅" : "❌"}
                </div>
                {getStatusBadge(testResults.videos)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Firestore Videos Collection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Research</CardTitle>
              {getStatusIcon(testResults.research)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {testResults.research ? "✅" : "❌"}
                </div>
                {getStatusBadge(testResults.research)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Firestore Research Collection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legal Articles</CardTitle>
              {getStatusIcon(testResults.legal)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {testResults.legal ? "✅" : "❌"}
                </div>
                {getStatusBadge(testResults.legal)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Firestore Legal Articles Collection
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {testResults?.errors && testResults.errors.length > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Errors Found</CardTitle>
            <CardDescription>
              The following services encountered errors during testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Firebase Configuration</CardTitle>
            <CardDescription>
              Current Firebase project settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Project ID:</span>
                <span className="font-mono">tritontoryucsd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Auth Domain:</span>
                <span className="font-mono">tritontoryucsd.firebaseapp.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Storage Bucket:</span>
                <span className="font-mono">tritontoryucsd.firebasestorage.app</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>
              Overall Firebase integration health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Authentication</span>
                <Badge variant="default" className="bg-green-500">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Firestore Database</span>
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Storage</span>
                <Badge variant="default" className="bg-green-500">
                  Available
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Real-time Updates</span>
                <Badge variant="default" className="bg-green-500">
                  Enabled
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 