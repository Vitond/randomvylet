

const CACHE_STATIC = 'STATIC-v1';


self.addEventListener('install', () => {
  caches.open(CACHE_STATIC)
    .then(cache => {
      cache.addAll([
        '/',
        '/index.html',
        'https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap',
        '/public/css/style.css',
        '/public/js/index.js',
        '/public/img/refresh.svg',
        '/public/img/icon.svg',
        '/manifest.json'
      ])
    })
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        } else {
          return fetch(event.request);
        }
      })
  )
});