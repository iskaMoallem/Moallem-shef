const CACHE_NAME = 'mom-recipes-v5';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './assets/logo.png',
  './manifest.json',
  './js/db.js',
  './js/ui.js',
  './js/recipe.js',
  './js/calc.js',
  './js/backup.js',
  './js/timer.js',
  './js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
