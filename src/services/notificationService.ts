import { supabase } from '@/lib/supabase';

export interface NotificationSubscription {
  homeownerId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (homeownerId: string): Promise<boolean> => {
  try {
    const permission = await requestNotificationPermission();
    if (!permission) {
      console.log('Notification permission denied');
      return false;
    }

    // For now, just save that notifications are enabled
    // Full push notification setup requires VAPID keys
    console.log('Notifications enabled for homeowner:', homeownerId);
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
};

// Send local notification (for testing)
export const sendLocalNotification = (title: string, body: string, icon?: string) => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: icon || '/arctic-roofing-logo.png',
        badge: '/arctic-roofing-logo.png',
        tag: 'arctic-roofing',
        requireInteraction: false,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  } else {
    console.log('Notification permission not granted');
  }
};