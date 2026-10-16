// Study reminders: the server sends an empty push, the text is shown here.
self.addEventListener('push', (event) => {
  event.waitUntil(self.registration.showNotification('Драго Райс — пора заниматься', {
    body: 'Хватит и одной минуты: пара заданий, и серия продолжается.',
    icon: '../favicon.svg',
    tag: 'habla-reminder',
    data: { url: './' },
  }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window' }).then((list) => {
    const open = list.find((c) => c.url.includes('/app/'));
    return open ? open.focus() : clients.openWindow(event.notification.data.url);
  }));
});
