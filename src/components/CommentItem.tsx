'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import Link from 'next/link';

interface CommentItemProps {
  comment: any;
  onDelete: () => void;
}

export default function CommentItem({ comment, onDelete }: CommentItemProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const isAuthor = comment.author._id === session?.user?.id;

  const handleDelete = async () => {
    if (loading || !confirm('Delete this comment?')) return;
    setLoading(true);

    try {
      await fetch(`/api/comments/${comment._id}`, {
        method: 'DELETE',
      });
      onDelete();
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 p-3 bg-muted/50 rounded">
      <Link href={`/profile/${comment.author._id}`} className="shrink-0">
        <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarFallback className="text-xs">
            {comment.author.name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <Link href={`/profile/${comment.author._id}`} className="hover:underline">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">
                {comment.author.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                @{comment.author.username}
              </span>
            </div>
          </Link>

          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        <p className="text-sm whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
