'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import TweetCard from './TweetCard';
import CreateTweet from './CreateTweet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

export default function Feed() {
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedType, setFeedType] = useState('all');
  const { data: session } = useSession();

  const fetchTweets = async (type: string = feedType) => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch(`/api/tweets?userId=${session?.user?.id}&feedType=${type}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch tweets');
      }
      
      if (Array.isArray(data)) {
        setTweets(data);
      } else {
        console.error('Invalid response format:', data);
        setTweets([]);
        setError('Invalid data format received');
      }
    } catch (error: any) {
      console.error('Error fetching tweets:', error);
      setError(error.message || 'Failed to load tweets');
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchTweets();
    }
  }, [session?.user?.id, feedType]);

  const handleTabChange = (value: string) => {
    setFeedType(value);
    fetchTweets(value);
  };

  if (!session) return null;

  return (
    <div>
      <CreateTweet onTweetCreated={() => fetchTweets()} />
      
      <Tabs value={feedType} onValueChange={handleTabChange} className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All Tweets</TabsTrigger>
          <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading tweets...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          {error}
        </div>
      ) : tweets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {feedType === 'following' 
            ? "No tweets from people you follow yet. Try following some users!" 
            : "No tweets yet. Start by posting something!"}
        </div>
      ) : (
        tweets.map((tweet: any) => (
          <TweetCard key={tweet._id} tweet={tweet} onUpdate={() => fetchTweets()} />
        ))
      )}
    </div>
  );
}
