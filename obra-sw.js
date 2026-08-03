// ═══════════════════════════════════════════════════════════
// AXO — Service worker mínimo de obra.html
//
// Existe por un solo motivo: Chrome exige un service worker con
// manejador de fetch para ofrecer "Instalar aplicación". Sin esto,
// el ícono en la pantalla de inicio queda como un acceso directo
// común, sin nombre propio de la obra.
//
// A PROPÓSITO NO CACHEA NADA. Deja pasar todo a la red tal cual.
// Si cacheara, el residente podría quedarse con una versión vieja
// de la página después de que actualicemos el sistema — y ese
// problema es mucho peor que el que vendríamos a resolver.
// ═══════════════════════════════════════════════════════════

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Passthrough puro: sin caché, sin intercepción real.
self.addEventListener('fetch', () => { /* la red se encarga */ });
