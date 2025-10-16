'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import CommentItem from './CommentItem';
import { MessageCircle } from 'lucide-react';

interface CommentSectionProps {
  tweetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentSection({ tweetId, isOpen, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, tweetId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments?tweetId=${tweetId}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

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
        setContent('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
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
        {loading ? (
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
              onDelete={fetchComments}
            />
          ))
        )}
      </div>
    </div>
  );
}
