export const subscribeToPushNotifications = async (userId: string): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      localStorage.setItem('notificationsEnabled', 'true');
      localStorage.setItem('notificationUserId', userId);
      
      new Notification('Notifications Enabled! 🔔', {
        body: 'You will receive updates about your project.',
        icon: '/icon-192.png',  // ← Your icon
        badge: '/icon-192.png', // ← Your icon
        tag: 'notification-enabled',
        requireInteraction: false,
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
};

export const sendNotification = (title: string, body: string, tag?: string) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',  // ← Your icon
      badge: '/icon-192.png', // ← Your icon
      tag: tag || 'project-update',
      requireInteraction: false,
      silent: false,
    });

    setTimeout(() => notification.close(), 10000);
  }
};

