/* global self */
// Basic service worker for Web Push notifications

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    try {
        const data = event.data ? event.data.json() : {};
        const title = data.title || 'Notification';
        const options = {
            body: data.body || '',
            icon: data.icon || '/network-detection.svg',
            badge: data.badge || '/network-detection.svg',
            data: data.data || {},
        };
        event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
        // Fallback if payload wasn't JSON
        event.waitUntil(self.registration.showNotification('Notification', { body: 'You have a new message.' }));
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification && event.notification.data && event.notification.data.url) || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.focus();
                    return;
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});


