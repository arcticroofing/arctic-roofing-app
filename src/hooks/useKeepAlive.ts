import { useEffect } from 'react';

export const useKeepAlive = () => {
  useEffect(() => {
    // Prevent iOS from suspending
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        // Wake lock not supported
      }
    };

    // Request wake lock when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    requestWakeLock();

    // Keep connection alive with periodic pings
    const keepAlive = setInterval(() => {
      fetch('/manifest.json', { method: 'HEAD' }).catch(() => {});
    }, 25000);

    return () => {
      clearInterval(keepAlive);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, []);
};
