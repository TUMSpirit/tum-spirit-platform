self.addEventListener('push', (event) => {
    console.log("testt");
    let pushData = event.data.json();
    if (!pushData || !pushData.title) {
        console.error('Received WebPush with an empty title. Received body: ', pushData);
    }
    const title = "New Message!";
    const options = {
        body: "sent a message in the chat",
        vibrate: [300, 100, 400]
    };

     await self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    if (!event.notification.data || !event.notification.data.url) {
        return;
    }
    clients.openWindow(event.notification.data.url);
});
