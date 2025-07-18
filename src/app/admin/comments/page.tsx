"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  Check, 
  X, 
  Search, 
  RefreshCw,
  Loader2
} from "lucide-react";
import { CommentService } from "@/lib/firebase-service";
import { Comment } from "@/lib/models";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { formatDistanceToNow } from "date-fns";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);

  useEffect(() => {
    fetchComments();
  }, [activeTab]);

  useEffect(() => {
    filterComments();
  }, [comments, searchTerm]);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedComments = await CommentService.getAllComments(activeTab);
      setComments(fetchedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const filterComments = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredComments(comments);
      return;
    }

    const filtered = comments.filter(comment =>
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.contentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredComments(filtered);
  }, [comments, searchTerm]);

  const handleModeration = async (commentId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      await CommentService.updateCommentStatus(commentId, status);
      
      // Update local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setFilteredComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error("Error moderating comment:", error);
      setError("Failed to moderate comment");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await CommentService.deleteComment(commentId);
      
      // Update local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setFilteredComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError("Failed to delete comment");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "bg-green-500",
      pending: "bg-yellow-500",
      rejected: "bg-red-500"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-500"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getContentTypeLabel = (type: string) => {
    const labels = {
      article: 'Article',
      video: 'Video',
      research: 'Research',
      legal: 'Legal'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-gray-400">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Comments Moderation</h1>
              <p className="text-gray-400">Manage and moderate user comments</p>
            </div>
            <Button onClick={fetchComments} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {comments.filter(c => c.status === 'pending').length}
                    </p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Approved</p>
                    <p className="text-2xl font-bold text-green-400">
                      {comments.filter(c => c.status === 'approved').length}
                    </p>
                  </div>
                  <Check className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Rejected</p>
                    <p className="text-2xl font-bold text-red-400">
                      {comments.filter(c => c.status === 'rejected').length}
                    </p>
                  </div>
                  <X className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search comments by content, author, or content ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pending' | 'approved' | 'rejected')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {filteredComments.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">No {activeTab} comments found</p>
                </CardContent>
              </Card>
            ) : (
              filteredComments.map((comment) => (
                <Card key={comment.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{comment.authorName}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                          </span>
                          <span className="text-gray-500">•</span>
                          <Badge variant="outline" className="text-xs">
                            {getContentTypeLabel(comment.contentType)}
                          </Badge>
                          {getStatusBadge(comment.status)}
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{comment.content}</p>
                        <p className="text-xs text-gray-500">
                          Content ID: {comment.contentId}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {comment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleModeration(comment.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleModeration(comment.id, 'reject')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 