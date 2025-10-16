'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, LogOut, Search } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from './ui/button';

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  if (!session) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex justify-around items-center h-16 px-4">
        <Link href="/">
          <Button
            variant={isActive('/') ? 'secondary' : 'ghost'}
            size="icon"
          >
            <Home className="h-5 w-5" />
          </Button>
        </Link>

        <Link href="/search">
          <Button
            variant={isActive('/search') ? 'secondary' : 'ghost'}
            size="icon"
          >
            <Search className="h-5 w-5" />
          </Button>
        </Link>
        
        <Link href={`/profile/${session.user.id}`}>
          <Button
            variant={isActive(`/profile/${session.user.id}`) ? 'secondary' : 'ghost'}
            size="icon"
          >
            <User className="h-5 w-5" />
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
