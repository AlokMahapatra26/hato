import type { Metadata } from 'next';
import { Space_Grotesk, DM_Sans } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import MobileNav from '@/components/MobileNav';
import { getServerSession } from 'next-auth';
import SessionProvider from '@/components/SessionProvider';
import { authOptions } from './api/auth/[...nextauth]/route';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

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
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body className={dmSans.className}>
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
