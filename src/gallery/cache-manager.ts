/**
 * Multi-tier Cache Manager Implementation
 * Provides memory and disk caching with LRU eviction policy
 */

import { 
  CacheManager as ICacheManager, 
  CacheStats 
} from './interfaces/cache-manager';
import { 
  CachedImage, 
  CacheConfig, 
  CacheStrategy, 
  CacheResult,
  ImageMetadata 
} from './types';

/**
 * IndexedDB database configuration
 */
const DB_CONFIG = {
  name: 'GalleryCache',
  version: 1,
  stores: {
    images: 'images',
    metadata: 'metadata'
  }
};

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: CacheConfig = {
  maxMemorySize: 50 * 1024 * 1024, // 50MB
  maxDiskSize: 200 * 1024 * 1024,  // 200MB
  defaultTTL: 7 * 24 * 60 * 60,    // 7 days in seconds
  evictionPolicy: 'lru',
  compressionEnabled: false,
  encryptionEnabled: false
};

/**
 * Multi-tier Cache Manager implementation
 */
export class CacheManager implements ICacheManager {
  private memoryCache = new Map<string, CachedImage>();
  private accessOrder = new Map<string, number>(); // For LRU tracking
  private config: CacheConfig;
  private strategy: CacheStrategy = 'cache-first';
  private stats: CacheStats;
  private db: IDBDatabase | null = null;
  private serviceWorker: ServiceWorker | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      totalRequests: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      memoryUsage: 0,
      diskUsage: 0,
      evictions: 0
    };
    
    this.initializeIndexedDB();
    this.registerServiceWorker();
  }

  /**
   * Initialize IndexedDB for persistent storage
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.images)) {
          const imageStore = db.createObjectStore(DB_CONFIG.stores.images, { keyPath: 'id' });
          imageStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
          imageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.metadata)) {
          db.createObjectStore(DB_CONFIG.stores.metadata, { keyPath: 'key' });
        }
        
        console.log('IndexedDB schema created');
      };
    });
  }

  /**
   * Register service worker for advanced caching
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/src/gallery/service-worker.js');
        
        if (registration.active) {
          this.serviceWorker = registration.active;
        } else if (registration.installing) {
          registration.installing.addEventListener('statechange', (event) => {
            const sw = event.target as ServiceWorker;
            if (sw.state === 'activated') {
              this.serviceWorker = sw;
            }
          });
        }
        
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Send message to service worker
   */
  private sendMessageToServiceWorker(message: any): Promise<any> {
    return new Promise((resolve) => {
      if (!this.serviceWorker) {
        resolve(null);
        return;
      }
      
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      this.serviceWorker.postMessage(message, [messageChannel.port2]);
    });
  }

  // Cache Operations

  /**
   * Retrieve an item from cache (memory first, then disk)
   */
  async get(key: string): Promise<CachedImage | null> {
    this.stats.totalRequests++;
    
    // Check memory cache first
    const memoryResult = this.getFromMemory(key);
    if (memoryResult) {
      this.stats.hits++;
      this.updateHitRate();
      return memoryResult;
    }
    
    // Check disk cache
    const diskResult = await this.getFromDisk(key);
    if (diskResult) {
      // Promote to memory cache
      this.setInMemory(key, diskResult);
      this.stats.hits++;
      this.updateHitRate();
      return diskResult;
    }
    
    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  /**
   * Store an item in cache (both memory and disk)
   */
  async set(key: string, image: CachedImage): Promise<void> {
    // Update access information
    const now = Date.now();
    const updatedImage: CachedImage = {
      ...image,
      timestamp: now,
      lastAccessed: now,
      accessCount: (image.accessCount || 0) + 1
    };
    
    // Store in memory cache
    this.setInMemory(key, updatedImage);
    
    // Store in disk cache
    await this.setInDisk(key, updatedImage);
    
    // Update statistics
    this.updateMemoryUsage();
  }

  /**
   * Remove an item from cache
   */
  async delete(key: string): Promise<void> {
    // Remove from memory
    this.memoryCache.delete(key);
    this.accessOrder.delete(key);
    
    // Remove from disk
    if (this.db) {
      const transaction = this.db.transaction([DB_CONFIG.stores.images], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.stores.images);
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    this.updateMemoryUsage();
  }

  /**
   * Clear all cached items
   */
  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    this.accessOrder.clear();
    
    // Clear disk cache
    if (this.db) {
      const transaction = this.db.transaction([DB_CONFIG.stores.images], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.stores.images);
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    // Clear service worker cache
    if (this.serviceWorker) {
      this.sendMessageToServiceWorker({ type: 'CLEAR_CACHE' });
    }
    
    // Reset statistics
    this.stats.memoryUsage = 0;
    this.stats.diskUsage = 0;
  }

  /**
   * Check if an item exists in cache
   */
  async has(key: string): Promise<boolean> {
    if (this.memoryCache.has(key)) {
      return true;
    }
    
    const diskResult = await this.getFromDisk(key);
    return diskResult !== null;
  }

  // Cache Management

  /**
   * Get current cache size in bytes
   */
  async getSize(): Promise<number> {
    let totalSize = this.stats.memoryUsage;
    
    // Add service worker cache size
    if (this.serviceWorker) {
      const swCacheSize = await this.sendMessageToServiceWorker({ type: 'GET_CACHE_SIZE' });
      if (swCacheSize && swCacheSize.size) {
        totalSize += swCacheSize.size;
      }
    }
    
    return totalSize;
  }

  /**
   * Get number of items in cache
   */
  async getItemCount(): Promise<number> {
    let count = this.memoryCache.size;
    
    if (this.db) {
      const transaction = this.db.transaction([DB_CONFIG.stores.images], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.images);
      const countRequest = store.count();
      
      const diskCount = await new Promise<number>((resolve, reject) => {
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => reject(countRequest.error);
      });
      
      // Avoid double counting items in both memory and disk
      const memoryKeys = new Set(this.memoryCache.keys());
      const diskKeys = await this.getDiskKeys();
      const uniqueDiskCount = diskKeys.filter(key => !memoryKeys.has(key)).length;
      
      count += uniqueDiskCount;
    }
    
    return count;
  }

  /**
   * Evict least recently used items to target size
   */
  async evictLRU(targetSize: number): Promise<void> {
    const currentSize = await this.getSize();
    
    if (currentSize <= targetSize) {
      return;
    }
    
    // Get all items sorted by access time (oldest first)
    const allItems = await this.getAllItemsSortedByAccess();
    
    let evictedSize = 0;
    let evictedCount = 0;
    
    for (const item of allItems) {
      if (currentSize - evictedSize <= targetSize) {
        break;
      }
      
      await this.delete(item.key);
      evictedSize += item.size;
      evictedCount++;
    }
    
    this.stats.evictions += evictedCount;
    console.log(`Evicted ${evictedCount} items (${evictedSize} bytes) using LRU policy`);
  }

  /**
   * Preload multiple items into cache
   */
  async preload(keys: string[]): Promise<void> {
    // Send preload request to service worker
    if (this.serviceWorker) {
      await this.sendMessageToServiceWorker({
        type: 'PRELOAD_IMAGES',
        payload: { urls: keys }
      });
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    // Update current usage statistics
    this.updateMemoryUsage();
    await this.updateDiskUsage();
    
    return { ...this.stats };
  }

  // Cache Strategies

  /**
   * Set the caching strategy
   */
  setCacheStrategy(strategy: CacheStrategy): void {
    this.strategy = strategy;
    
    // Update service worker strategy
    if (this.serviceWorker) {
      this.sendMessageToServiceWorker({
        type: 'SET_CACHE_STRATEGY',
        payload: { strategy }
      });
    }
  }

  /**
   * Get current cache strategy
   */
  getCacheStrategy(): CacheStrategy {
    return this.strategy;
  }

  /**
   * Update cache configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Enforce new size limits if they were reduced
    if (config.maxMemorySize && config.maxMemorySize < this.stats.memoryUsage) {
      this.evictMemoryToSize(config.maxMemorySize);
    }
  }

  // Cache Tiers

  /**
   * Check memory cache specifically
   */
  getFromMemory(key: string): CachedImage | null {
    const item = this.memoryCache.get(key);
    if (item) {
      // Update access order for LRU
      this.accessOrder.set(key, Date.now());
      item.lastAccessed = Date.now();
      item.accessCount++;
      return item;
    }
    return null;
  }

  /**
   * Check disk cache specifically
   */
  async getFromDisk(key: string): Promise<CachedImage | null> {
    if (!this.db) {
      return null;
    }
    
    try {
      const transaction = this.db.transaction([DB_CONFIG.stores.images], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.images);
      const request = store.get(key);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            // Update access time
            result.lastAccessed = Date.now();
            result.accessCount++;
            
            // Update the record in disk
            this.updateDiskAccessTime(key, result);
            
            resolve(result);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error reading from disk cache:', error);
      return null;
    }
  }

  /**
   * Store in memory cache
   */
  setInMemory(key: string, image: CachedImage): void {
    // Check if we need to evict items first
    const imageSize = this.estimateImageSize(image);
    
    if (this.stats.memoryUsage + imageSize > this.config.maxMemorySize) {
      this.evictMemoryToSize(this.config.maxMemorySize - imageSize);
    }
    
    this.memoryCache.set(key, image);
    this.accessOrder.set(key, Date.now());
    this.updateMemoryUsage();
  }

  /**
   * Store in disk cache
   */
  async setInDisk(key: string, image: CachedImage): Promise<void> {
    if (!this.db) {
      return;
    }
    
    try {
      const transaction = this.db.transaction([DB_CONFIG.stores.images], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.stores.images);
      
      const diskItem = {
        id: key,
        ...image
      };
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(diskItem);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      await this.updateDiskUsage();
    } catch (error) {
      console.error('Error writing to disk cache:', error);
    }
  }

  // Private Helper Methods

  /**
   * Update memory usage statistics
   */
  private updateMemoryUsage(): void {
    let totalSize = 0;
    for (const image of this.memoryCache.values()) {
      totalSize += this.estimateImageSize(image);
    }
    this.stats.memoryUsage = totalSize;
  }

  /**
   * Update disk usage statistics
   */
  private async updateDiskUsage(): Promise<void> {
    if (!this.db) {
      return;
    }
    
    try {
      const transaction = this.db.transaction([DB_CONFIG.stores.images], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.images);
      const request = store.getAll();
      
      const items = await new Promise<any[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      let totalSize = 0;
      for (const item of items) {
        totalSize += this.estimateImageSize(item);
      }
      
      this.stats.diskUsage = totalSize;
    } catch (error) {
      console.error('Error calculating disk usage:', error);
    }
  }

  /**
   * Estimate the size of a cached image
   */
  private estimateImageSize(image: CachedImage): number {
    return image.blob.size + JSON.stringify(image.metadata).length + 100; // Add overhead
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? this.stats.hits / this.stats.totalRequests 
      : 0;
  }

  /**
   * Evict memory cache items to target size
   */
  private evictMemoryToSize(targetSize: number): void {
    // Sort by access time (oldest first)
    const sortedEntries = Array.from(this.accessOrder.entries())
      .sort((a, b) => a[1] - b[1]);
    
    let currentSize = this.stats.memoryUsage;
    let evictedCount = 0;
    
    for (const [key] of sortedEntries) {
      if (currentSize <= targetSize) {
        break;
      }
      
      const image = this.memoryCache.get(key);
      if (image) {
        const imageSize = this.estimateImageSize(image);
        this.memoryCache.delete(key);
        this.accessOrder.delete(key);
        currentSize -= imageSize;
        evictedCount++;
      }
    }
    
    this.stats.evictions += evictedCount;
    this.updateMemoryUsage();
  }

  /**
   * Get all items sorted by access time for LRU eviction
   */
  private async getAllItemsSortedByAccess(): Promise<Array<{ key: string; size: number; lastAccessed: number }>> {
    const items: Array<{ key: string; size: number; lastAccessed: number }> = [];
    
    // Add memory items
    for (const [key, image] of this.memoryCache.entries()) {
      items.push({
        key,
        size: this.estimateImageSize(image),
        lastAccessed: image.lastAccessed
      });
    }
    
    // Add disk items (excluding those already in memory)
    if (this.db) {
      const diskKeys = await this.getDiskKeys();
      const memoryKeys = new Set(this.memoryCache.keys());
      
      for (const key of diskKeys) {
        if (!memoryKeys.has(key)) {
          const diskImage = await this.getFromDisk(key);
          if (diskImage) {
            items.push({
              key,
              size: this.estimateImageSize(diskImage),
              lastAccessed: diskImage.lastAccessed
            });
          }
        }
      }
    }
    
    // Sort by last accessed (oldest first)
    return items.sort((a, b) => a.lastAccessed - b.lastAccessed);
  }

  /**
   * Get all keys from disk cache
   */
  private async getDiskKeys(): Promise<string[]> {
    if (!this.db) {
      return [];
    }
    
    try {
      const transaction = this.db.transaction([DB_CONFIG.stores.images], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.images);
      const request = store.getAllKeys();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result as string[]);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting disk keys:', error);
      return [];
    }
  }

  /**
   * Update access time for disk cache item
   */
  private async updateDiskAccessTime(key: string, image: CachedImage): Promise<void> {
    if (!this.db) {
      return;
    }
    
    try {
      const transaction = this.db.transaction([DB_CONFIG.stores.images], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.stores.images);
      
      const diskItem = {
        id: key,
        ...image
      };
      
      store.put(diskItem);
    } catch (error) {
      console.error('Error updating disk access time:', error);
    }
  }
}