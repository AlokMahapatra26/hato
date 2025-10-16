'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Pencil, Trash2 } from 'lucide-react';
import EditProfileDialog from './EditProfileDialog';
import DeleteAccountDialog from './DeleteAccountDialog';

interface ProfileCardProps {
  userId: string;
}

export default function ProfileCard({ userId }: ProfileCardProps) {
  const [user, setUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { data: session, status } = useSession();

  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    fetchUser();
    if (!isOwnProfile && session?.user?.id) {
      checkFollowStatus();
    }
  }, [userId, session?.user?.id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      
      if (res.ok) {
        setUser(data);
      } else {
        console.error('Error fetching user:', data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(
        `/api/follow?followerId=${session?.user?.id}&followingId=${userId}`
      );
      const data = await res.json();
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (actionLoading) return;
    
    if (!session?.user?.id) {
      alert('Please log in to follow users');
      return;
    }
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });
      
      if (res.ok) {
        setIsFollowing(!isFollowing);
        fetchUser();
      }
    } catch (error) {
      console.error('Error updating follow:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 mb-4">
        <div className="text-center py-4 text-muted-foreground">Loading profile...</div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="p-6 mb-4">
        <div className="text-center py-4 text-destructive">User not found</div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 mb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>

              {isOwnProfile ? (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setEditDialogOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => setDeleteDialogOpen(true)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : session && (
                <Button 
                  onClick={handleFollow} 
                  variant={isFollowing ? 'outline' : 'default'}
                  disabled={actionLoading || status === 'loading'}
                >
                  {actionLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
                </Button>
              )}
            </div>

            {user.bio && <p className="mb-3">{user.bio}</p>}

            <div className="flex gap-4 text-sm">
              <span>
                <strong>{user.followingCount || 0}</strong> Following
              </span>
              <span>
                <strong>{user.followersCount || 0}</strong> Followers
              </span>
            </div>
          </div>
        </div>
      </Card>

      {isOwnProfile && (
        <>
          <EditProfileDialog
            user={user}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={fetchUser}
          />
          <DeleteAccountDialog
            userId={user._id}
            username={user.username}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </>
  );
}
