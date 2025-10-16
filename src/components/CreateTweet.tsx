'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';

export default function CreateTweet({ onTweetCreated }: { onTweetCreated: () => void }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setContent('');
        onTweetCreated();
      }
    } catch (error) {
      console.error('Error creating tweet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <Card className="p-4 mb-4">
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={280}
          className="mb-2 resize-none"
          rows={3}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {content.length}/280
          </span>
          <Button type="submit" disabled={!content.trim() || loading}>
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
