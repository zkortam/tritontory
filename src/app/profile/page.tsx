"use client";

import { useAuth, useRedirectOnAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, Calendar, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const { user, userRole } = useAuth();
  useRedirectOnAuth(); // Track current page for redirect after auth
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in to view your profile</h1>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card className="bg-gray-900/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
              <CardDescription className="text-gray-400">
                Your basic account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <Label className="text-sm text-gray-400">Display Name</Label>
                  <p className="text-white font-medium">
                    {user.displayName || "Not set"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <Label className="text-sm text-gray-400">Email</Label>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <Label className="text-sm text-gray-400">Member Since</Label>
                  <p className="text-white font-medium">
                    {user.metadata.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString() : 
                      "Unknown"
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <Label className="text-sm text-gray-400">Role</Label>
                  <p className="text-white font-medium capitalize">
                    {userRole?.role || 'viewer'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
            <Button asChild>
              <Link href="/settings">Settings</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 