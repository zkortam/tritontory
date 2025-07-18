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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FileUpload } from "@/components/ui/file-upload";
import { LegalService } from "@/lib/firebase-service";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Eye, Plus, X, Gavel } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const categories = [
  "Constitutional Law",
  "Campus Policy",
  "Student Rights",
  "Education Law",
  "Supreme Court",
  "Civil Rights",
  "Privacy Law",
  "Intellectual Property",
  "Administrative Law",
  "Criminal Law",
  "Environmental Law",
  "Other"
];

interface LegalForm {
  title: string;
  abstract: string;
  content: string;
  category: string;
  citations: string[];
  tags: string;
  coverImage: string;
  featured: boolean;
  status: 'draft' | 'published';
}

export default function CreateLegalPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState<LegalForm>({
    title: "",
    abstract: "",
    content: "",
    category: "",
    citations: [""],
    tags: "",
    coverImage: "",
    featured: false,
    status: 'draft',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create legal articles");
      return;
    }

    if (!form.title || !form.abstract || !form.content || !form.category) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const legalData = {
        ...form,
        citations: form.citations.filter(c => c.trim().length > 0),
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonymous',
      };

      await LegalService.createLegalArticle(legalData, coverImageFile || undefined);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/legal`);
      }, 1500);

    } catch (error) {
      console.error("Error creating legal article:", error);
      setError("Failed to create legal article. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string, file: File) => {
    setForm(prev => ({ ...prev, coverImage: url }));
    setCoverImageFile(file);
  };

  const handlePreview = () => {
    alert("Legal article preview would show formatted law review layout with citations");
  };

  const addCitation = () => {
    setForm(prev => ({
      ...prev,
      citations: [...prev.citations, ""]
    }));
  };

  const removeCitation = (index: number) => {
    setForm(prev => ({
      ...prev,
      citations: prev.citations.filter((_, i) => i !== index)
    }));
  };

  const updateCitation = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      citations: prev.citations.map((c, i) => i === index ? value : c)
    }));
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="bg-gray-900 border-gray-800 text-center p-8">
          <CardContent>
            <div className="w-16 h-16 bg-law-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gavel className="w-8 h-8 text-law-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Legal Article Created Successfully!</h2>
            <p className="text-gray-400">Redirecting to law review list...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/legal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Legal Article</h1>
          <p className="text-gray-400">Write legal analysis and commentary for Law Review</p>
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
            {/* Article Details */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Legal Article Details</CardTitle>
                <CardDescription className="text-law-400">
                  Add the title and abstract for your legal analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter legal article title..."
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="abstract">Abstract *</Label>
                  <Textarea
                    id="abstract"
                    value={form.abstract}
                    onChange={(e) => setForm(prev => ({ ...prev, abstract: e.target.value }))}
                    placeholder="Provide a brief overview of your legal analysis and conclusions..."
                    className="bg-gray-800 border-gray-700"
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Legal Analysis *</CardTitle>
                <CardDescription>
                  Write your full legal article with analysis, arguments, and conclusions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={form.content}
                  onChange={(content) => setForm(prev => ({ ...prev, content }))}
                  placeholder="Begin your legal analysis..."
                  className="min-h-[500px]"
                />
              </CardContent>
            </Card>

            {/* Legal Citations */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Legal Citations</CardTitle>
                <CardDescription>
                  Add case law, statutes, regulations, and other legal authorities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.citations.map((citation, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={citation}
                      onChange={(e) => updateCitation(index, e.target.value)}
                      placeholder="Case Name v. Case Name, Volume Reporter Page (Court Year)"
                      className="bg-gray-800 border-gray-700"
                    />
                    {form.citations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCitation(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCitation}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Citation
                </Button>
                <div className="text-xs text-gray-400 space-y-1">
                  <p><strong>Examples:</strong></p>
                  <p>• Brown v. Board of Education, 347 U.S. 483 (1954)</p>
                  <p>• 42 U.S.C. § 1983</p>
                  <p>• Tinker v. Des Moines, 393 U.S. 503 (1969)</p>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
                <CardDescription>
                  Upload an image to represent your legal analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {form.coverImage ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={form.coverImage}
                        alt="Cover image preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setForm(prev => ({ ...prev, coverImage: "" }));
                        setCoverImageFile(null);
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <FileUpload
                    onUpload={handleImageUpload}
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
                  <Label htmlFor="featured">Featured Analysis</Label>
                </div>
              </CardContent>
            </Card>

            {/* Legal Classification */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Legal Area *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select legal area" />
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
                  <Label htmlFor="tags">Keywords</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="constitutional, privacy, student rights..."
                    className="bg-gray-800 border-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Separate keywords with commas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Legal Writing Tips */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Writing Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400 space-y-2">
                <p><strong>Structure your analysis:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Introduction and thesis</li>
                  <li>Background and context</li>
                  <li>Legal analysis</li>
                  <li>Policy implications</li>
                  <li>Conclusion</li>
                </ul>
                <p className="mt-3"><strong>Citation format:</strong> Use Bluebook citation style</p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-law-500 hover:bg-law-600"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : `${form.status === 'published' ? 'Publish' : 'Save'} Article`}
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
