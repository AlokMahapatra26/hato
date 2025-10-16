'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, LogOut, Search } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from './ui/button';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  if (!session) return null;

  return (
    <nav className="hidden md:flex md:flex-col h-screen w-64 border-r border-border p-4 fixed left-0 top-0">
      <div className="flex flex-col gap-2">
        <Link href="/">
          <Button
            variant={isActive('/') ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <Home className="mr-2 h-5 w-5" />
            Home
          </Button>
        </Link>

        <Link href="/search">
          <Button
            variant={isActive('/search') ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <Search className="mr-2 h-5 w-5" />
            Search
          </Button>
        </Link>
        
        <Link href={`/profile/${session.user.id}`}>
          <Button
            variant={isActive(`/profile/${session.user.id}`) ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <User className="mr-2 h-5 w-5" />
            Profile
          </Button>
        </Link>
      </div>

      <div className="mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </nav>
  );
}
