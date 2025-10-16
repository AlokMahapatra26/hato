import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Tweet from '@/lib/models/Tweet';
import Follow from '@/lib/models/Follow';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const feedType = searchParams.get('feedType') || 'all'; // 'all' or 'following'
    
    await dbConnect();

    let query = {};
    
    if (feedType === 'following' && userId) {
      try {
        // Get tweets from people the user follows + their own tweets
        const following = await Follow.find({ follower: userId }).lean();
        const followingIds = following.map(f => f.following.toString());
        
        // Include user's own tweets and followed users' tweets
        query = { author: { $in: [...followingIds, userId] } };
      } catch (err) {
        console.error('Error fetching follows:', err);
        // If error, show all tweets
        query = {};
      }
    }
    // If feedType is 'all' or no userId, show all tweets

    const tweets = await Tweet.find(query)
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(Array.isArray(tweets) ? tweets : []);
  } catch (error: any) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json(
      { error: 'Error fetching tweets: ' + error.message }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 });
    }

    await dbConnect();
    
    const tweet = await Tweet.create({
      content: content.trim(),
      author: session.user.id,
    });

    const populatedTweet = await Tweet.findById(tweet._id)
      .populate('author', 'name username avatar')
      .lean();

    return NextResponse.json(populatedTweet, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tweet:', error);
    return NextResponse.json(
      { error: 'Error creating tweet: ' + error.message }, 
      { status: 500 }
    );
  }
}
