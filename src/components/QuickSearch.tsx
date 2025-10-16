'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { useRouter } from 'next/navigation';

export default function QuickSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex">
        <Input
          type="text"
          placeholder="Quick search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
    </form>
  );
}
