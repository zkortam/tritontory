"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, User, Mail, Calendar, Shield, Save, X, Camera, Upload } from "lucide-react";
import { CustomAvatar } from "@/components/ui/avatar";
import { uploadFile } from "@/lib/firebase-service";

export default function ProfilePage() {
  const { user, userRole, updateUserProfile } = useAuth();
  // Temporarily disabled redirect hook to fix auto-redirect issue
  // useRedirectOnAuth(); // Track current page for redirect after auth
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state for editing
  const [editData, setEditData] = useState({
    firstName: user?.displayName?.split(' ')[0] || "",
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || "",
    profilePicture: user?.photoURL || "",
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      setEditData({
        firstName: user?.displayName?.split(' ')[0] || "",
        lastName: user?.displayName?.split(' ').slice(1).join(' ') || "",
        profilePicture: user?.photoURL || "",
      });
      setError("");
      setSuccess("");
    }
    setIsEditing(!isEditing);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const path = `profile-pictures/${user?.uid}/${Date.now()}-${file.name}`;
      const imageUrl = await uploadFile(file, path);
      setEditData(prev => ({ ...prev, profilePicture: imageUrl }));
      setSuccess("Profile picture uploaded successfully!");
    } catch (error) {
      setError("Failed to upload image. Please try again.");
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData.firstName.trim()) {
      setError("First name is required");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateUserProfile(editData.firstName.trim(), editData.lastName.trim());
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setError("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            <CardContent className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <CustomAvatar
                    name={user?.displayName || user?.email || ""}
                    imageUrl={isEditing ? editData.profilePicture : (user?.photoURL || undefined)}
                    size="xl"
                  />
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <Label className="text-sm text-gray-400">Profile Picture</Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <p className="text-white text-sm">
                        {editData.profilePicture ? "Custom image uploaded" : "Default avatar (initials)"}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isLoading ? "Uploading..." : "Upload Image"}
                        </Button>
                        {editData.profilePicture && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditData(prev => ({ ...prev, profilePicture: "" }))}
                            disabled={isLoading}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-white text-sm">
                      {user?.photoURL ? "Custom profile picture" : "Default avatar (initials)"}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <Label className="text-sm text-gray-400">Display Name</Label>
                  {isEditing ? (
                    <div className="flex space-x-2 mt-1">
                      <Input
                        value={editData.firstName}
                        onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="First Name"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <Input
                        value={editData.lastName}
                        onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Last Name"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  ) : (
                    <p className="text-white font-medium">
                      {user.displayName || "Not set"}
                    </p>
                  )}
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

          {/* Error/Success Messages */}
          {error && (
            <div className="text-center py-2">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="text-center py-2">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleEditToggle}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEditToggle}>
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button asChild>
                  <Link href="/settings">Settings</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 