import { supabase } from '@/lib/supabase';

export interface NotificationSubscription {
  homeownerId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.log('Notifications not supported on this device');
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

// Register service worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (homeownerId: string): Promise<boolean> => {
  try {
    // Request permission
    const permission = await requestNotificationPermission();
    if (!permission) {
      console.log('Notification permission denied');
      return false;
    }

    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      console.log('Service worker registration failed');
      return false;
    }

    // Save to localStorage that notifications are enabled
    localStorage.setItem('notifications_enabled', 'true');
    localStorage.setItem('homeowner_id', homeownerId);

    console.log('Notifications enabled for homeowner:', homeownerId);
    
    // Show test notification
    showTestNotification();
    
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
};

// Show test notification
export const showTestNotification = () => {
  if (Notification.permission === 'granted') {
    new Notification('Notifications Enabled! 🔔', {
      body: 'You will now receive updates about your project',
      icon: '/arctic-roofing-logo.png',
      badge: '/arctic-roofing-logo.png',
      tag: 'test-notification',
    });
  }
};

// Send local notification
export const sendLocalNotification = (title: string, body: string, icon?: string) => {
  if (!isNotificationSupported()) {
    console.log('Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  try {
    // Check if notifications are enabled for this user
    const notificationsEnabled = localStorage.getItem('notifications_enabled') === 'true';
    
    if (!notificationsEnabled) {
      console.log('Notifications not enabled by user');
      return;
    }

    // Create notification
    const notification = new Notification(title, {
      body,
      icon: icon || '/arctic-roofing-logo.png',
      badge: '/arctic-roofing-logo.png',
      tag: 'arctic-roofing-update',
      requireInteraction: false,
      silent: false,
    });

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    console.log('Notification sent:', title);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Check if notifications are enabled
export const areNotificationsEnabled = (): boolean => {
  return (
    Notification.permission === 'granted' &&
    localStorage.getItem('notifications_enabled') === 'true'
  );
};