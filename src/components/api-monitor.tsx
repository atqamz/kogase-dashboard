'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function ApiMonitor() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { toast } = useToast();
  
  const checkBackendStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        if (!isAvailable) {
          // Only show the toast when the status changes from unavailable to available
          if (isAvailable === false) {
            toast({
              title: "Backend Connected",
              description: "Successfully connected to the backend server.",
              duration: 3000,
            });
          }
          setIsAvailable(true);
        }
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Backend connection error:', error);
      
      // Only show the toast when the status changes from available to unavailable
      if (isAvailable === true) {
        toast({
          title: "Backend Unavailable",
          description: "Unable to connect to the backend server. Some features may not work correctly.",
          variant: "destructive",
          duration: 5000,
        });
      }
      
      setIsAvailable(false);
    } finally {
      setLastChecked(new Date());
    }
  };
  
  useEffect(() => {
    // Check immediately on mount
    checkBackendStatus();
    
    // Then check periodically (every minute)
    const intervalId = setInterval(checkBackendStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // This component doesn't render anything visible to the user
  // It just monitors the API and shows toast notifications when status changes
  return null;
}