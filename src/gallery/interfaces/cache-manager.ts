import { 
  CachedImage, 
  CacheConfig, 
  CacheStrategy, 
  CacheResult 
} from '../types';

/**
 * Cache Manager interface
 * Provides multi-tier caching with intelligent eviction
 */
export interface CacheManager {
  // Cache operations
  /** Retrieve an item from cache */
  get(key: string): Promise<CachedImage | null>;
  /** Store an item in cache */
  set(key: string, image: CachedImage): Promise<void>;
  /** Remove an item from cache */
  delete(key: string): Promise<void>;
  /** Clear all cached items */
  clear(): Promise<void>;
  /** Check if an item exists in cache */
  has(key: string): Promise<boolean>;

  // Cache management
  /** Get current cache size in bytes */
  getSize(): Promise<number>;
  /** Get number of items in cache */
  getItemCount(): Promise<number>;
  /** Evict least recently used items to target size */
  evictLRU(targetSize: number): Promise<void>;
  /** Preload multiple items into cache */
  preload(keys: string[]): Promise<void>;
  /** Get cache statistics */
  getStats(): Promise<CacheStats>;

  // Cache strategies
  /** Set the caching strategy */
  setCacheStrategy(strategy: CacheStrategy): void;
  /** Get current cache strategy */
  getCacheStrategy(): CacheStrategy;
  /** Update cache configuration */
  updateConfig(config: Partial<CacheConfig>): void;

  // Cache tiers
  /** Check memory cache specifically */
  getFromMemory(key: string): CachedImage | null;
  /** Check disk cache specifically */
  getFromDisk(key: string): Promise<CachedImage | null>;
  /** Store in memory cache */
  setInMemory(key: string, image: CachedImage): void;
  /** Store in disk cache */
  setInDisk(key: string, image: CachedImage): Promise<void>;
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  /** Total number of cache requests */
  totalRequests: number;
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Cache hit rate (0-1) */
  hitRate: number;
  /** Current memory usage in bytes */
  memoryUsage: number;
  /** Current disk usage in bytes */
  diskUsage: number;
  /** Number of items evicted */
  evictions: number;
}