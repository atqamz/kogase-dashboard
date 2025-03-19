import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// This would normally connect to a WebSocket or Server-Sent Events endpoint
// For now, we'll mock it with a simulated interval
export function useNotifications(projectId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Mock notifications - in a real app, this would connect to a WebSocket
  useEffect(() => {
    // Skip if no project selected
    if (!projectId) return;

    // Initial mock data
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'New sessions',
        message: '5 new game sessions started in the last hour',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        read: false,
      },
      {
        id: '2',
        type: 'success',
        title: 'Daily report',
        message: 'Your daily analytics report is ready',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
      },
    ];

    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter(n => !n.read).length);

    // Simulate receiving new notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of getting a notification
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'info' : 'success',
          title: Math.random() > 0.5 ? 'New session' : 'Event threshold',
          message: Math.random() > 0.5 
            ? 'A new game session has started' 
            : 'Daily active users exceeded threshold',
          timestamp: new Date(),
          read: false,
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep only last 20
        setUnreadCount(prev => prev + 1);

        // Show toast for new notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [projectId, toast]);

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}