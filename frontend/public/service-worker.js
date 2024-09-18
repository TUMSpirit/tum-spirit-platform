self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'You have a new notification!',
        icon: data.icon || '/icon.png',
        data: { url: data.url || '/' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'New Notification!', options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    if (!event.notification.data || !event.notification.data.url) {
        return;
    }
    clients.openWindow(event.notification.data.url);
});
