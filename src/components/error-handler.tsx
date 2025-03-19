'use client';

import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ApiError } from '@/lib/api-client';

export function ErrorHandler() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      // Only handle API errors
      if (event.error instanceof ApiError) {
        const error = event.error as ApiError;
        
        // Don't show auth errors as they're handled separately
        if (error.status === 401) {
          // Dispatch a custom auth error event
          window.dispatchEvent(
            new CustomEvent('auth-error', {
              detail: { requiresLogin: true }
            })
          );
          return;
        }
        
        // Show toast for API errors
        toast({
          title: `Error (${error.status})`,
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    };

    // Add error handler
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [toast]);

  // This component doesn't render anything
  return null;
}