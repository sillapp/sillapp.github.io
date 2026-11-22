// Silla: guarda la app en el celular para que funcione sin internet.
const VERSION = 'silla-v13';
const ARCHIVOS = ['./', './index.html', './reserva.html', './r.html', './temas.js', './premium.css?v=29', './extras.json', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Páginas: primero internet (para recibir actualizaciones), si no hay, la copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); return r;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match('./index.html'))));
    return;
  }
  const url = new URL(req.url);
  // Datos en vivo (agenda, plan, reservas): siempre directo a internet, nunca desde la copia guardada.
  if (url.origin !== location.origin && url.hostname !== 'cdnjs.cloudflare.com') return;
  // Estilos, scripts y datos propios: primero internet, así nunca quedan desfasados.
  if (url.origin === location.origin && /\.(css|js|json)$/.test(url.pathname)) {
    e.respondWith(fetch(req).then(r => {
      if (r && r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); }
      return r;
    }).catch(() => caches.match(req, {ignoreSearch: true})));
    return;
  }
  // Resto (íconos, librería del QR): primero la copia guardada.
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const copia = res.clone(); caches.open(VERSION).then(c => c.put(req, copia)); }
    return res;
  })));
});
