'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface AuthCheckProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthCheck({ 
  children, 
  requireAuth = true,
  redirectTo = requireAuth ? '/login' : '/dashboard/dashboard' 
}: AuthCheckProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip if still loading authentication state
    if (isLoading) return;

    // For auth-required routes: redirect to login if not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    }

    // For non-auth routes (like login): redirect to dashboard if already authenticated
    if (!requireAuth && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, pathname, requireAuth, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Don't render children if authentication doesn't match requirements
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // Authentication state matches requirements, render children
  return <>{children}</>;
}