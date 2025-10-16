'use client';

import { useSession } from 'next-auth/react';

export default function DebugSession() {
  const { data: session, status } = useSession();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-20 right-4 bg-black text-white p-4 rounded text-xs max-w-sm">
      <div>Status: {status}</div>
      <div>Session: {JSON.stringify(session, null, 2)}</div>
    </div>
  );
}
