// Quiet Words used to have its own offline helper here. It now lives inside GameHub, whose
// helper covers the whole site. Phones that still have the old one fetch this file as an
// update; it clears Quiet Words' old saved copy, steps aside, and reloads the open game once,
// so GameHub's helper takes over. Saved progress (IndexedDB) is not touched.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      // Only the old Workbox precache for this game; GameHub's caches are left alone.
      await Promise.all(names.filter((n) => n.startsWith('workbox-') && n.includes('/quiet_words/')).map((n) => caches.delete(n)))
      await self.registration.unregister()
      for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url)
    })(),
  )
})
