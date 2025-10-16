import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import SearchUsers from '@/components/SearchUsers';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function SearchPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 border-b border-border pb-4">
        Search Users
      </h1>
      <SearchUsers />
    </div>
  );
}
