'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import CommentItem from './CommentItem';
import { MessageCircle } from 'lucide-react';
import { useCommentStore } from '@/store/useCommentStore';

interface CommentSectionProps {
  tweetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentSection({ tweetId, isOpen, onClose }: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = useSession();
  
  const {
    commentsByTweet,
    loading,
    fetchComments,
    addComment,
    removeComment,
  } = useCommentStore();

  const comments = commentsByTweet[tweetId]?.comments || [];
  const isLoading = loading[tweetId] || false;

  useEffect(() => {
    if (isOpen) {
      fetchComments(tweetId);
    }
  }, [isOpen, tweetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tweetId }),
      });

      if (res.ok) {
        const newComment = await res.json();
        addComment(tweetId, newComment);
        setContent('');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      removeComment(tweetId, commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5" />
        <h3 className="font-semibold">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
      </div>

      {session && (
        <form onSubmit={handleSubmit} className="mb-4">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
            className="mb-2 resize-none"
            rows={2}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {content.length}/280
            </span>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={!content.trim() || submitting}
              >
                {submitting ? 'Posting...' : 'Comment'}
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment._id} 
              comment={comment} 
              onDelete={() => handleDelete(comment._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
