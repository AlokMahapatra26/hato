import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Comment from '@/lib/models/Comment';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tweetId = searchParams.get('tweetId');
    
    if (!tweetId) {
      return NextResponse.json({ error: 'Tweet ID is required' }, { status: 400 });
    }

    await dbConnect();

    const comments = await Comment.find({ tweet: tweetId })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(Array.isArray(comments) ? comments : []);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Error fetching comments: ' + error.message }, 
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

    const { content, tweetId } = await request.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 });
    }

    if (!tweetId) {
      return NextResponse.json({ error: 'Tweet ID is required' }, { status: 400 });
    }

    await dbConnect();
    
    const comment = await Comment.create({
      content: content.trim(),
      author: session.user.id,
      tweet: tweetId,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name username avatar')
      .lean();

    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Error creating comment: ' + error.message }, 
      { status: 500 }
    );
  }
}
