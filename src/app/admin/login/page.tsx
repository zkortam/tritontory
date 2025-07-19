"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Chrome } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signIn, signInWithGoogle, createUser, loading: authLoading, user, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect to admin dashboard if already signed in as admin
  useEffect(() => {
    if (!authLoading && user && isAdmin()) {
      router.push("/admin");
    }
  }, [user, authLoading, isAdmin, router]);

  // Show loading state while auth is initializing or redirecting
  if (authLoading || (user && isAdmin())) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-gray-900 p-8 shadow-lg">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-white">Triton Tory</h1>
            <h2 className="mt-6 text-center text-2xl font-bold text-white">Admin Portal</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              {authLoading ? "Loading..." : "Redirecting to admin dashboard..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await signIn(email, password);
      router.push("/admin");
    } catch (err: unknown) {
      console.error("Login error:", err);
      const error = err as { code?: string };
      if (error.code === 'auth/user-not-found') {
        setError("No account found with this email. Please create an account first.");
      } else if (error.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createUser(email, password);
      setSuccess("Account created successfully! Please wait for admin approval before signing in.");
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      const error = err as { code?: string };
      if (error.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await signInWithGoogle();
      router.push("/admin");
    } catch (err: unknown) {
      console.error("Google sign in error:", err);
      const error = err as { code?: string };
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign in was cancelled. Please try again.");
      } else if (error.code === 'auth/popup-blocked') {
        setError("Pop-up was blocked. Please allow pop-ups and try again.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-gray-900 p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-white">Triton Tory</h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-white">Admin Portal</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-900/50 border-green-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-6">
            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
            >
              <Chrome className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-white">
                  Email
                </label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                  placeholder="admin@tritontory.com"
                />
              </div>

              <div>
                <label htmlFor="signin-password" className="block text-sm font-medium text-white">
                  Password
                </label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-6">
            <div className="text-center text-sm text-gray-400">
              <p>Create a new admin account. You&apos;ll need admin approval to access the portal.</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-white">
                  Email
                </label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                  placeholder="admin@tritontory.com"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-white">
                  Password
                </label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
