'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Trophy, Heart, MessageCircle, Users, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCelebrityStore } from '@/store/useCelebrityStore';

export default function CelebrityRankings() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const {
    rankings,
    followingStates,
    loading,
    fetchRankings,
    updateFollowState,
    checkFollowStatuses,
  } = useCelebrityStore();

  useEffect(() => {
    fetchRankings();
  }, []);

  useEffect(() => {
    if (session?.user?.id && rankings.length > 0) {
      checkFollowStatuses(session.user.id, rankings);
    }
  }, [session?.user?.id, rankings.length]);

  const handleFollow = async (userId: string) => {
    if (!session?.user?.id) {
      alert('Please log in to follow users');
      return;
    }

    try {
      const isFollowing = followingStates[userId];
      
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });
      
      if (res.ok) {
        updateFollowState(userId, !isFollowing);
        // Force refresh rankings to update follower counts
        fetchRankings(true);
      }
    } catch (error) {
      console.error('Error updating follow:', error);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-yellow-600';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  if (loading && rankings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading rankings...
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users to rank yet. Start posting and engaging!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded">
        <Trophy className="h-5 w-5 text-yellow-600" />
        <div>
          <h3 className="font-semibold">Celebrity Rankings</h3>
          <p className="text-xs text-muted-foreground">
            Ranked by engagement: Likes × 1 + Comments × 2 + Followers × 3
          </p>
        </div>
      </div>

      {rankings.map((user, index) => (
        <Card key={user._id} className="p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center justify-center min-w-[3rem]">
              <div className={`text-2xl font-bold ${getRankColor(index)}`}>
                {getRankIcon(index)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>{user.stats.engagementScore}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => router.push(`/profile/${user._id}`)}
                >
                  <Avatar className="h-12 w-12 hover:opacity-80 transition-opacity">
                    <AvatarFallback>
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate hover:underline">
                      {user.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>

                {session?.user?.id !== user._id && session && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(user._id);
                    }}
                    variant={followingStates[user._id] ? 'outline' : 'default'}
                    size="sm"
                  >
                    {followingStates[user._id] ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>

              {user.bio && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {user.bio}
                </p>
              )}

              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span className="font-semibold">{user.stats.likes}</span>
                  <span className="text-muted-foreground">Likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span className="font-semibold">{user.stats.comments}</span>
                  <span className="text-muted-foreground">Comments</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="font-semibold">{user.stats.followers}</span>
                  <span className="text-muted-foreground">Followers</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
