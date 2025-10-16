'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, Trash2, MessageCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import Link from 'next/link';
import CommentSection from './CommentSection';
import { useTweetStore } from '@/store/useTweetStore';
import { useCommentStore } from '@/store/useCommentStore';

interface TweetCardProps {
  tweet: any;
  onUpdate: () => void;
}

export default function TweetCard({ tweet, onUpdate }: TweetCardProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { updateTweet, removeTweet } = useTweetStore();
  const { fetchComments, getCommentCount } = useCommentStore();

  const isLiked = tweet.likes?.includes(session?.user?.id);
  const isAuthor = tweet.author._id === session?.user?.id;
  const commentCount = getCommentCount(tweet._id);

  useEffect(() => {
    // Pre-fetch comment count for display
    fetchComments(tweet._id);
  }, [tweet._id]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/tweets/${tweet._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' }),
      });

      if (res.ok) {
        const updatedTweet = await res.json();
        updateTweet(tweet._id, updatedTweet);
      }
    } catch (error) {
      console.error('Error liking tweet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading || !confirm('Delete this tweet?')) return;
    setLoading(true);

    try {
      await fetch(`/api/tweets/${tweet._id}`, {
        method: 'DELETE',
      });
      removeTweet(tweet._id);
    } catch (error) {
      console.error('Error deleting tweet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
    if (!showComments) {
      fetchComments(tweet._id, true); // Force refresh when opening
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex gap-3">
        <Link href={`/profile/${tweet.author._id}`} className="shrink-0">
          <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarFallback>
              {tweet.author.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/profile/${tweet.author._id}`} className="hover:underline">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold truncate">{tweet.author.name}</span>
              <span className="text-sm text-muted-foreground truncate">
                @{tweet.author.username}
              </span>
            </div>
          </Link>

          <p className="mb-3 whitespace-pre-wrap break-words">{tweet.content}</p>

          <div className="flex gap-4 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={loading}
              className="gap-2"
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
              />
              <span>{tweet.likes?.length || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommentToggle}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{commentCount}</span>
            </Button>

            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <CommentSection 
            tweetId={tweet._id}
            isOpen={showComments}
            onClose={() => setShowComments(false)}
          />
        </div>
      </div>
    </Card>
  );
}
