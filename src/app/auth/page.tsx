"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { UserPlus, LogIn, ArrowLeft } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function AuthPage() {
  const { signIn, createUser, signInWithGoogle, getRedirectUrl } = useAuth();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  // Handle sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (signUpData.password !== signUpData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const redirectTo = getRedirectUrl();
      const userCredential = await createUser(signUpData.email, signUpData.password, redirectTo || undefined);
      
      // Create user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: signUpData.email,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        role: 'viewer',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setIsSignUpOpen(false);
      setSignUpData({ email: "", password: "", confirmPassword: "", firstName: "", lastName: "" });
    } catch (error: unknown) {
      setError((error as Error).message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const redirectTo = getRedirectUrl();
      await signIn(signInData.email, signInData.password, redirectTo || undefined);
      setIsSignInOpen(false);
      setSignInData({ email: "", password: "" });
    } catch (error: unknown) {
      setError((error as Error).message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const redirectTo = getRedirectUrl();
      await signInWithGoogle(redirectTo || undefined);
      setIsSignInOpen(false);
    } catch (error: unknown) {
      setError((error as Error).message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Triton Tory</h1>
          <p className="text-gray-400">Create an account or sign in to get started</p>
        </div>

        {/* Auth Options */}
        <div className="space-y-4">
          {/* Sign Up Card */}
          <Card className="bg-gray-900/50 border-gray-800/50">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Create Account</CardTitle>
              <CardDescription className="text-gray-400">
                Join our community to access exclusive content and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-tory-600 hover:bg-tory-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create Account</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Create a new account to get started.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white">First Name</Label>
                        <Input
                          id="firstName"
                          value={signUpData.firstName}
                          onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white">Last Name</Label>
                        <Input
                          id="lastName"
                          value={signUpData.lastName}
                          onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-white">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-white">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Sign In Card */}
          <Card className="bg-gray-900/50 border-gray-800/50">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Already have an account?</CardTitle>
              <CardDescription className="text-gray-400">
                Sign in to access your account and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Sign In</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Enter your credentials to access your account.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="flex flex-col space-y-2">
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Sign in with Google
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 