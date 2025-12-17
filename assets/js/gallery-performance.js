/**
 * Gallery Performance Optimization System
 * Simplified JavaScript version for browser integration
 */

(function() {
  'use strict';

  // Performance benchmarks
  const PerformanceBenchmarks = {
    INITIAL_LOAD_TARGET: 2000,
    CACHE_RETRIEVAL_TARGET: 100,
    SCROLL_FRAME_TARGET: 16.67,
    MEMORY_TARGET_PER_100_IMAGES: 100 * 1024 * 1024,
  };

  // Performance Monitor class
  class PerformanceMonitor {
    constructor(config = {}) {
      this.config = {
        enableFrameMonitoring: true,
        enableInteractionTracking: true,
        enableMemoryMonitoring: true,
        enableNetworkMonitoring: true,
        enableRegressionDetection: true,
        sampleRate: 1.0,
        maxHistorySize: 100,
        reportingInterval: 30000,
        ...config
      };

      this.metrics = {
        imageLoadTimes: new Map(),
        cacheHitRate: 0,
        memoryUsage: 0,
        networkRequests: 0,
        scrollPerformance: [],
        userInteractions: []
      };

      this.metricsHistory = [];
      this.isMonitoring = false;
      this.startTime = 0;
      this.frameObserver = null;
      this.memoryMonitorInterval = null;
      this.reportingInterval = null;
    }

    start() {
      if (this.isMonitoring) {
        console.warn('Performance monitoring already started');
        return;
      }

      this.startTime = performance.now();
      this.isMonitoring = true;

      if (this.config.enableFrameMonitoring) {
        this.startFrameMonitoring();
      }

      if (this.config.enableMemoryMonitoring) {
        this.startMemoryMonitoring();
      }

      if (this.config.enableInteractionTracking) {
        this.startInteractionTracking();
      }

      this.startPeriodicReporting();
      console.log('Performance monitoring started');
    }

    stop() {
      if (!this.isMonitoring) return;

      this.isMonitoring = false;

      if (this.frameObserver) {
        this.frameObserver.disconnect();
        this.frameObserver = null;
      }

      if (this.memoryMonitorInterval) {
        clearInterval(this.memoryMonitorInterval);
        this.memoryMonitorInterval = null;
      }

      if (this.reportingInterval) {
        clearInterval(this.reportingInterval);
        this.reportingInterval = null;
      }

      console.log('Performance monitoring stopped');
    }

    recordImageLoadTime(imageId, loadTime) {
      if (!this.shouldSample()) return;
      this.metrics.imageLoadTimes.set(imageId, loadTime);
      this.metrics.networkRequests++;
    }

    updateCacheHitRate(hitRate) {
      this.metrics.cacheHitRate = hitRate;
    }

    updateMemoryUsage(usage) {
      this.metrics.memoryUsage = usage;
    }

    recordInteraction(type, duration, context = {}) {
      if (!this.config.enableInteractionTracking || !this.shouldSample()) return;

      const interaction = {
        type,
        timestamp: performance.now(),
        duration,
        context
      };

      this.metrics.userInteractions.push(interaction);

      if (this.metrics.userInteractions.length > this.config.maxHistorySize) {
        this.metrics.userInteractions.shift();
      }
    }

    getMetrics() {
      return {
        imageLoadTimes: new Map(this.metrics.imageLoadTimes),
        cacheHitRate: this.metrics.cacheHitRate,
        memoryUsage: this.metrics.memoryUsage,
        networkRequests: this.metrics.networkRequests,
        scrollPerformance: [...this.metrics.scrollPerformance],
        userInteractions: [...this.metrics.userInteractions]
      };
    }

    getDashboardData() {
      const loadTimes = Array.from(this.metrics.imageLoadTimes.values());
      const averageLoadTime = loadTimes.length > 0 
        ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
        : 0;

      const recentFrames = this.metrics.scrollPerformance.slice(-10);
      const averageFPS = recentFrames.length > 0
        ? recentFrames.reduce((sum, frame) => sum + frame.fps, 0) / recentFrames.length
        : 0;

      return {
        summary: {
          averageLoadTime,
          cacheHitRate: this.metrics.cacheHitRate,
          memoryUsage: this.metrics.memoryUsage,
          averageFPS,
          totalInteractions: this.metrics.userInteractions.length
        },
        trends: {
          loadTimeTrend: this.metricsHistory.slice(-10).map(m => {
            const times = Array.from(m.imageLoadTimes.values());
            return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
          }),
          memoryTrend: this.metricsHistory.slice(-10).map(m => m.memoryUsage),
          fpsTrend: this.metricsHistory.slice(-10).map(m => {
            const frames = m.scrollPerformance.slice(-5);
            return frames.length > 0 
              ? frames.reduce((sum, frame) => sum + frame.fps, 0) / frames.length 
              : 0;
          })
        },
        alerts: []
      };
    }

    startFrameMonitoring() {
      // Simplified frame monitoring using requestAnimationFrame
      let lastFrameTime = performance.now();
      let frameCount = 0;

      const measureFrame = () => {
        const currentTime = performance.now();
        const frameDuration = currentTime - lastFrameTime;
        
        if (frameCount > 0) { // Skip first frame
          const frameMetric = {
            timestamp: currentTime,
            duration: frameDuration,
            dropped: frameDuration > PerformanceBenchmarks.SCROLL_FRAME_TARGET,
            fps: 1000 / frameDuration
          };

          this.metrics.scrollPerformance.push(frameMetric);

          if (this.metrics.scrollPerformance.length > this.config.maxHistorySize) {
            this.metrics.scrollPerformance.shift();
          }
        }

        lastFrameTime = currentTime;
        frameCount++;

        if (this.isMonitoring) {
          requestAnimationFrame(measureFrame);
        }
      };

      requestAnimationFrame(measureFrame);
    }

    startMemoryMonitoring() {
      this.memoryMonitorInterval = setInterval(() => {
        if ('memory' in performance) {
          const memoryInfo = performance.memory;
          if (memoryInfo) {
            this.metrics.memoryUsage = memoryInfo.usedJSHeapSize;
          }
        }
      }, 5000);
    }

    startInteractionTracking() {
      let scrollStartTime = 0;
      let isScrolling = false;

      const handleScrollStart = () => {
        if (!isScrolling) {
          scrollStartTime = performance.now();
          isScrolling = true;
        }
      };

      const handleScrollEnd = () => {
        if (isScrolling) {
          const duration = performance.now() - scrollStartTime;
          this.recordInteraction('scroll', duration, {
            scrollTop: window.pageYOffset,
            scrollHeight: document.documentElement.scrollHeight
          });
          isScrolling = false;
        }
      };

      let scrollTimeout;
      window.addEventListener('scroll', () => {
        handleScrollStart();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScrollEnd, 150);
      }, { passive: true });

      // Track filter changes
      document.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('filter-btn')) {
          const startTime = performance.now();
          
          requestAnimationFrame(() => {
            const duration = performance.now() - startTime;
            const filter = target.getAttribute('data-filter') || 'unknown';
            
            this.recordInteraction('filter', duration, {
              filter,
              previousFilter: document.querySelector('.filter-btn.active')?.getAttribute('data-filter')
            });
          });
        }
      });
    }

    startPeriodicReporting() {
      this.reportingInterval = setInterval(() => {
        this.metricsHistory.push(this.getMetrics());

        if (this.metricsHistory.length > this.config.maxHistorySize) {
          this.metricsHistory.shift();
        }

        const report = {
          timestamp: Date.now(),
          metrics: this.getMetrics(),
          regressions: [],
          recommendations: []
        };

        window.dispatchEvent(new CustomEvent('gallery-performance-report', {
          detail: report
        }));
      }, this.config.reportingInterval);
    }

    shouldSample() {
      return Math.random() < this.config.sampleRate;
    }
  }

  // Progressive Loading Manager
  class ProgressiveLoadingManager {
    constructor() {
      this.loadingQueue = [];
      this.activeRequests = new Set();
      this.loadedImages = new Set();
      this.maxConcurrentRequests = 6;
      this.preloadThreshold = 200;
      this.intersectionObserver = null;
      this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
      if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported, falling back to scroll-based loading');
        return;
      }

      this.intersectionObserver = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          rootMargin: `${this.preloadThreshold}px`,
          threshold: [0, 0.1, 0.5, 1.0]
        }
      );
    }

    handleIntersection(entries) {
      const imagesToLoad = [];

      for (const entry of entries) {
        const element = entry.target;
        const imageId = element.dataset.imageId;
        
        if (!imageId || this.loadedImages.has(imageId)) continue;

        if (entry.isIntersecting || this.isNearViewport(entry)) {
          imagesToLoad.push({ element, imageId, priority: entry.isIntersecting ? 10 : 5 });
        }
      }

      this.processLoadingQueue(imagesToLoad);
    }

    isNearViewport(entry) {
      const rect = entry.boundingClientRect;
      const viewportHeight = window.innerHeight;
      
      return rect.top <= viewportHeight + this.preloadThreshold && 
             rect.bottom >= -this.preloadThreshold;
    }

    async processLoadingQueue(imagesToLoad) {
      // Sort by priority
      imagesToLoad.sort((a, b) => b.priority - a.priority);

      for (const item of imagesToLoad) {
        if (this.activeRequests.size >= this.maxConcurrentRequests) {
          break;
        }

        await this.loadImage(item.element, item.imageId);
      }
    }

    async loadImage(element, imageId) {
      if (this.activeRequests.has(imageId) || this.loadedImages.has(imageId)) {
        return;
      }

      this.activeRequests.add(imageId);
      const startTime = performance.now();

      try {
        const img = element.querySelector('img');
        if (!img) return;

        // Create a new image to preload
        const preloadImg = new Image();
        
        await new Promise((resolve, reject) => {
          preloadImg.onload = resolve;
          preloadImg.onerror = reject;
          preloadImg.src = img.dataset.src || img.src;
        });

        // Update the actual image
        img.src = preloadImg.src;
        img.classList.add('loaded');
        
        this.loadedImages.add(imageId);
        
        // Record performance
        const loadTime = performance.now() - startTime;
        if (window.galleryPerformanceMonitor) {
          window.galleryPerformanceMonitor.recordImageLoadTime(imageId, loadTime);
        }

      } catch (error) {
        console.warn(`Failed to load image ${imageId}:`, error);
        element.classList.add('error');
      } finally {
        this.activeRequests.delete(imageId);
      }
    }

    observe(element, imageId) {
      if (this.intersectionObserver) {
        element.dataset.imageId = imageId;
        this.intersectionObserver.observe(element);
      }
    }

    unobserve(element) {
      if (this.intersectionObserver) {
        this.intersectionObserver.unobserve(element);
      }
    }
  }

  // Gallery Performance Integration
  class GalleryPerformanceIntegration {
    constructor() {
      this.performanceMonitor = null;
      this.progressiveLoader = null;
      this.isInitialized = false;
      this.dashboard = null;
    }

    async initialize() {
      if (this.isInitialized) {
        console.warn('Gallery performance integration already initialized');
        return;
      }

      try {
        console.log('Initializing Gallery Performance Integration...');

        // Initialize performance monitoring
        this.performanceMonitor = new PerformanceMonitor({
          enableFrameMonitoring: true,
          enableInteractionTracking: true,
          enableMemoryMonitoring: true,
          sampleRate: 0.1, // Sample 10% of events
          reportingInterval: 30000
        });

        this.performanceMonitor.start();

        // Initialize progressive loading
        this.progressiveLoader = new ProgressiveLoadingManager();
        
        // Set up existing gallery integration
        this.setupExistingGalleryIntegration();

        // Create performance dashboard
        this.createPerformanceDashboard();

        // Set up global references
        window.galleryPerformanceMonitor = this.performanceMonitor;
        window.galleryProgressiveLoader = this.progressiveLoader;

        this.isInitialized = true;
        console.log('Gallery Performance Integration initialized successfully');

      } catch (error) {
        console.error('Failed to initialize Gallery Performance Integration:', error);
        throw error;
      }
    }

    setupExistingGalleryIntegration() {
      // Enhance existing filter functionality
      const filterButtons = document.querySelectorAll('.filter-btn');
      filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          const startTime = performance.now();
          const filter = button.getAttribute('data-filter');
          
          // Let the original handler run first
          setTimeout(() => {
            const duration = performance.now() - startTime;
            this.performanceMonitor.recordInteraction('filter', duration, { filter });
            
            // Re-observe visible images after filter change
            this.observeVisibleImages();
          }, 0);
        });
      });

      // Set up progressive loading for existing images
      this.observeVisibleImages();

      // Enhance existing loading behavior
      this.enhanceImageLoading();
    }

    observeVisibleImages() {
      const galleryItems = document.querySelectorAll('.gallery-item');
      
      galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img && !img.classList.contains('loaded')) {
          const imageId = `gallery-item-${index}`;
          this.progressiveLoader.observe(item, imageId);
        }
      });
    }

    enhanceImageLoading() {
      // Add loading states to images
      const images = document.querySelectorAll('.gallery-item img');
      
      images.forEach((img, index) => {
        if (img.complete && img.naturalHeight !== 0) {
          img.classList.add('loaded');
          return;
        }

        // Add loading class
        img.classList.add('loading');
        
        const startTime = performance.now();
        
        img.addEventListener('load', () => {
          const loadTime = performance.now() - startTime;
          img.classList.remove('loading');
          img.classList.add('loaded');
          
          this.performanceMonitor.recordImageLoadTime(`existing-image-${index}`, loadTime);
        });

        img.addEventListener('error', () => {
          img.classList.remove('loading');
          img.classList.add('error');
        });
      });
    }

    createPerformanceDashboard() {
      const dashboard = document.createElement('div');
      dashboard.className = 'performance-dashboard';
      dashboard.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 300px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        max-height: 400px;
        overflow-y: auto;
        display: none;
      `;

      const updateDashboard = () => {
        const data = this.performanceMonitor.getDashboardData();
        
        dashboard.innerHTML = `
          <div style="margin-bottom: 10px; font-weight: bold;">Performance Dashboard</div>
          
          <div style="margin-bottom: 8px;">
            <div>Avg Load Time: ${data.summary.averageLoadTime.toFixed(0)}ms</div>
            <div>Cache Hit Rate: ${(data.summary.cacheHitRate * 100).toFixed(1)}%</div>
            <div>Memory Usage: ${(data.summary.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
            <div>Average FPS: ${data.summary.averageFPS.toFixed(1)}</div>
            <div>Interactions: ${data.summary.totalInteractions}</div>
          </div>
          
          <div style="font-size: 10px; color: #888;">
            Press 'P' to toggle dashboard
          </div>
        `;
      };

      setInterval(updateDashboard, 2000);
      updateDashboard();

      // Toggle dashboard with 'P' key
      document.addEventListener('keydown', (event) => {
        if (event.key === 'p' || event.key === 'P') {
          dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
        }
      });

      document.body.appendChild(dashboard);
      this.dashboard = dashboard;
    }

    getPerformanceMetrics() {
      return this.performanceMonitor ? this.performanceMonitor.getMetrics() : null;
    }

    getDashboardData() {
      return this.performanceMonitor ? this.performanceMonitor.getDashboardData() : null;
    }

    destroy() {
      if (this.performanceMonitor) {
        this.performanceMonitor.stop();
        this.performanceMonitor = null;
      }

      if (this.dashboard) {
        this.dashboard.remove();
        this.dashboard = null;
      }

      this.isInitialized = false;
      console.log('Gallery Performance Integration destroyed');
    }
  }

  // Auto-initialize when DOM is ready
  function initializeGalleryPerformance() {
    const integration = new GalleryPerformanceIntegration();
    
    integration.initialize().then(() => {
      console.log('Gallery Performance System ready');
      
      // Make globally available for debugging
      window.galleryPerformanceSystem = integration;
      
      // Dispatch ready event
      window.dispatchEvent(new CustomEvent('gallery-performance-ready', {
        detail: { system: integration }
      }));
      
    }).catch((error) => {
      console.error('Failed to initialize Gallery Performance System:', error);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGalleryPerformance);
  } else {
    initializeGalleryPerformance();
  }

})();