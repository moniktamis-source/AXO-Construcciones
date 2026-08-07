// ═══════════════════════════════════════════════════════════════════
// AXO Obra — service worker
//
// Chrome solo ofrece "Instalar aplicación" si hay un service worker que
// SEPA RESPONDER cuando no hay conexión. El anterior tenía el manejador
// de red vacío ("que se encargue la red"), que no alcanza: por eso el
// teléfono solo dejaba crear un acceso directo al link.
//
// La regla acá es: la red manda siempre. El caché existe únicamente como
// paracaídas para cuando no hay señal — que en una obra pasa seguido.
// Nunca se sirve una versión vieja habiendo internet, así que actualizar
// el sistema no deja a nadie con una pantalla desactualizada.
// ═══════════════════════════════════════════════════════════════════

const VERSION = 'axo-obra-v1';
const ESENCIALES = [
  './',
  './index.html',
  './manifest.json',
  './icono-192.png',
  './icono-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ESENCIALES))
      .catch(err => console.warn('[sw] no se pudo precargar', err))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Solo se toca lo propio de la app. Todo lo que va a Supabase —login,
  // consultas, subida de fotos— pasa derecho sin que el service worker
  // se meta. Guardar una respuesta de la nube en caché sería un desastre.
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(new URL('./', self.location).pathname)) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        // Copia fresca al caché, para la próxima vez que no haya señal
        if (res && res.ok) {
          const copia = res.clone();
          caches.open(VERSION).then(c => c.put(req, copia)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit =>
          hit || caches.match('./index.html') || new Response(
            '<!doctype html><meta charset="utf-8"><title>Sin conexión</title>' +
            '<body style="font-family:system-ui;padding:40px;text-align:center;color:#2E4029">' +
            '<h2>Sin conexión</h2><p>Cuando vuelva la señal, abrí la app de nuevo.</p></body>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        )
      )
  );
});
