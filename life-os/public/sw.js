// Life OS Service Worker - Tesla-style PWA functionality
const CACHE_NAME = 'life-os-v1';
const STATIC_CACHE = 'life-os-static-v1';
const DYNAMIC_CACHE = 'life-os-dynamic-v1';

// Cache strategy for different types of resources
const CACHE_STRATEGIES = {
  // Critical app shell - cache first
  APP_SHELL: [
    '/',
    '/tasks',
    '/legal',
    '/work',
    '/intelligence',
    '/mcle',
    '/manifest.json'
  ],
  
  // Static assets - cache first with network fallback
  STATIC_ASSETS: [
    '/icons/',
    '/screenshots/',
    '/_next/static/',
    '/fonts/'
  ],
  
  // API calls - network first with cache fallback
  API_ROUTES: [
    '/api/'
  ],
  
  // Images - cache first
  IMAGES: [
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.webp',
    '.gif'
  ]
};

// Install event - cache app shell and static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing Life OS Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache app shell
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(CACHE_STRATEGIES.APP_SHELL);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Life OS Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') return;
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  // App shell - cache first
  if (CACHE_STRATEGIES.APP_SHELL.includes(url.pathname)) {
    return cacheFirst(request, STATIC_CACHE);
  }
  
  // Static assets - cache first
  if (CACHE_STRATEGIES.STATIC_ASSETS.some(pattern => url.pathname.includes(pattern))) {
    return cacheFirst(request, STATIC_CACHE);
  }
  
  // API routes - network first
  if (CACHE_STRATEGIES.API_ROUTES.some(pattern => url.pathname.includes(pattern))) {
    return networkFirst(request, DYNAMIC_CACHE);
  }
  
  // Images - cache first
  if (CACHE_STRATEGIES.IMAGES.some(ext => url.pathname.endsWith(ext))) {
    return cacheFirst(request, STATIC_CACHE);
  }
  
  // Tesla UI components and other dynamic content - stale while revalidate
  if (url.pathname.includes('/_next/')) {
    return staleWhileRevalidate(request, STATIC_CACHE);
  }
  
  // Default - network first with cache fallback
  return networkFirst(request, DYNAMIC_CACHE);
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Update cache in background
      fetch(request).then(response => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
      }).catch(() => {
        // Ignore network errors in background update
      });
      
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Update cache with fresh data
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('[SW] Network failed, trying cache:', error);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch fresh version
  const fetchPromise = fetch(request).then(response => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Ignore network errors
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return fetchPromise || new Response('Offline', { status: 503 });
}

// Background sync for offline tasks
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync-tasks') {
    event.waitUntil(syncTasks());
  }
  
  if (event.tag === 'background-sync-deadlines') {
    event.waitUntil(syncDeadlines());
  }
});

async function syncTasks() {
  try {
    // Sync offline tasks when connection is restored
    const cache = await caches.open(DYNAMIC_CACHE);
    const offlineTasks = await cache.match('/api/offline-tasks');
    
    if (offlineTasks) {
      const tasks = await offlineTasks.json();
      
      for (const task of tasks) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
      }
      
      // Clear offline tasks after sync
      await cache.delete('/api/offline-tasks');
    }
  } catch (error) {
    console.log('[SW] Task sync failed:', error);
  }
}

async function syncDeadlines() {
  try {
    // Sync deadline updates when connection is restored
    console.log('[SW] Syncing deadlines...');
    await fetch('/api/deadlines/sync', { method: 'POST' });
  } catch (error) {
    console.log('[SW] Deadline sync failed:', error);
  }
}

// Push notifications for deadline alerts
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: 'You have an urgent deadline approaching!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/action-view.png'
      },
      {
        action: 'snooze',
        title: 'Snooze 1 Hour',
        icon: '/icons/action-snooze.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.message || options.body;
    options.data = { ...options.data, ...payload };
  }
  
  event.waitUntil(
    self.registration.showNotification('Life OS - Deadline Alert', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'view') {
    // Open the app to the relevant page
    event.waitUntil(
      clients.openWindow('/legal?deadline=' + data.primaryKey)
    );
  } else if (action === 'snooze') {
    // Snooze the notification
    event.waitUntil(
      fetch('/api/notifications/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.primaryKey, duration: 3600000 }) // 1 hour
      })
    );
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for deadline checks
self.addEventListener('periodicsync', event => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'deadline-check') {
    event.waitUntil(checkDeadlines());
  }
});

async function checkDeadlines() {
  try {
    const response = await fetch('/api/deadlines/check');
    const urgentDeadlines = await response.json();
    
    for (const deadline of urgentDeadlines) {
      await self.registration.showNotification('Life OS - Urgent Deadline', {
        body: `${deadline.title} is due ${deadline.timeRemaining}`,
        icon: '/icons/icon-192x192.png',
        data: deadline,
        requireInteraction: true
      });
    }
  } catch (error) {
    console.log('[SW] Deadline check failed:', error);
  }
}

console.log('[SW] Life OS Service Worker loaded successfully');
