// Basic service worker

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  // Optional: Precache assets here if needed
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
  // Optional: Clean up old caches here
});

self.addEventListener("fetch", (event) => {
  // Optional: Add fetch handling logic (e.g., cache-first)
  // console.log('Fetching:', event.request.url);
  // For now, just fetch from network
  event.respondWith(fetch(event.request));
});
