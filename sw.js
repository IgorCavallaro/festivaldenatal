const CACHE = "festival-natal-2026-v1";
const SHELL = ["./", "./index.html", "./app.js", "./config.js", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// network-first para dados vivos (Supabase), cache-first para o shell do app
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.includes("supabase.co") || url.includes("unpkg.com") || url.includes("jsdelivr.net") || url.includes("googleapis.com") || url.includes("tailwindcss.com")) {
    return; // sempre busca da rede — não cachear dados nem dependências externas
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
