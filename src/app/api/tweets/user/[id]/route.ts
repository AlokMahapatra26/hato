import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tweet from '@/lib/models/Tweet';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await dbConnect();
    
    const tweets = await Tweet.find({ author: id })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(Array.isArray(tweets) ? tweets : []);
  } catch (error: any) {
    console.error('Error fetching user tweets:', error);
    return NextResponse.json(
      { error: 'Error fetching tweets: ' + error.message }, 
      { status: 500 }
    );
  }
}
