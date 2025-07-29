self.addEventListener('push', event => {
  const payload = event.data.json();
  
  const options = {
    body: payload.body,
    icon: '/icon.png',
    data: { url: payload.url }
  };
  
  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});