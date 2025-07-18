"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { CommentService } from "@/lib/firebase-service";
import { Comment } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle, 
  Send, 
  User, 
  Calendar, 
  Edit, 
  Trash2, 
  Check, 
  X,
  AlertCircle,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommentsProps {
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
  showModeration?: boolean;
}

interface CommentFormData {
  content: string;
}

export function Comments({ contentId, contentType, showModeration = false }: CommentsProps) {
  const { user, hasPermission } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<CommentFormData>({ content: '' });
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, [contentId, contentType]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      let fetchedComments: Comment[] = [];
      
      if (showModeration) {
        // For moderation, get all comments regardless of status
        const allComments = await CommentService.getAllComments();
        fetchedComments = allComments.filter(comment => 
          comment.contentId === contentId && comment.contentType === contentType
        );
      } else {
        // For regular view, only get approved comments
        fetchedComments = await CommentService.getComments(contentId, contentType, 'approved', 50);
      }
      
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to comment");
      return;
    }

    if (!formData.content.trim()) {
      setError("Please enter a comment");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await CommentService.createComment(
        contentId,
        contentType,
        formData.content.trim(),
        user.uid,
        user.displayName || user.email || 'Anonymous'
      );

      setFormData({ content: '' });
      setSuccess("Comment posted successfully!");
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error creating comment:", error);
      setError("Failed to submit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await CommentService.updateComment(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent('');
      fetchComments();
      setSuccess("Comment updated successfully");
    } catch (error) {
      console.error("Error updating comment:", error);
      setError("Failed to update comment");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await CommentService.deleteComment(commentId);
      fetchComments();
      setSuccess("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError("Failed to delete comment");
    }
  };

  const handleModeration = async (commentId: string, status: 'approved' | 'rejected') => {
    try {
      await CommentService.updateCommentStatus(commentId, status);
      fetchComments();
      setSuccess(`Comment ${status} successfully`);
    } catch (error) {
      console.error("Error moderating comment:", error);
      setError("Failed to moderate comment");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading comments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comments Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-gray-400" />
        <h3 className="text-lg font-semibold">
          Comments ({comments.length})
        </h3>
        {showModeration && (
          <Badge variant="outline" className="ml-2">
            Moderation Mode
          </Badge>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive" className="bg-red-900/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-900/50 border-green-800">
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Comment Form */}
      {user && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <h4 className="text-sm font-medium">Add a Comment</h4>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Share your thoughts..."
                value={formData.content}
                onChange={(e) => setFormData({ content: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                rows={3}
                maxLength={1000}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {formData.content.length}/1000 characters
                </span>
                <Button
                  type="submit"
                  disabled={submitting || !formData.content.trim()}
                  size="sm"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="ml-2">Post Comment</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-sm">{comment.authorName}</span>
                    <span className="text-gray-500">•</span>
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  {showModeration && getStatusBadge(comment.status)}
                </div>

                {editingComment === comment.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(comment.id)}
                        disabled={!editContent.trim()}
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingComment(null);
                          setEditContent('');
                        }}
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-200 whitespace-pre-wrap">{comment.content}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      {showModeration && comment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleModeration(comment.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleModeration(comment.id, 'rejected')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <X className="h-3 w-3" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {(user?.uid === comment.authorId || hasPermission('admin')) && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditContent(comment.content);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(comment.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 