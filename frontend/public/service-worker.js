// Service Worker for handling push notifications

// Listen for 'push' events from the backend
self.addEventListener('push', function(event) {
    const data = event.data.text() ? JSON.parse(event.data.text()) : {};

    const options = {
        body: data.body || 'You have a new notification!',
        icon: '/icons/icon-192x192.png',  // Optional: notification icon
        vibrate: [200, 100, 200],  // Optional: vibration pattern
        badge: '/icons/badge.png',  // Optional: badge for notifications
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', options)
    );
});

// Handle notification click event
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')  // Redirect to your app on click
    );
});
