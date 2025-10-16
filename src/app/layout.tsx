import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import MobileNav from '@/components/MobileNav';
import { getServerSession } from 'next-auth';
import SessionProvider from '@/components/SessionProvider';
import { authOptions } from './api/auth/[...nextauth]/route';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Twitter Clone',
  description: 'A minimalistic Twitter-like social media app',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <div className="min-h-screen">
            <Navigation />
            <main className="md:ml-64 pb-16 md:pb-0">
              <div className="max-w-2xl mx-auto p-4">
                {children}
              </div>
            </main>
            <MobileNav />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
