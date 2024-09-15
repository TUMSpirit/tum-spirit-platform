// public/service-worker.js

self.addEventListener('push', function (event) {
    const data = event.data.json();
    const title = data.title || 'New Message';
    const options = {
        body: data.body,
        icon: data.icon || '/favicon.png',
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
