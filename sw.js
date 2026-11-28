// Silla: guarda la app en el celular para que funcione sin internet.
const VERSION = 'silla-v22';
const ARCHIVOS = ['./', './index.html', './reserva.html', './r.html', './temas.js', './premium.css?v=37', './extras.json', './manifest.webmanifest',
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

// Al tocar una notificación: abre Silla (o la trae al frente) en la pantalla indicada.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if ('focus' in c) { c.navigate(url).catch(() => {}); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
// Aviso diario de publicación, aunque la app esté cerrada (si el teléfono lo permite).
self.addEventListener('periodicsync', e => {
  if (e.tag !== 'silla-pub') return;
  e.waitUntil(caches.open('silla-pub').then(c => c.match('./__pub').then(r => r && r.json().then(p => {
    const d = new Date(), pad = n => String(n).padStart(2, '0'), f = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const [hh, mm] = String(p.h || '10:00').split(':').map(Number);
    if (!p.on || (p.d || []).indexOf(d.getDay()) < 0 || p.hecha === f || p.avisada === f || d.getHours() * 60 + d.getMinutes() < hh * 60 + (mm || 0)) return;
    p.avisada = f;
    return c.put('./__pub', new Response(JSON.stringify(p), { headers: { 'content-type': 'application/json' } })).then(() =>
      self.registration.showNotification('📣 Tu publicación de hoy está lista', { body: 'Silla ya la preparó. Toca para compartirla en 2 toques.', icon: 'icon-192.png', badge: 'icon-192.png', tag: 'silla-pub', data: { url: './#publicar' } }));
  }))));
});
