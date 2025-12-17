/**
 * Cache configuration and related interfaces
 * Defines how the caching system should behave
 */
export interface CacheConfig {
  /** Maximum memory cache size in bytes */
  maxMemorySize: number;
  /** Maximum disk cache size in bytes */
  maxDiskSize: number;
  /** Default time-to-live for cached items in seconds */
  defaultTTL: number;
  /** Cache eviction policy to use */
  evictionPolicy: 'lru' | 'lfu' | 'ttl';
  /** Whether to enable compression for cached items */
  compressionEnabled: boolean;
  /** Whether to enable encryption for cached items */
  encryptionEnabled: boolean;
}

/**
 * Cached image data structure
 */
export interface CachedImage {
  /** The actual image data as a Blob */
  blob: Blob;
  /** Metadata about the cached image */
  metadata: ImageMetadata;
  /** When this item was cached (timestamp) */
  timestamp: number;
  /** How many times this item has been accessed */
  accessCount: number;
  /** When this item was last accessed (timestamp) */
  lastAccessed: number;
}

/**
 * Cache strategy types
 */
export type CacheStrategy = 
  | 'cache-first'
  | 'network-first'
  | 'cache-only'
  | 'network-only'
  | 'stale-while-revalidate';

/**
 * Cache operation result
 */
export interface CacheResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache: boolean;
}