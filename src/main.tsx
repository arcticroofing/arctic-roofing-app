import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker with keep-alive
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered');
        
        // Request persistent storage
        if (navigator.storage && navigator.storage.persist) {
          navigator.storage.persist().then((persistent) => {
            console.log('Persistent storage:', persistent);
          });
        }
        
        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'KEEP_ALIVE') {
            // Respond to keep worker alive
            registration.active?.postMessage({ type: 'KEEP_ALIVE_RESPONSE' });
          }
        });
        
        // Request periodic background sync (if supported)
        if ('periodicSync' in registration) {
          (registration as any).periodicSync.register('check-updates', {
            minInterval: 60 * 1000, // 1 minute
          }).catch(() => {});
        }
      })
      .catch(() => {});
  });
  
  // Keep checking for updates when app becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  });
}

// Request persistent storage on iOS
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist();
}

// Prevent iOS from clearing localStorage
window.addEventListener('beforeunload', () => {
  localStorage.setItem('_lastActive', Date.now().toString());
});
