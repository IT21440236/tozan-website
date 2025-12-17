/**
 * Basic tests to verify type definitions and setup
 */
import { describe, it, expect } from 'vitest';
import type { 
  ImageMetadata, 
  LoadingState, 
  CacheConfig, 
  NetworkState, 
  PerformanceMetrics 
} from './index';

describe('Gallery Types', () => {
  it('should have correct ImageMetadata structure', () => {
    const imageMetadata: ImageMetadata = {
      id: 'test-image-1',
      url: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      category: 'nature',
      alt: 'Test image',
      dimensions: { width: 800, height: 600 },
      priority: 1,
      cached: false,
    };

    expect(imageMetadata.id).toBe('test-image-1');
    expect(imageMetadata.dimensions.width).toBe(800);
    expect(imageMetadata.cached).toBe(false);
  });

  it('should have correct LoadingState structure', () => {
    const loadingState: LoadingState = {
      totalImages: 100,
      loadedImages: 25,
      failedImages: 2,
      currentBatch: ['img1', 'img2'],
      pendingBatches: [['img3', 'img4'], ['img5', 'img6']],
      isLoading: true,
      error: null,
    };

    expect(loadingState.totalImages).toBe(100);
    expect(loadingState.currentBatch).toHaveLength(2);
    expect(loadingState.isLoading).toBe(true);
  });

  it('should have correct CacheConfig structure', () => {
    const cacheConfig: CacheConfig = {
      maxMemorySize: 50 * 1024 * 1024, // 50MB
      maxDiskSize: 200 * 1024 * 1024,  // 200MB
      defaultTTL: 7 * 24 * 60 * 60,    // 7 days
      evictionPolicy: 'lru',
      compressionEnabled: true,
      encryptionEnabled: false,
    };

    expect(cacheConfig.evictionPolicy).toBe('lru');
    expect(cacheConfig.compressionEnabled).toBe(true);
  });

  it('should have correct NetworkState structure', () => {
    const networkState: NetworkState = {
      speed: 'fast',
      effectiveType: '4g',
      downlink: 10.5,
      rtt: 150,
      saveData: false,
    };

    expect(networkState.speed).toBe('fast');
    expect(networkState.downlink).toBe(10.5);
  });

  it('should have correct PerformanceMetrics structure', () => {
    const performanceMetrics: PerformanceMetrics = {
      imageLoadTimes: new Map([['img1', 250], ['img2', 180]]),
      cacheHitRate: 0.85,
      memoryUsage: 45 * 1024 * 1024,
      networkRequests: 15,
      scrollPerformance: [],
      userInteractions: [],
    };

    expect(performanceMetrics.cacheHitRate).toBe(0.85);
    expect(performanceMetrics.imageLoadTimes.get('img1')).toBe(250);
  });
});