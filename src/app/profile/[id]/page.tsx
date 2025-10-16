import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ProfileCard from '@/components/ProfileCard';
import StaticTweetCard from '@/components/StaticTweetCard';
import dbConnect from '@/lib/mongodb';
import Tweet from '@/lib/models/Tweet';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  await dbConnect();
  const tweets = await Tweet.find({ author: id })
    .populate('author', 'name username avatar')
    .sort({ createdAt: -1 })
    .lean();

  const serializedTweets = JSON.parse(JSON.stringify(tweets));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 border-b border-border pb-4">
        Profile
      </h1>
      
      <ProfileCard userId={id} />

      <h2 className="text-xl font-bold mb-4">Tweets</h2>
      
      {serializedTweets.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No tweets yet
        </p>
      ) : (
        serializedTweets.map((tweet: any) => (
          <StaticTweetCard
            key={tweet._id}
            tweet={tweet}
          />
        ))
      )}
    </div>
  );
}
