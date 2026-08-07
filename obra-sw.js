// ═══════════════════════════════════════════════════════════════════
// AXO — service worker VIEJO de la raíz. Ya no se usa.
//
// La app de obra se mudó a /obra/, con su propio service worker de
// alcance limitado a esa carpeta. Este archivo queda solo para
// desinstalarse a sí mismo en los teléfonos que ya lo tenían
// registrado: si no, seguiría controlando la raíz del sitio (incluido
// index.html) para siempre, porque un service worker registrado no se
// va aunque borres el archivo del repositorio.
//
// Se puede eliminar dentro de unos meses, cuando todos los equipos
// hayan abierto el sitio al menos una vez.
// ═══════════════════════════════════════════════════════════════════

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    try {
      const claves = await caches.keys();
      await Promise.all(claves.map(k => caches.delete(k)));
    } catch (err) { /* si no se puede limpiar, igual nos vamos */ }
    await self.registration.unregister();
    const clientes = await self.clients.matchAll({ type: 'window' });
    clientes.forEach(c => c.navigate(c.url));
  })());
});
