'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import TweetCard from './TweetCard';
import CreateTweet from './CreateTweet';
import CelebrityRankings from './CelebrityRanking';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { useTweetStore } from '@/store/useTweetStore';
import { useState } from 'react';

export default function Feed() {
  const [activeTab, setActiveTab] = useState('all');
  const { data: session } = useSession();
  
  const {
    allTweets,
    followingTweets,
    loading,
    fetchAllTweets,
    fetchFollowingTweets,
    addTweet,
  } = useTweetStore();

  useEffect(() => {
    if (session?.user?.id) {
      if (activeTab === 'all') {
        fetchAllTweets(session.user.id);
      } else if (activeTab === 'following') {
        fetchFollowingTweets(session.user.id);
      }
    }
  }, [session?.user?.id, activeTab]);

  const handleTweetCreated = (newTweet: any) => {
    addTweet(newTweet);
  };

  const handleRefresh = () => {
    if (session?.user?.id) {
      if (activeTab === 'all') {
        fetchAllTweets(session.user.id, true); // force refresh
      } else if (activeTab === 'following') {
        fetchFollowingTweets(session.user.id, true); // force refresh
      }
    }
  };

  if (!session) return null;

  const currentTweets = activeTab === 'all' ? allTweets : followingTweets;

  return (
    <div>
      <CreateTweet onTweetCreated={handleTweetCreated} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="all">All Tweets</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="celebrity">Celebrity</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tweets...
            </div>
          ) : currentTweets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tweets yet. Start by posting something!
            </div>
          ) : (
            currentTweets.map((tweet: any) => (
              <TweetCard key={tweet._id} tweet={tweet} onUpdate={handleRefresh} />
            ))
          )}
        </TabsContent>

        <TabsContent value="following" className="mt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tweets...
            </div>
          ) : currentTweets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tweets from people you follow yet. Try following some users!
            </div>
          ) : (
            currentTweets.map((tweet: any) => (
              <TweetCard key={tweet._id} tweet={tweet} onUpdate={handleRefresh} />
            ))
          )}
        </TabsContent>

        <TabsContent value="celebrity" className="mt-4">
          <CelebrityRankings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
