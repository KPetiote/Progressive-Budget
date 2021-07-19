// SERVICE WORKER JS
// ---------------------------------------------------------------------------

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/assets/css/styles.css",
    "/assets/js/index.js",
    "/assets/js/db.js",
    "/assets/images/icons/icon-192x192.png",
    "/assets/images/icons/icon-512x512.png",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

// Adds listener and handler to retrieve static assets from the Cache Storage in the browser 
self.addEventListener("install", (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
    evt.waitUntil(
        caches.keys().then((keyList) => {
        return Promise.all(
            keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                return caches.delete(key);
            }
            })
        );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", (evt) => {
    // Cache successfully requests to the API 
    if (evt.request.url.includes("/api/") && evt.request.method === "GET") {
    evt.respondWith(
    caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
        return fetch(evt.request)
            .then((response) => {
                // If the response was accepted, a clone is made and added to the cache     
                if (response.status === 200) {
                    cache.put(evt.request, response.clone());
            }

            return response;
            })
            .catch(() => {
                // If network request failed, try to obtain information from cache
                return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
}
    // Serves the "offline-first" approach if the request is not for the API
    evt.respondWith(
        caches.match(evt.request).then((response) => {
        return response || fetch(evt.request);
        })
    );
});
