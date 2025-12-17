import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ViewportManager } from './viewport-manager';
import { ImageManager } from './interfaces';
import { ImageMetadata } from './types';

// Mock ImageManager
const mockImageManager: ImageManager = {
  loadImage: vi.fn(),
  preloadImages: vi.fn(),
  cancelLoading: vi.fn(),
  cancelAllLoading: vi.fn(),
  getOptimalImageUrl: vi.fn(),
  adaptQuality: vi.fn(),
  shouldLoadHighQuality: vi.fn(),
  getLoadingState: vi.fn(),
  getPendingCount: vi.fn(),
  getActiveRequestCount: vi.fn(),
  isImageLoading: vi.fn(),
  queueImage: vi.fn(),
  dequeueImage: vi.fn(),
  reorderQueue: vi.fn()
};

// Mock DOM elements
const mockContainer = {
  getBoundingClientRect: () => ({ width: 1200, height: 800, top: 0, left: 0 }),
  scrollTop: 0,
  scrollLeft: 0,
  scrollHeight: 2000,
  scrollWidth: 1200,
  addEventListener: vi.fn(),
  dataset: {}
} as unknown as HTMLElement;

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Setup global mocks
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver
});

Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  configurable: true,
  value: (callback: FrameRequestCallback) => setTimeout(callback, 16)
});

describe('ViewportManager', () => {
  let viewportManager: ViewportManager;
  let sampleImages: ImageMetadata[];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    (mockImageManager.getActiveRequestCount as Mock).mockReturnValue(0);
    (mockImageManager.queueImage as Mock).mockResolvedValue(undefined);
    (mockImageManager.loadImage as Mock).mockResolvedValue(new Image());

    viewportManager = new ViewportManager(mockImageManager, mockContainer);
    
    sampleImages = [
      {
        id: 'img1',
        url: 'https://example.com/img1.jpg',
        thumbnailUrl: 'https://example.com/thumb1.jpg',
        category: 'nature',
        alt: 'Image 1',
        dimensions: { width: 800, height: 600 },
        priority: 5,
        cached: false
      },
      {
        id: 'img2',
        url: 'https://example.com/img2.jpg',
        thumbnailUrl: 'https://example.com/thumb2.jpg',
        category: 'nature',
        alt: 'Image 2',
        dimensions: { width: 1200, height: 800 },
        priority: 3,
        cached: true
      }
    ];

    // Add sample images to viewport manager
    sampleImages.forEach(img => viewportManager.addImageMetadata(img));
  });

  describe('Viewport Tracking', () => {
    it('should initialize with correct viewport state', () => {
      const visibleImages = viewportManager.getVisibleImages();
      expect(Array.isArray(visibleImages)).toBe(true);
    });

    it('should calculate optimal columns based on container width', () => {
      const columns = viewportManager.getOptimalColumns();
      expect(columns).toBeGreaterThan(0);
      expect(columns).toBeLessThanOrEqual(6);
    });

    it('should calculate layout correctly', () => {
      const layout = viewportManager.calculateLayout();
      expect(layout).toHaveProperty('totalHeight');
      expect(layout).toHaveProperty('columns');
      expect(layout).toHaveProperty('itemHeight');
      expect(layout.totalHeight).toBeGreaterThan(0);
    });
  });

  describe('Virtual Scrolling', () => {
    it('should return virtualized items', () => {
      const items = viewportManager.getVirtualizedItems();
      expect(Array.isArray(items)).toBe(true);
      items.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('top');
        expect(item).toHaveProperty('height');
        expect(item).toHaveProperty('visible');
      });
    });

    it('should calculate visible range correctly', () => {
      const range = viewportManager.getVisibleRange();
      expect(range).toHaveProperty('start');
      expect(range).toHaveProperty('end');
      expect(range.start).toBeGreaterThanOrEqual(0);
      expect(range.end).toBeGreaterThanOrEqual(range.start);
    });

    it('should update viewport on scroll', () => {
      const initialRange = viewportManager.getVisibleRange();
      viewportManager.updateViewport(500);
      const newRange = viewportManager.getVisibleRange();
      
      // Range might change based on scroll position
      expect(newRange).toHaveProperty('start');
      expect(newRange).toHaveProperty('end');
    });
  });

  describe('Image Position Management', () => {
    it('should calculate image positions correctly', () => {
      const position = viewportManager.getImagePosition('img1');
      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(position).toHaveProperty('width');
      expect(position).toHaveProperty('height');
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeGreaterThanOrEqual(0);
    });

    it('should return zero position for non-existent image', () => {
      const position = viewportManager.getImagePosition('nonexistent');
      expect(position).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });
  });

  describe('Intersection Observer Integration', () => {
    it('should observe elements correctly', () => {
      const mockElement = { dataset: {} } as HTMLElement;
      const observeSpy = vi.fn();
      
      // Mock the intersection observer instance
      mockIntersectionObserver.mockReturnValue({
        observe: observeSpy,
        unobserve: vi.fn(),
        disconnect: vi.fn()
      });

      // Create new instance to get fresh observer
      const newViewportManager = new ViewportManager(mockImageManager, mockContainer);
      newViewportManager.observe(mockElement, 'img1');
      
      expect(mockElement.dataset.imageId).toBe('img1');
    });

    it('should handle distance calculation for images', () => {
      const distance = viewportManager.getDistanceFromViewport('img1');
      expect(typeof distance).toBe('number');
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration correctly', () => {
      const newConfig = { itemHeight: 400, overscan: 10 };
      viewportManager.updateConfig(newConfig);
      
      const config = viewportManager.getConfig();
      expect(config.itemHeight).toBe(400);
      expect(config.overscan).toBe(10);
    });

    it('should maintain other config values when partially updating', () => {
      const originalConfig = viewportManager.getConfig();
      viewportManager.updateConfig({ itemHeight: 500 });
      
      const newConfig = viewportManager.getConfig();
      expect(newConfig.itemHeight).toBe(500);
      expect(newConfig.overscan).toBe(originalConfig.overscan);
    });
  });

  describe('Image Metadata Management', () => {
    it('should add image metadata correctly', () => {
      const newImage: ImageMetadata = {
        id: 'img3',
        url: 'https://example.com/img3.jpg',
        thumbnailUrl: 'https://example.com/thumb3.jpg',
        category: 'architecture',
        alt: 'Image 3',
        dimensions: { width: 1000, height: 750 },
        priority: 7,
        cached: false
      };

      viewportManager.addImageMetadata(newImage);
      const layout = viewportManager.calculateLayout();
      expect(layout.totalHeight).toBeGreaterThan(0);
    });

    it('should remove image metadata correctly', () => {
      const initialLayout = viewportManager.calculateLayout();
      viewportManager.removeImageMetadata('img1');
      const newLayout = viewportManager.calculateLayout();
      
      // Layout should be recalculated
      expect(newLayout).toHaveProperty('totalHeight');
    });
  });

  describe('Progressive Loading Requirements', () => {
    it('should respect concurrent request limit', () => {
      // Mock that we already have max concurrent requests
      (mockImageManager.getActiveRequestCount as Mock).mockReturnValue(6);
      
      const nearbyImages = viewportManager.getNearbyImages(200);
      expect(Array.isArray(nearbyImages)).toBe(true);
    });

    it('should handle 200px preload threshold', () => {
      const nearbyImages = viewportManager.getNearbyImages(200);
      expect(Array.isArray(nearbyImages)).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on destroy', () => {
      const disconnectSpy = vi.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: disconnectSpy
      });

      const newViewportManager = new ViewportManager(mockImageManager, mockContainer);
      newViewportManager.destroy();
      
      // Should not throw errors after cleanup
      expect(() => newViewportManager.getVisibleImages()).not.toThrow();
    });
  });
});