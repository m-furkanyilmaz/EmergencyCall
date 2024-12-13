self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('push-notifications-cache').then(cache => {
        return cache.addAll([
          '/index.html', // Kullanıcıyla etkileşimde bulunabileceğiniz statik dosyalar
          '/style.css',
          '/script.js'
        ]);
      })
    );
  });
  
  self.addEventListener('push', event => {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
      })
    );
});