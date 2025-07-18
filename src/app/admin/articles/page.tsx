"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle,
  Loader2,
  Calendar,
  Clock
} from "lucide-react";
import { ArticleService } from "@/lib/firebase-service";
import { Article } from "@/lib/models";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const fetchedArticles = await ArticleService.getAllArticles();
      setArticles(fetchedArticles);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    
    try {
      await ArticleService.deleteArticle(id);
      setArticles(articles.filter(article => article.id !== id));
    } catch (err) {
      console.error("Error deleting article:", err);
      setError("Failed to delete article");
    }
  };

  const handleUpdatePublicationDate = async (id: string) => {
    try {
      setUpdating(id);
      await ArticleService.updateArticle(id, {
        publishedAt: new Date(), // Set to current date
        updatedAt: new Date()
      });
      await fetchArticles(); // Refresh the list
    } catch (err) {
      console.error("Error updating publication date:", err);
      setError("Failed to update publication date");
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isFutureDate = (date: Date) => {
    return date > new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-gray-400">Manage all articles in the system</p>
        </div>
        <Link href="/admin/articles/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Article
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-900/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Articles</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Published</p>
                <p className="text-2xl font-bold">{articles.filter(a => a.status === 'published').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Drafts</p>
                <p className="text-2xl font-bold">{articles.filter(a => a.status === 'draft').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Featured</p>
                <p className="text-2xl font-bold">{articles.filter(a => a.featured).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles List */}
      {articles.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400 mb-4">No articles found</p>
            <Link href="/admin/articles/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Article
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <Card key={article.id} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {article.title}
                      {article.featured && (
                        <Badge className="bg-yellow-500 text-black">Featured</Badge>
                      )}
                      <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                        {article.status}
                      </Badge>
                      {isFutureDate(article.publishedAt) && (
                        <Badge variant="destructive" className="bg-orange-500">
                          Future Date
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {article.excerpt || "No excerpt provided"}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span>By {article.authorName}</span>
                      <span>•</span>
                      <span>{article.category}</span>
                      <span>•</span>
                      <span>{article.section}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Published: {formatDate(article.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated: {formatDate(article.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isFutureDate(article.publishedAt) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdatePublicationDate(article.id)}
                        disabled={updating === article.id}
                      >
                        {updating === article.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Fix Date"
                        )}
                      </Button>
                    )}
                    <Link href={`/admin/articles/${article.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
