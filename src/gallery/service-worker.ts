/**
 * Service Worker for Gallery Performance Optimization
 * Handles advanced caching strategies and offline support
 */

import { CacheStrategy } from './types';

// Cache names for different types of content
const CACHE_NAMES = {
  images: 'gallery-images-v1',
  static: 'gallery-static-v1',
  api: 'gallery-api-v1'
};

// Cache configuration
const CACHE_CONFIG = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  maxEntries: 500,
  networkTimeoutMs: 3000
};

// Current cache strategy (default to cache-first for images)
let currentStrategy: CacheStrategy = 'cache-first';

/**
 * Install event - set up initial caches
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAMES.images),
      caches.open(CACHE_NAMES.static),
      caches.open(CACHE_NAMES.api)
    ]).then(() => {
      console.log('[ServiceWorker] Installation complete');
      // Skip waiting to activate immediately
      return (self as any).skipWaiting();
    })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old cache versions
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Activation complete');
      // Take control of all clients immediately
      return (self as any).clients.claim();
    })
  );
});

/**
 * Fetch event - handle network requests with caching strategies
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Determine cache strategy based on request type
  if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAssetRequest(request));
  } else {
    // Let other requests pass through
    return;
  }
});

/**
 * Message event - handle commands from main thread
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SET_CACHE_STRATEGY':
      currentStrategy = payload.strategy;
      console.log('[ServiceWorker] Cache strategy updated:', currentStrategy);
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearCache(payload.cacheType));
      break;
      
    case 'PRELOAD_IMAGES':
      event.waitUntil(preloadImages(payload.urls));
      break;
      
    case 'GET_CACHE_SIZE':
      event.waitUntil(getCacheSize().then(size => {
        event.ports[0]?.postMessage({ type: 'CACHE_SIZE', size });
      }));
      break;
      
    default:
      console.warn('[ServiceWorker] Unknown message type:', type);
  }
});

/**
 * Handle image requests with appropriate caching strategy
 */
async function handleImageRequest(request: Request): Promise<Response> {
  const cacheName = CACHE_NAMES.images;
  
  switch (currentStrategy) {
    case 'cache-first':
      return cacheFirst(request, cacheName);
      
    case 'network-first':
      return networkFirst(request, cacheName);
      
    case 'cache-only':
      return cacheOnly(request, cacheName);
      
    case 'network-only':
      return networkOnly(request);
      
    case 'stale-while-revalidate':
      return staleWhileRevalidate(request, cacheName);
      
    default:
      return cacheFirst(request, cacheName);
  }
}

/**
 * Handle static asset requests (CSS, JS, etc.)
 */
async function handleStaticAssetRequest(request: Request): Promise<Response> {
  // Static assets use cache-first strategy
  return cacheFirst(request, CACHE_NAMES.static);
}

/**
 * Cache-first strategy: Check cache first, fallback to network
 */
async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update access time for LRU tracking
    updateCacheAccessTime(request.url, cacheName);
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetchWithTimeout(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      await enforceMaxEntries(cacheName);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Network request failed:', error);
    
    // Return offline fallback if available
    return createOfflineResponse();
  }
}

/**
 * Network-first strategy: Try network first, fallback to cache
 */
async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  try {
    const networkResponse = await fetchWithTimeout(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
      await enforceMaxEntries(cacheName);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('[ServiceWorker] Network failed, trying cache:', error);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      updateCacheAccessTime(request.url, cacheName);
      return cachedResponse;
    }
    
    return createOfflineResponse();
  }
}

/**
 * Cache-only strategy: Only serve from cache
 */
async function cacheOnly(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    updateCacheAccessTime(request.url, cacheName);
    return cachedResponse;
  }
  
  return createOfflineResponse();
}

/**
 * Network-only strategy: Always fetch from network
 */
async function networkOnly(request: Request): Promise<Response> {
  try {
    return await fetchWithTimeout(request);
  } catch (error) {
    console.error('[ServiceWorker] Network-only request failed:', error);
    return createOfflineResponse();
  }
}

/**
 * Stale-while-revalidate strategy: Serve from cache, update in background
 */
async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Start network request in background
  const networkResponsePromise = fetchWithTimeout(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
      enforceMaxEntries(cacheName);
    }
    return response;
  }).catch(error => {
    console.warn('[ServiceWorker] Background update failed:', error);
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    updateCacheAccessTime(request.url, cacheName);
    return cachedResponse;
  }
  
  // If no cached response, wait for network
  try {
    return await networkResponsePromise;
  } catch (error) {
    return createOfflineResponse();
  }
}

/**
 * Fetch with timeout to prevent hanging requests
 */
async function fetchWithTimeout(request: Request): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CACHE_CONFIG.networkTimeoutMs);
  
  try {
    const response = await fetch(request, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Update cache access time for LRU tracking
 */
async function updateCacheAccessTime(url: string, cacheName: string): Promise<void> {
  // Store access time in a separate cache for LRU tracking
  const metaCache = await caches.open(`${cacheName}-meta`);
  const accessData = {
    url,
    lastAccessed: Date.now()
  };
  
  const response = new Response(JSON.stringify(accessData), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  await metaCache.put(url, response);
}

/**
 * Enforce maximum number of entries in cache
 */
async function enforceMaxEntries(cacheName: string): Promise<void> {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length <= CACHE_CONFIG.maxEntries) {
    return;
  }
  
  // Get access times for LRU eviction
  const metaCache = await caches.open(`${cacheName}-meta`);
  const accessTimes: Array<{ url: string; lastAccessed: number }> = [];
  
  for (const request of keys) {
    const metaResponse = await metaCache.match(request.url);
    if (metaResponse) {
      const data = await metaResponse.json();
      accessTimes.push(data);
    } else {
      // No access time recorded, assume oldest
      accessTimes.push({ url: request.url, lastAccessed: 0 });
    }
  }
  
  // Sort by access time (oldest first)
  accessTimes.sort((a, b) => a.lastAccessed - b.lastAccessed);
  
  // Remove oldest entries
  const entriesToRemove = keys.length - CACHE_CONFIG.maxEntries;
  for (let i = 0; i < entriesToRemove; i++) {
    const urlToRemove = accessTimes[i].url;
    await cache.delete(urlToRemove);
    await metaCache.delete(urlToRemove);
  }
  
  console.log(`[ServiceWorker] Evicted ${entriesToRemove} entries from ${cacheName}`);
}

/**
 * Clear cache by type
 */
async function clearCache(cacheType?: string): Promise<void> {
  if (cacheType) {
    const cacheName = CACHE_NAMES[cacheType as keyof typeof CACHE_NAMES];
    if (cacheName) {
      await caches.delete(cacheName);
      await caches.delete(`${cacheName}-meta`);
      console.log(`[ServiceWorker] Cleared cache: ${cacheName}`);
    }
  } else {
    // Clear all caches
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[ServiceWorker] Cleared all caches');
  }
}

/**
 * Preload images into cache
 */
async function preloadImages(urls: string[]): Promise<void> {
  const cache = await caches.open(CACHE_NAMES.images);
  
  const preloadPromises = urls.map(async (url) => {
    try {
      const response = await fetchWithTimeout(new Request(url));
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.warn(`[ServiceWorker] Failed to preload image: ${url}`, error);
    }
  });
  
  await Promise.all(preloadPromises);
  await enforceMaxEntries(CACHE_NAMES.images);
  console.log(`[ServiceWorker] Preloaded ${urls.length} images`);
}

/**
 * Get total cache size
 */
async function getCacheSize(): Promise<number> {
  let totalSize = 0;
  
  for (const cacheName of Object.values(CACHE_NAMES)) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

/**
 * Create offline response for failed requests
 */
function createOfflineResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'This content is not available offline'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Check if request is for an image
 */
function isImageRequest(url: URL): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const pathname = url.pathname.toLowerCase();
  return imageExtensions.some(ext => pathname.endsWith(ext)) ||
         url.pathname.includes('/images/') ||
         url.searchParams.has('format'); // For dynamic image URLs
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(url: URL): boolean {
  const staticExtensions = ['.css', '.js', '.woff', '.woff2', '.ttf'];
  const pathname = url.pathname.toLowerCase();
  return staticExtensions.some(ext => pathname.endsWith(ext));
}