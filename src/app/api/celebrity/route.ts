import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Tweet from '@/lib/models/Tweet';
import Comment from '@/lib/models/Comment';
import Follow from '@/lib/models/Follow';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Aggregate likes per user
    const likesAgg = await Tweet.aggregate([
      {
        $project: {
          author: 1,
          likesCount: { $size: { $ifNull: ['$likes', []] } },
        },
      },
      {
        $group: {
          _id: '$author',
          totalLikes: { $sum: '$likesCount' },
        },
      },
    ]);

    // Aggregate comments per user's tweets
    const commentsAgg = await Comment.aggregate([
      {
        $lookup: {
          from: 'tweets',
          localField: 'tweet',
          foreignField: '_id',
          as: 'tweetInfo',
        },
      },
      { $unwind: '$tweetInfo' },
      {
        $group: {
          _id: '$tweetInfo.author',
          totalComments: { $sum: 1 },
        },
      },
    ]);

    // Aggregate followers per user
    const followersAgg = await Follow.aggregate([
      {
        $group: {
          _id: '$following',
          followerCount: { $sum: 1 },
        },
      },
    ]);

    // Create lookup maps
    const likesMap = new Map(likesAgg.map(item => [item._id.toString(), item.totalLikes]));
    const commentsMap = new Map(commentsAgg.map(item => [item._id.toString(), item.totalComments]));
    const followersMap = new Map(followersAgg.map(item => [item._id.toString(), item.followerCount]));

    // Get all users and calculate scores
    const users = await User.find().select('-password').lean();

    const rankedUsers = users
      .map(user => {
        const userId = user._id.toString();
        const likes = likesMap.get(userId) || 0;
        const comments = commentsMap.get(userId) || 0;
        const followers = followersMap.get(userId) || 0;
        const engagementScore = (likes * 1) + (comments * 2) + (followers * 3);

        return {
          _id: user._id,
          name: user.name,
          username: user.username,
          bio: user.bio,
          avatar: user.avatar,
          stats: {
            likes,
            comments,
            followers,
            engagementScore,
          },
        };
      })
      .sort((a, b) => b.stats.engagementScore - a.stats.engagementScore)
      .slice(0, 50);

    return NextResponse.json(rankedUsers);
  } catch (error: any) {
    console.error('Error fetching celebrity rankings:', error);
    return NextResponse.json(
      { error: 'Error fetching rankings: ' + error.message }, 
      { status: 500 }
    );
  }
}
