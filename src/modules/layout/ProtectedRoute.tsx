'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/api';

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * ProtectedRoute component - wraps pages that require authentication
 *
 * @example
 * ```tsx
 * // In your page component
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export default function ProtectedRoute({
                                           children,
                                           redirectTo = '/login'
                                       }: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        // Wait for auth check to complete
        if (!loading && !isAuthenticated) {
            // Save the current path to redirect back after login
            const currentPath = window.location.pathname;
            const redirectPath = currentPath !== '/login'
                ? `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
                : redirectTo;

            router.push(redirectPath);
        }
    }, [isAuthenticated, loading, router, redirectTo]);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                         style={{ borderColor: 'var(--primary-600)', borderTopColor: 'transparent' }}
                    />
                    <p style={{ color: 'var(--neutral-600)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}