"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageCircle, 
  Heart, 
  Reply, 

  Edit, 
  Trash2,
  User,
  Clock
} from "lucide-react";
import { CommentService } from "@/lib/firebase-service";
import { Comment } from "@/lib/models";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface CommentsProps {
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
}

interface CommentFormProps {
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
  parentId?: string;
  onCommentAdded: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

function CommentForm({ contentId, contentType, parentId, onCommentAdded, onCancel, placeholder }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await CommentService.addComment(
        contentId,
        contentType,
        user.uid,
        user.displayName || user.email || "Anonymous",
        content.trim(),
        parentId
      );
      setContent("");
      onCommentAdded();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4 text-gray-400">
        <MessageCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Please sign in to comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder || "Write a comment..."}
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}

function CommentItem({ 
  comment, 
  contentId, 
  contentType, 
  onCommentAdded,
  depth = 0 
}: { 
  comment: Comment; 
  contentId: string; 
  contentType: 'article' | 'video' | 'research' | 'legal';
  onCommentAdded: () => void;
  depth?: number;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(true);
  const { user } = useAuth();

  // const isAuthor = user?.uid === comment.authorId;
  const canModerate = user?.uid === comment.authorId;

  useEffect(() => {
    // Check if user has liked this comment
    if (user) {
      setIsLiked(comment.likedBy?.includes(user.uid) || false);
    }
  }, [comment.likedBy, user]);

  useEffect(() => {
    // Load replies if this comment has any
    if (comment.replies && comment.replies.length > 0) {
      loadReplies();
    }
  }, [comment.replies]);

  const loadReplies = async () => {
    try {
      const replyComments: Comment[] = [];
      for (const replyId of comment.replies) {
        const reply = await CommentService.getComment(replyId);
        if (reply) {
          replyComments.push(reply);
        }
      }
      setReplies(replyComments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));
    } catch (error) {
      console.error("Error loading replies:", error);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      await CommentService.toggleCommentLike(comment.id, user.uid);
      setIsLiked(!isLiked);
      // Update the comment's like count optimistically
      comment.likes += isLiked ? -1 : 1;
      if (isLiked) {
        comment.likedBy = comment.likedBy?.filter(id => id !== user.uid) || [];
      } else {
        comment.likedBy = [...(comment.likedBy || []), user.uid];
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      await CommentService.editComment(comment.id, editContent.trim());
      comment.content = editContent.trim();
      comment.isEdited = true;
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await CommentService.deleteComment(comment.id);
      onCommentAdded(); // Refresh comments
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-6 border-l border-gray-700 pl-4")}>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={comment.authorProfileImage} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-white">{comment.authorName}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(comment.createdAt)}
                </span>
                {comment.isEdited && (
                  <Badge variant="secondary" className="text-xs">Edited</Badge>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleEdit}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
              )}
              
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-1 text-xs transition-colors",
                    isLiked ? "text-red-400" : "text-gray-400 hover:text-gray-300"
                  )}
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                  <span>{comment.likes}</span>
                </button>
                
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <Reply className="h-4 w-4" />
                  <span>Reply</span>
                </button>
                
                {canModerate && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {isReplying && (
        <div className="ml-11">
          <CommentForm
            contentId={contentId}
            contentType={contentType}
            parentId={comment.id}
            onCommentAdded={() => {
              setIsReplying(false);
              onCommentAdded();
            }}
            onCancel={() => setIsReplying(false)}
            placeholder={`Replying to ${comment.authorName}...`}
          />
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-3">
          {showReplies && replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              contentId={contentId}
              contentType={contentType}
              onCommentAdded={onCommentAdded}
              depth={depth + 1}
            />
          ))}
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-gray-400 hover:text-gray-300 ml-11"
          >
            {showReplies ? `Hide ${replies.length} replies` : `Show ${replies.length} replies`}
          </button>
        </div>
      )}
    </div>
  );
}

export function Comments({ contentId, contentType }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedComments = await CommentService.getComments(contentId, contentType);
      setComments(fetchedComments);
    } catch (err) {
      console.error("Error loading comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [contentId, contentType, loadComments]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading comments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>
        <div className="text-center py-8 text-red-400">
          <p>{error}</p>
          <Button onClick={loadComments} variant="outline" size="sm" className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <CommentForm
        contentId={contentId}
        contentType={contentType}
        onCommentAdded={loadComments}
      />

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="h-8 w-8 mx-auto mb-2" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              contentId={contentId}
              contentType={contentType}
              onCommentAdded={loadComments}
            />
          ))
        )}
      </div>
    </div>
  );
} 