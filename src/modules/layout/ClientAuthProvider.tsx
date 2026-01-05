'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from './AuthProvider';

/**
 * Wrapper to ensure AuthProvider only loads on client
 * This prevents SSR issues with localStorage access
 */
export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render AuthProvider on server-side
  if (!mounted) {
    return <>{children}</>;
  }

  return <AuthProvider>{children}</AuthProvider>;
}
