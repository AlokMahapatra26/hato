import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Tweet from '@/lib/models/Tweet';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before using
    const { id } = await params;
    const { action } = await request.json();
    
    await dbConnect();

    const tweet = await Tweet.findById(id);
    
    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
    }

    if (action === 'like') {
      if (!tweet.likes.includes(session.user.id)) {
        tweet.likes.push(session.user.id);
      }
    } else if (action === 'unlike') {
      tweet.likes = tweet.likes.filter(
        (likeId: any) => likeId.toString() !== session.user.id
      );
    }

    await tweet.save();
    
    const populatedTweet = await Tweet.findById(tweet._id)
      .populate('author', 'name username avatar')
      .lean();

    return NextResponse.json(populatedTweet);
  } catch (error: any) {
    console.error('Error updating tweet:', error);
    return NextResponse.json({ error: 'Error updating tweet' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before using
    const { id } = await params;
    
    await dbConnect();
    const tweet = await Tweet.findById(id);
    
    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
    }

    if (tweet.author.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await tweet.deleteOne();
    return NextResponse.json({ message: 'Tweet deleted' });
  } catch (error: any) {
    console.error('Error deleting tweet:', error);
    return NextResponse.json({ error: 'Error deleting tweet' }, { status: 500 });
  }
}
