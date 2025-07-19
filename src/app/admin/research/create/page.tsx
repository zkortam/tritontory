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
import { ResearchService } from "@/lib/firebase-service";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, CheckCircle, Eye, Plus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const departments = [
  "Biology",
  "Chemistry",
  "Physics",
  "Computer Science",
  "Engineering",
  "Mathematics",
  "Psychology",
  "Neuroscience",
  "Medicine",
  "Environment",
  "Economics",
  "Political Science",
  "Other"
];

interface ResearchForm {
  title: string;
  abstract: string;
  content: string;
  department: string;
  contributors: string[];
  references: string[];
  tags: string;
  coverImage: string;
  featured: boolean;
  status: 'draft' | 'published';
}

export default function CreateResearchPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState<ResearchForm>({
    title: "",
    abstract: "",
    content: "",
    department: "",
    contributors: [""],
    references: [""],
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
      setError("You must be logged in to create research articles");
      return;
    }

    if (!form.title || !form.abstract || !form.content || !form.department) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const researchData = {
        ...form,
        contributors: form.contributors.filter(c => c.trim().length > 0),
        references: form.references.filter(r => r.trim().length > 0),
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonymous',
      };

      await ResearchService.createResearchArticle(researchData, coverImageFile || undefined);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/research`);
      }, 1500);

    } catch (error) {
      console.error("Error creating research article:", error);
      setError("Failed to create research article. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string, file: File) => {
    setForm(prev => ({ ...prev, coverImage: url }));
    setCoverImageFile(file);
  };

  const handlePreview = () => {
    alert("Research article preview would show formatted academic paper layout");
  };

  const addContributor = () => {
    setForm(prev => ({
      ...prev,
      contributors: [...prev.contributors, ""]
    }));
  };

  const removeContributor = (index: number) => {
    setForm(prev => ({
      ...prev,
      contributors: prev.contributors.filter((_, i) => i !== index)
    }));
  };

  const updateContributor = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      contributors: prev.contributors.map((c, i) => i === index ? value : c)
    }));
  };

  const addReference = () => {
    setForm(prev => ({
      ...prev,
      references: [...prev.references, ""]
    }));
  };

  const removeReference = (index: number) => {
    setForm(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const updateReference = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      references: prev.references.map((r, i) => i === index ? value : r)
    }));
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="bg-gray-900 border-gray-800 text-center p-8">
          <CardContent>
            <div className="w-16 h-16 bg-science-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-science-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Research Article Created Successfully!</h2>
            <p className="text-gray-400">Redirecting to research list...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/research">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Research Article</h1>
          <p className="text-gray-400">Publish new research findings for Science Journal</p>
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
                <CardTitle>Research Article Details</CardTitle>
                <CardDescription className="text-science-400">
                  Add the title and abstract for your research
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter research article title..."
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
                    placeholder="Provide a brief summary of your research findings..."
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
                <CardTitle>Research Content *</CardTitle>
                <CardDescription>
                  Write your full research article using the rich text editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={form.content}
                  onChange={(content) => setForm(prev => ({ ...prev, content }))}
                  placeholder="Start writing your research article..."
                  className="min-h-[500px]"
                />
              </CardContent>
            </Card>

            {/* Contributors */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Contributors</CardTitle>
                <CardDescription>
                  Add all researchers and contributors to this work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.contributors.map((contributor, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={contributor}
                      onChange={(e) => updateContributor(index, e.target.value)}
                      placeholder="Contributor name and affiliation..."
                      className="bg-gray-800 border-gray-700"
                    />
                    {form.contributors.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeContributor(index)}
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
                  onClick={addContributor}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contributor
                </Button>
              </CardContent>
            </Card>

            {/* References */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>References</CardTitle>
                <CardDescription>
                  Add academic references and citations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.references.map((reference, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={reference}
                      onChange={(e) => updateReference(index, e.target.value)}
                      placeholder="Author, A. (Year). Title. Journal, Volume(Issue), pages."
                      className="bg-gray-800 border-gray-700"
                    />
                    {form.references.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeReference(index)}
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
                  onClick={addReference}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reference
                </Button>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
                <CardDescription>
                  Upload a visual representation of your research
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
                  <Label htmlFor="featured">Featured Research</Label>
                </div>
              </CardContent>
            </Card>

            {/* Academic Classification */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={form.department}
                    onValueChange={(value) => setForm(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
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
                    placeholder="machine learning, neuroscience, climate..."
                    className="bg-gray-800 border-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Separate keywords with commas
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
                    className="w-full bg-science-500 hover:bg-science-600"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : `${form.status === 'published' ? 'Publish' : 'Save'} Research`}
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
