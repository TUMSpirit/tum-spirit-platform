self.addEventListener('push', (event) => {
    let pushData = event.data.json();
    if (!pushData || !pushData.title) {
        console.error('Received WebPush with an empty title. Received body: ', pushData);
    }
    self.registration.showNotification(pushData.title, pushData)
        .then(() => {
            // Optional analytics tracking
        });
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    if (!event.notification.data || !event.notification.data.url) {
        return;
    }
    clients.openWindow(event.notification.data.url);
});
