'use client';

import { useEffect, useState } from 'react';
import TweetCard from './TweetCard';

interface ProfileTweetsProps {
  userId: string;
  initialTweets: any[];
}

export default function ProfileTweets({ userId, initialTweets }: ProfileTweetsProps) {
  const [tweets, setTweets] = useState(initialTweets);
  const [loading, setLoading] = useState(false);

  const fetchTweets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tweets/user/${userId}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setTweets(data);
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tweets</h2>
      
      {loading ? (
        <div className="text-center py-4 text-muted-foreground">
          Loading...
        </div>
      ) : tweets.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No tweets yet
        </p>
      ) : (
        tweets.map((tweet: any) => (
          <TweetCard
            key={tweet._id}
            tweet={tweet}
            onUpdate={fetchTweets}
          />
        ))
      )}
    </div>
  );
}
