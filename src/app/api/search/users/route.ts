import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    await dbConnect();

    // Search by name or username
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
      ],
    })
      .select('-password')
      .limit(20)
      .lean();

    return NextResponse.json(Array.isArray(users) ? users : []);
  } catch (error: any) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Error searching users: ' + error.message }, 
      { status: 500 }
    );
  }
}
