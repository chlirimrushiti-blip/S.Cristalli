// Nome della cache. Aggiorna la versione (es. v2) ogni volta che modifichi i file essenziali.
const CACHE_NAME = 'sara-cristalli-pwa-v1';

// Lista dei file essenziali da mettere in cache per l'uso offline
const urlsToCache = [
    './index.html',
    '/',
    // Icona ufficiale di Sara Cristalli (importante per il caching PWA)
    'https://i.imgur.com/b4N6B3l.png', 
    
    // RISORSE ESTERNE CORRETTE
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    'https://unpkg.com/lucide@latest',
    // L'immagine banner principale
    'https://i.imgur.com/PugL1l0.png'
];

// Evento di installazione: mette in cache i file essenziali
self.addEventListener('install', (event) => {
    // Tenta di aprire la cache e aggiungere tutti i file necessari
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Service Worker: Caching files for offline use');
            return cache.addAll(urlsToCache).catch(error => {
                // Cattura e logga errori se alcuni URL non possono essere messi in cache
                console.error('Service Worker: Failed to cache some URLs:', error);
            });
        })
    );
    // Forziamo l'attivazione non appena l'installazione è completata
    self.skipWaiting(); 
});

// Evento di fetch: intercetta le richieste di rete e usa una strategia "Cache-First"
self.addEventListener('fetch', (event) => {
    // Intercetta solo richieste GET per evitare problemi con POST, ecc.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            // 1. Se la risorsa è in cache, la ritorna immediatamente (Cache-First)
            if (response) {
                return response;
            }
            
            // 2. Altrimenti, recupera la risorsa dalla rete
            return fetch(event.request).catch(error => {
                // Logga l'errore se la rete è assente e la risorsa non era in cache
                console.error('Service Worker: Fetch failed and no resource in cache.', error);
                // Si potrebbe ritornare una pagina offline qui, ma per semplicità la omettiamo
            });
        })
    );
});

// Evento di attivazione: pulisce le vecchie cache per liberare spazio
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME]; // Solo la cache attuale è permessa
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Controlla se il nome della cache non è nella whitelist
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Assicura che la nuova versione del Service Worker prenda il controllo della pagina immediatamente
    self.clients.claim(); 
});
