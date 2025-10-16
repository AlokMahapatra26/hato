import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Follow from '@/lib/models/Follow';
import Tweet from '@/lib/models/Tweet';
import Comment from '@/lib/models/Comment';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await dbConnect();
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const followersCount = await Follow.countDocuments({ following: id });
    const followingCount = await Follow.countDocuments({ follower: id });

    return NextResponse.json({
      ...user.toObject(),
      followersCount,
      followingCount,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is editing their own profile
    if (session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, username, bio } = body;
    
    await dbConnect();

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: id } 
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' }, 
          { status: 400 }
        );
      }
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { 
        $set: { 
          name: name || undefined,
          username: username || undefined,
          bio: bio !== undefined ? bio : undefined,
        } 
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is deleting their own account
    if (session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Delete all user's data
    await Promise.all([
      // Delete user's tweets
      Tweet.deleteMany({ author: id }),
      // Delete user's comments
      Comment.deleteMany({ author: id }),
      // Delete user's follow relationships
      Follow.deleteMany({ $or: [{ follower: id }, { following: id }] }),
      // Delete the user
      User.findByIdAndDelete(id),
    ]);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error deleting account' }, { status: 500 });
  }
}
