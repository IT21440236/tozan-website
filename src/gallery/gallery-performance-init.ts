/**
 * Gallery Performance Initialization Script
 * Integrates the performance optimization system with the existing gallery
 */

import { GalleryIntegration, initializeGalleryIntegration } from './gallery-integration';
import { PerformanceMonitor, createPerformanceDashboard } from './performance-monitor';

/**
 * Global configuration for the gallery performance system
 */
interface GalleryPerformanceConfig {
  enablePerformanceMonitoring: boolean;
  enablePerformanceDashboard: boolean;
  enableProgressiveLoading: boolean;
  enableAdvancedCaching: boolean;
  enableMemoryManagement: boolean;
  debugMode: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: GalleryPerformanceConfig = {
  enablePerformanceMonitoring: true,
  enablePerformanceDashboard: false, // Hidden by default, toggle with 'P'
  enableProgressiveLoading: true,
  enableAdvancedCaching: true,
  enableMemoryManagement: true,
  debugMode: false
};

/**
 * Global gallery performance system
 */
class GalleryPerformanceSystem {
  private config: GalleryPerformanceConfig;
  private integration: GalleryIntegration | null = null;
  private performanceMonitor: PerformanceMonitor | null = null;
  private dashboard: HTMLElement | null = null;
  private isInitialized = false;

  constructor(config: Partial<GalleryPerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the complete performance system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Gallery performance system already initialized');
      return;
    }

    try {
      console.log('Initializing Gallery Performance System...');

      // Initialize performance monitoring first
      if (this.config.enablePerformanceMonitoring) {
        await this.initializePerformanceMonitoring();
      }

      // Initialize gallery integration
      if (this.config.enableProgressiveLoading) {
        await this.initializeGalleryIntegration();
      }

      // Set up performance dashboard
      if (this.config.enablePerformanceDashboard && this.performanceMonitor) {
        this.initializePerformanceDashboard();
      }

      // Set up global event listeners
      this.setupGlobalEventListeners();

      this.isInitialized = true;
      console.log('Gallery Performance System initialized successfully');

      // Log initial performance metrics
      if (this.config.debugMode && this.performanceMonitor) {
        setTimeout(() => {
          const report = this.performanceMonitor!.generateReport();
          console.log('Initial Performance Report:', report);
        }, 5000);
      }

    } catch (error) {
      console.error('Failed to initialize Gallery Performance System:', error);
      throw error;
    }
  }

  /**
   * Initialize performance monitoring
   */
  private async initializePerformanceMonitoring(): Promise<void> {
    this.performanceMonitor = new PerformanceMonitor({
      enableFrameMonitoring: true,
      enableInteractionTracking: true,
      enableMemoryMonitoring: this.config.enableMemoryManagement,
      enableNetworkMonitoring: true,
      enableRegressionDetection: true,
      sampleRate: this.config.debugMode ? 1.0 : 0.1, // Sample more in debug mode
      maxHistorySize: 50,
      reportingInterval: 30000
    });

    this.performanceMonitor.start();
    console.log('Performance monitoring started');
  }

  /**
   * Initialize gallery integration
   */
  private async initializeGalleryIntegration(): Promise<void> {
    this.integration = await initializeGalleryIntegration({
      containerId: 'gallery-content',
      filterButtonsSelector: '.filter-btn',
      loadingSpinnerId: 'loading',
      enableProgressiveLoading: this.config.enableProgressiveLoading,
      enablePerformanceMonitoring: this.config.enablePerformanceMonitoring,
      preserveExistingStyles: true
    });

    // Connect performance monitoring to gallery events
    if (this.performanceMonitor && this.integration) {
      this.connectPerformanceMonitoring();
    }

    console.log('Gallery integration completed');
  }

  /**
   * Initialize performance dashboard
   */
  private initializePerformanceDashboard(): void {
    if (!this.performanceMonitor) {
      return;
    }

    this.dashboard = createPerformanceDashboard(this.performanceMonitor);
    console.log('Performance dashboard created (press P to toggle)');
  }

  /**
   * Connect performance monitoring to gallery events
   */
  private connectPerformanceMonitoring(): void {
    if (!this.performanceMonitor || !this.integration) {
      return;
    }

    const galleryComponent = this.integration.getGalleryComponent();
    if (!galleryComponent) {
      return;
    }

    // Monitor image load times
    const originalLoadImage = galleryComponent.constructor.prototype.loadImage;
    if (originalLoadImage) {
      galleryComponent.constructor.prototype.loadImage = async function(metadata: any) {
        const startTime = performance.now();
        try {
          const result = await originalLoadImage.call(this, metadata);
          const loadTime = performance.now() - startTime;
          
          // Record load time in performance monitor
          if (window.galleryPerformanceSystem?.performanceMonitor) {
            window.galleryPerformanceSystem.performanceMonitor.recordImageLoadTime(metadata.id, loadTime);
          }
          
          return result;
        } catch (error) {
          const loadTime = performance.now() - startTime;
          
          // Record failed load time
          if (window.galleryPerformanceSystem?.performanceMonitor) {
            window.galleryPerformanceSystem.performanceMonitor.recordImageLoadTime(metadata.id, loadTime);
          }
          
          throw error;
        }
      };
    }

    // Monitor cache performance
    // This would be connected to the cache manager's hit rate updates

    // Monitor memory usage
    if (this.config.enableMemoryManagement) {
      setInterval(() => {
        if ('memory' in performance) {
          const memoryInfo = (performance as any).memory;
          if (memoryInfo && this.performanceMonitor) {
            this.performanceMonitor.updateMemoryUsage(memoryInfo.usedJSHeapSize);
          }
        }
      }, 5000);
    }
  }

  /**
   * Set up global event listeners
   */
  private setupGlobalEventListeners(): void {
    // Listen for performance reports
    window.addEventListener('gallery-performance-report', (event: CustomEvent) => {
      const report = event.detail;
      
      if (this.config.debugMode) {
        console.log('Performance Report:', report);
      }

      // Handle high-severity regressions
      const highSeverityAlerts = report.regressions.filter((r: any) => r.severity === 'high');
      if (highSeverityAlerts.length > 0) {
        console.warn('High severity performance regressions detected:', highSeverityAlerts);
        
        // Could trigger automatic optimizations here
        this.handlePerformanceRegressions(highSeverityAlerts);
      }
    });

    // Listen for visibility changes to pause/resume monitoring
    document.addEventListener('visibilitychange', () => {
      if (this.performanceMonitor) {
        if (document.hidden) {
          // Reduce monitoring when tab is hidden
          console.log('Tab hidden, reducing performance monitoring');
        } else {
          // Resume full monitoring when tab is visible
          console.log('Tab visible, resuming full performance monitoring');
        }
      }
    });

    // Listen for memory pressure warnings
    if ('memory' in performance) {
      const checkMemoryPressure = () => {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo) {
          const usageRatio = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;
          
          if (usageRatio > 0.9) {
            console.warn('High memory usage detected, triggering cleanup');
            this.handleMemoryPressure();
          }
        }
      };

      setInterval(checkMemoryPressure, 10000); // Check every 10 seconds
    }
  }

  /**
   * Handle performance regressions
   */
  private handlePerformanceRegressions(regressions: any[]): void {
    for (const regression of regressions) {
      switch (regression.type) {
        case 'memory-usage':
          this.handleMemoryPressure();
          break;
        case 'cache-performance':
          // Could trigger cache optimization
          console.log('Cache performance regression detected, consider cache optimization');
          break;
        case 'initial-load':
          // Could trigger loading strategy adjustment
          console.log('Load time regression detected, consider loading optimization');
          break;
        case 'scroll-performance':
          // Could trigger scroll optimization
          console.log('Scroll performance regression detected, consider scroll optimization');
          break;
      }
    }
  }

  /**
   * Handle memory pressure
   */
  private handleMemoryPressure(): void {
    if (this.integration) {
      const galleryComponent = this.integration.getGalleryComponent();
      
      // Trigger memory cleanup in gallery components
      // This would call methods on ImageManager, CacheManager, etc.
      console.log('Triggering memory cleanup due to pressure');
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): any {
    return this.performanceMonitor?.getMetrics() || null;
  }

  /**
   * Get performance dashboard data
   */
  getDashboardData(): any {
    return this.performanceMonitor?.getDashboardData() || null;
  }

  /**
   * Export performance data
   */
  exportPerformanceData(): any {
    return this.performanceMonitor?.exportData() || null;
  }

  /**
   * Destroy the performance system
   */
  destroy(): void {
    if (this.performanceMonitor) {
      this.performanceMonitor.stop();
      this.performanceMonitor = null;
    }

    if (this.integration) {
      this.integration.destroy();
      this.integration = null;
    }

    if (this.dashboard) {
      this.dashboard.remove();
      this.dashboard = null;
    }

    this.isInitialized = false;
    console.log('Gallery Performance System destroyed');
  }
}

/**
 * Initialize the gallery performance system when DOM is ready
 */
function initializeGalleryPerformanceSystem(config?: Partial<GalleryPerformanceConfig>): Promise<GalleryPerformanceSystem> {
  return new Promise((resolve, reject) => {
    const init = async () => {
      try {
        const system = new GalleryPerformanceSystem(config);
        await system.initialize();
        
        // Make system globally available for debugging
        (window as any).galleryPerformanceSystem = system;
        
        resolve(system);
      } catch (error) {
        reject(error);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  });
}

// Auto-initialize if this script is loaded directly
if (typeof window !== 'undefined') {
  // Check if we should auto-initialize
  const autoInit = document.currentScript?.getAttribute('data-auto-init') !== 'false';
  
  if (autoInit) {
    initializeGalleryPerformanceSystem({
      debugMode: document.currentScript?.getAttribute('data-debug') === 'true',
      enablePerformanceDashboard: document.currentScript?.getAttribute('data-dashboard') === 'true'
    }).then((system) => {
      console.log('Gallery Performance System auto-initialized');
    }).catch((error) => {
      console.error('Failed to auto-initialize Gallery Performance System:', error);
    });
  }
}

// Export for manual initialization
export { GalleryPerformanceSystem, initializeGalleryPerformanceSystem };