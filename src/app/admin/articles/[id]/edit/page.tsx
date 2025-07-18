"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";
import { ArticleService } from "@/lib/firebase-service";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, CheckCircle, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Dynamically import RichTextEditor to prevent SSR issues
const RichTextEditor = dynamic(() => import("@/components/ui/rich-text-editor").then(mod => ({ default: mod.RichTextEditor })), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-700 rounded-lg bg-gray-900 min-h-[300px] animate-pulse">
      <div className="border-b border-gray-700 p-2 h-12 bg-gray-800"></div>
      <div className="p-4 min-h-[200px] bg-gray-900"></div>
    </div>
  ),
});

const categories = [
  "Campus",
  "Sports",
  "Student Government",
  "Academics",
  "Events",
  "San Diego",
  "California",
  "National",
];

const sections = [
  { value: "campus", label: "Campus News" },
  { value: "sports", label: "Sports" },
  { value: "student-government", label: "Student Government" },
  { value: "san-diego", label: "San Diego" },
  { value: "california", label: "California" },
  { value: "national", label: "National" },
];

interface ArticleForm {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  section: 'campus' | 'sports' | 'student-government' | 'san-diego' | 'california' | 'national';
  tags: string;
  coverImage: string;
  featured: boolean;
  status: 'draft' | 'published';
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const articleId = params.id as string;

  const [form, setForm] = useState<ArticleForm>({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    section: "campus",
    tags: "",
    coverImage: "",
    featured: false,
    status: 'published',
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Load article data
  useEffect(() => {
    const loadArticle = async () => {
      if (!articleId) return;

      try {
        setInitialLoading(true);
        const article = await ArticleService.getArticle(articleId);
        
        if (!article) {
          setError("Article not found");
          return;
        }

        setForm({
          title: article.title,
          excerpt: article.excerpt || "",
          content: article.content,
          category: article.category,
          section: article.section,
          tags: article.tags ? article.tags.join(', ') : "",
          coverImage: article.coverImage || "",
          featured: article.featured || false,
          status: article.status || 'published',
        });
      } catch (error) {
        console.error("Error loading article:", error);
        setError("Failed to load article");
      } finally {
        setInitialLoading(false);
      }
    };

    loadArticle();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to edit articles");
      return;
    }

    if (!form.title || !form.content || !form.category || !form.section) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const articleData = {
        ...form,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };

      await ArticleService.updateArticle(articleId, articleData, coverImageFile || undefined);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/articles`);
      }, 1500);

    } catch (error) {
      console.error("Error updating article:", error);
      setError("Failed to update article. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string, file: File) => {
    setForm(prev => ({ ...prev, coverImage: url }));
    setCoverImageFile(file);
  };

  const handlePreview = () => {
    // For now, we'll just log the content. In a real app, you might open a modal or new tab
    console.log("Article preview:", form);
    alert("Preview functionality would show article in a modal or new tab");
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="bg-gray-900 border-gray-800 text-center p-8">
          <CardContent>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Article Updated Successfully!</h2>
            <p className="text-gray-400">Redirecting to articles list...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/articles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Article</h1>
          <p className="text-gray-400">Update article content and settings</p>
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
            {/* Title */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Article Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter article title..."
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={form.excerpt}
                    onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of the article..."
                    className="bg-gray-800 border-gray-700"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <RichTextEditor
                    value={form.content}
                    onChange={(content) => setForm(prev => ({ ...prev, content }))}
                    placeholder="Write your article content..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value: 'draft' | 'published') => setForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, featured: checked as boolean }))}
                  />
                  <Label htmlFor="featured">Featured Article</Label>
                </div>
              </CardContent>
            </Card>

            {/* Categories & Tags */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Categories & Tags</CardTitle>
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
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="section">Section *</Label>
                  <Select
                    value={form.section}
                    onValueChange={(value: 'campus' | 'sports' | 'student-government' | 'san-diego' | 'california' | 'national') => 
                      setForm(prev => ({ ...prev, section: value }))
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.value} value={section.value}>
                          {section.label}
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
                    placeholder="tag1, tag2, tag3..."
                    className="bg-gray-800 border-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.coverImage && (
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={form.coverImage}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <FileUpload
                  onUpload={handleImageUpload}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={loading}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Update Article
          </Button>
        </div>
      </form>
    </div>
  );
} 