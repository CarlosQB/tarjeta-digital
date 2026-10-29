self.addEventListener('install', event => {
    console.log('SW instalado');
});

self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request));
});