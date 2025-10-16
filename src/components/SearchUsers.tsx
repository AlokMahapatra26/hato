'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import UserCard from './UserCrad';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchUsers() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      searchUsers(debouncedQuery);
    } else {
      setUsers([]);
    }
  }, [debouncedQuery]);

  const searchUsers = async (searchQuery: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/search/users?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users by name or username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          Searching...
        </div>
      )}

      {!loading && query.trim().length > 0 && users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users found matching "{query}"
        </div>
      )}

      {!loading && query.trim().length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Start typing to search for users
        </div>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <UserCard key={user._id} user={user} />
        ))}
      </div>
    </div>
  );
}
