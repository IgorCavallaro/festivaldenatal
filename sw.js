const CACHE = "festival-natal-2026-v5";
const SHELL = ["./", "./index.html", "./app.js", "./config.js", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Externos (Supabase, CDNs): sempre direto da rede, nunca interceptado.
// Shell do próprio app (index.html, app.js, config.js): network-first —
// tenta buscar a versão mais nova primeiro; só usa a cópia salva se
// estiver offline. Isso evita que o app instalado (PWA) fique preso
// numa versão antiga quando eu publico atualizações.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.includes("supabase.co") || url.includes("unpkg.com") || url.includes("jsdelivr.net") || url.includes("googleapis.com") || url.includes("tailwindcss.com")) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
