'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserCardProps {
  user: any;
}

export default function UserCard({ user }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const isOwnProfile = session?.user?.id === user._id;

  useEffect(() => {
    if (!isOwnProfile && session?.user?.id) {
      checkFollowStatus();
    }
  }, [user._id, session?.user?.id]);

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(
        `/api/follow?followerId=${session?.user?.id}&followingId=${user._id}`
      );
      const data = await res.json();
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });
      
      if (res.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error updating follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = () => {
    router.push(`/profile/${user._id}`);
  };

  return (
    <Card className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <Link href={`/profile/${user._id}`} className="shrink-0">
          <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarFallback>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleProfileClick}>
          <h3 className="font-semibold truncate hover:underline">
            {user.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            @{user.username}
          </p>
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>

        {!isOwnProfile && session && (
          <Button 
            onClick={handleFollow}
            variant={isFollowing ? 'outline' : 'default'}
            size="sm"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
          </Button>
        )}
      </div>
    </Card>
  );
}
