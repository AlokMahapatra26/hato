import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Follow from '@/lib/models/Follow';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, action } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    await dbConnect();

    if (action === 'follow') {
      // Check if already following
      const existingFollow = await Follow.findOne({
        follower: session.user.id,
        following: userId,
      });

      if (existingFollow) {
        return NextResponse.json({ message: 'Already following' });
      }

      await Follow.create({
        follower: session.user.id,
        following: userId,
      });
      
      return NextResponse.json({ message: 'Followed successfully' });
    } else if (action === 'unfollow') {
      await Follow.deleteOne({
        follower: session.user.id,
        following: userId,
      });
      
      return NextResponse.json({ message: 'Unfollowed successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating follow:', error);
    return NextResponse.json(
      { error: 'Error updating follow: ' + error.message }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const followerId = searchParams.get('followerId');
    const followingId = searchParams.get('followingId');

    if (!followerId || !followingId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await dbConnect();

    const exists = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    return NextResponse.json({ isFollowing: !!exists });
  } catch (error: any) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Error checking follow status: ' + error.message }, 
      { status: 500 }
    );
  }
}
