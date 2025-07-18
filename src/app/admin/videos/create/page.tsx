"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";
import { VideoService } from "@/lib/firebase-service";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Eye, Video } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const categories = [
  "Campus News",
  "Events",
  "Interviews",
  "Student Life",
  "Sports",
  "Academic",
  "Behind the Scenes",
  "Announcements"
];

interface VideoForm {
  title: string;
  description: string;
  category: string;
  tags: string;
  thumbnailUrl: string;
  videoUrl: string;
  featured: boolean;
  status: 'draft' | 'published';
}

export default function CreateVideoPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState<VideoForm>({
    title: "",
    description: "",
    category: "",
    tags: "",
    thumbnailUrl: "",
    videoUrl: "",
    featured: false,
    status: 'draft',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create videos");
      return;
    }

    if (!form.title || !form.description || !form.category || !videoFile || !thumbnailFile) {
      setError("Please fill in all required fields and upload video/thumbnail");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const videoData = {
        ...form,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonymous',
        duration: 0, // Will be calculated on backend
      };

      await VideoService.createVideo(videoData, videoFile, thumbnailFile);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/videos`);
      }, 1500);

    } catch (error) {
      console.error("Error creating video:", error);
      setError("Failed to create video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = (url: string, file: File) => {
    setForm(prev => ({ ...prev, videoUrl: url }));
    setVideoFile(file);
  };

  const handleThumbnailUpload = (url: string, file: File) => {
    setForm(prev => ({ ...prev, thumbnailUrl: url }));
    setThumbnailFile(file);
  };

  const handlePreview = () => {
    alert("Video preview functionality would show video player with uploaded content");
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="bg-gray-900 border-gray-800 text-center p-8">
          <CardContent>
            <div className="w-16 h-16 bg-today-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-today-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Video Created Successfully!</h2>
            <p className="text-gray-400">Redirecting to videos list...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/videos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Video</h1>
          <p className="text-gray-400">Upload and publish a new video for Triton Today</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-900/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Details */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
                <CardDescription className="text-today-400">
                  Add title and description for your video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter video title..."
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your video content..."
                    className="bg-gray-800 border-gray-700"
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Video Upload */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Video File *</CardTitle>
                <CardDescription>
                  Upload your video file (MP4, MOV, AVI supported)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {form.videoUrl ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-today-500/10 border border-today-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Video className="h-6 w-6 text-today-500" />
                        <div>
                          <p className="font-medium">Video uploaded successfully</p>
                          <p className="text-sm text-gray-400">File: {videoFile?.name}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setForm(prev => ({ ...prev, videoUrl: "" }));
                        setVideoFile(null);
                      }}
                    >
                      Remove Video
                    </Button>
                  </div>
                ) : (
                  <FileUpload
                    onUpload={handleVideoUpload}
                    onError={setError}
                    accept="video/*"
                    maxSize={100}
                  />
                )}
              </CardContent>
            </Card>

            {/* Thumbnail Upload */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Thumbnail Image *</CardTitle>
                <CardDescription>
                  Upload a thumbnail image for your video (16:9 aspect ratio recommended)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {form.thumbnailUrl ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden max-w-sm">
                      <Image
                        src={form.thumbnailUrl}
                        alt="Thumbnail preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setForm(prev => ({ ...prev, thumbnailUrl: "" }));
                        setThumbnailFile(null);
                      }}
                    >
                      Remove Thumbnail
                    </Button>
                  </div>
                ) : (
                  <FileUpload
                    onUpload={handleThumbnailUpload}
                    onError={setError}
                    accept="image/*"
                    maxSize={10}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publication Settings */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value: 'draft' | 'published') =>
                      setForm(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(checked) =>
                      setForm(prev => ({ ...prev, featured: !!checked }))
                    }
                  />
                  <Label htmlFor="featured">Featured Video</Label>
                </div>
              </CardContent>
            </Card>

            {/* Categories and Tags */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Categorization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="campus, news, trending..."
                    className="bg-gray-800 border-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Separate tags with commas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-today-500 hover:bg-today-600"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : `${form.status === 'published' ? 'Publish' : 'Save'} Video`}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handlePreview}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
