/**
 * Performance Monitoring and Analytics Module
 * Implements comprehensive performance tracking and regression detection
 */

import { 
  PerformanceMetrics, 
  FrameMetrics, 
  InteractionMetrics, 
  PerformanceBenchmarks 
} from './types';

/**
 * Performance monitoring configuration
 */
interface PerformanceMonitorConfig {
  enableFrameMonitoring: boolean;
  enableInteractionTracking: boolean;
  enableMemoryMonitoring: boolean;
  enableNetworkMonitoring: boolean;
  enableRegressionDetection: boolean;
  sampleRate: number; // 0-1, percentage of events to track
  maxHistorySize: number;
  reportingInterval: number; // milliseconds
}

/**
 * Performance regression detection thresholds
 */
interface RegressionThresholds {
  initialLoadIncrease: number; // percentage increase that triggers alert
  cacheHitRateDecrease: number; // percentage decrease that triggers alert
  memoryUsageIncrease: number; // percentage increase that triggers alert
  frameDropIncrease: number; // percentage increase that triggers alert
}

/**
 * Performance report data
 */
interface PerformanceReport {
  timestamp: number;
  metrics: PerformanceMetrics;
  regressions: RegressionAlert[];
  recommendations: string[];
}

/**
 * Regression alert information
 */
interface RegressionAlert {
  type: 'initial-load' | 'cache-performance' | 'memory-usage' | 'scroll-performance';
  severity: 'low' | 'medium' | 'high';
  message: string;
  currentValue: number;
  previousValue: number;
  threshold: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PerformanceMonitorConfig = {
  enableFrameMonitoring: true,
  enableInteractionTracking: true,
  enableMemoryMonitoring: true,
  enableNetworkMonitoring: true,
  enableRegressionDetection: true,
  sampleRate: 1.0,
  maxHistorySize: 100,
  reportingInterval: 30000 // 30 seconds
};

/**
 * Default regression thresholds
 */
const DEFAULT_THRESHOLDS: RegressionThresholds = {
  initialLoadIncrease: 20, // 20% increase
  cacheHitRateDecrease: 10, // 10% decrease
  memoryUsageIncrease: 25, // 25% increase
  frameDropIncrease: 15 // 15% increase
};

/**
 * Performance Monitor class
 */
export class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private thresholds: RegressionThresholds;
  private metrics: PerformanceMetrics;
  private metricsHistory: PerformanceMetrics[] = [];
  private frameObserver: PerformanceObserver | null = null;
  private memoryMonitorInterval: number | null = null;
  private reportingInterval: number | null = null;
  private isMonitoring = false;
  private startTime = 0;

  constructor(
    config: Partial<PerformanceMonitorConfig> = {},
    thresholds: Partial<RegressionThresholds> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    
    this.metrics = {
      imageLoadTimes: new Map(),
      cacheHitRate: 0,
      memoryUsage: 0,
      networkRequests: 0,
      scrollPerformance: [],
      userInteractions: []
    };
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isMonitoring) {
      console.warn('Performance monitoring already started');
      return;
    }

    this.startTime = performance.now();
    this.isMonitoring = true;

    // Initialize frame monitoring
    if (this.config.enableFrameMonitoring) {
      this.startFrameMonitoring();
    }

    // Initialize memory monitoring
    if (this.config.enableMemoryMonitoring) {
      this.startMemoryMonitoring();
    }

    // Initialize interaction tracking
    if (this.config.enableInteractionTracking) {
      this.startInteractionTracking();
    }

    // Start periodic reporting
    this.startPeriodicReporting();

    console.log('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    // Stop frame monitoring
    if (this.frameObserver) {
      this.frameObserver.disconnect();
      this.frameObserver = null;
    }

    // Stop memory monitoring
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
    }

    // Stop reporting
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }

    console.log('Performance monitoring stopped');
  }

  /**
   * Record image load time
   */
  recordImageLoadTime(imageId: string, loadTime: number): void {
    if (!this.shouldSample()) return;

    this.metrics.imageLoadTimes.set(imageId, loadTime);
    
    // Track network requests
    this.metrics.networkRequests++;
  }

  /**
   * Update cache hit rate
   */
  updateCacheHitRate(hitRate: number): void {
    this.metrics.cacheHitRate = hitRate;
  }

  /**
   * Update memory usage
   */
  updateMemoryUsage(usage: number): void {
    this.metrics.memoryUsage = usage;
  }

  /**
   * Record user interaction
   */
  recordInteraction(
    type: InteractionMetrics['type'], 
    duration: number, 
    context: Record<string, any> = {}
  ): void {
    if (!this.config.enableInteractionTracking || !this.shouldSample()) {
      return;
    }

    const interaction: InteractionMetrics = {
      type,
      timestamp: performance.now(),
      duration,
      context
    };

    this.metrics.userInteractions.push(interaction);

    // Limit history size
    if (this.metrics.userInteractions.length > this.config.maxHistorySize) {
      this.metrics.userInteractions.shift();
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      imageLoadTimes: new Map(this.metrics.imageLoadTimes),
      cacheHitRate: this.metrics.cacheHitRate,
      memoryUsage: this.metrics.memoryUsage,
      networkRequests: this.metrics.networkRequests,
      scrollPerformance: [...this.metrics.scrollPerformance],
      userInteractions: [...this.metrics.userInteractions]
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const currentMetrics = this.getMetrics();
    const regressions = this.config.enableRegressionDetection 
      ? this.detectRegressions(currentMetrics)
      : [];
    const recommendations = this.generateRecommendations(currentMetrics, regressions);

    return {
      timestamp: Date.now(),
      metrics: currentMetrics,
      regressions,
      recommendations
    };
  }

  /**
   * Get performance dashboard data
   */
  getDashboardData(): {
    summary: {
      averageLoadTime: number;
      cacheHitRate: number;
      memoryUsage: number;
      averageFPS: number;
      totalInteractions: number;
    };
    trends: {
      loadTimeTrend: number[];
      memoryTrend: number[];
      fpsTrend: number[];
    };
    alerts: RegressionAlert[];
  } {
    const loadTimes = Array.from(this.metrics.imageLoadTimes.values());
    const averageLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
      : 0;

    const recentFrames = this.metrics.scrollPerformance.slice(-10);
    const averageFPS = recentFrames.length > 0
      ? recentFrames.reduce((sum, frame) => sum + frame.fps, 0) / recentFrames.length
      : 0;

    // Calculate trends from history
    const loadTimeTrend = this.metricsHistory.slice(-10).map(m => {
      const times = Array.from(m.imageLoadTimes.values());
      return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
    });

    const memoryTrend = this.metricsHistory.slice(-10).map(m => m.memoryUsage);
    
    const fpsTrend = this.metricsHistory.slice(-10).map(m => {
      const frames = m.scrollPerformance.slice(-5);
      return frames.length > 0 
        ? frames.reduce((sum, frame) => sum + frame.fps, 0) / frames.length 
        : 0;
    });

    const alerts = this.detectRegressions(this.metrics);

    return {
      summary: {
        averageLoadTime,
        cacheHitRate: this.metrics.cacheHitRate,
        memoryUsage: this.metrics.memoryUsage,
        averageFPS,
        totalInteractions: this.metrics.userInteractions.length
      },
      trends: {
        loadTimeTrend,
        memoryTrend,
        fpsTrend
      },
      alerts
    };
  }

  /**
   * Export performance data for analysis
   */
  exportData(): {
    config: PerformanceMonitorConfig;
    metrics: PerformanceMetrics;
    history: PerformanceMetrics[];
    sessionDuration: number;
  } {
    return {
      config: this.config,
      metrics: this.getMetrics(),
      history: [...this.metricsHistory],
      sessionDuration: performance.now() - this.startTime
    };
  }

  // Private methods

  /**
   * Start frame monitoring for scroll performance
   */
  private startFrameMonitoring(): void {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported, frame monitoring disabled');
      return;
    }

    try {
      this.frameObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          if (entry.entryType === 'measure' && entry.name.includes('frame')) {
            const frameMetric: FrameMetrics = {
              timestamp: entry.startTime,
              duration: entry.duration,
              dropped: entry.duration > PerformanceBenchmarks.SCROLL_FRAME_TARGET,
              fps: 1000 / entry.duration
            };

            this.metrics.scrollPerformance.push(frameMetric);

            // Limit history size
            if (this.metrics.scrollPerformance.length > this.config.maxHistorySize) {
              this.metrics.scrollPerformance.shift();
            }
          }
        }
      });

      this.frameObserver.observe({ entryTypes: ['measure'] });
    } catch (error) {
      console.error('Failed to start frame monitoring:', error);
    }
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    this.memoryMonitorInterval = window.setInterval(() => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo) {
          this.metrics.memoryUsage = memoryInfo.usedJSHeapSize;
        }
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Start interaction tracking
   */
  private startInteractionTracking(): void {
    // Track scroll interactions
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

    let scrollTimeout: number;
    window.addEventListener('scroll', () => {
      handleScrollStart();
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(handleScrollEnd, 150);
    }, { passive: true });

    // Track filter changes
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('filter-btn')) {
        const startTime = performance.now();
        
        // Use requestAnimationFrame to measure after DOM updates
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

    // Track image clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('.gallery-item')) {
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
          const duration = performance.now() - startTime;
          const imageId = target.closest('[data-image-id]')?.getAttribute('data-image-id') || 'unknown';
          
          this.recordInteraction('image-click', duration, {
            imageId,
            category: target.closest('.gallery-category')?.id
          });
        });
      }
    });
  }

  /**
   * Start periodic reporting
   */
  private startPeriodicReporting(): void {
    this.reportingInterval = window.setInterval(() => {
      // Save current metrics to history
      this.metricsHistory.push(this.getMetrics());

      // Limit history size
      if (this.metricsHistory.length > this.config.maxHistorySize) {
        this.metricsHistory.shift();
      }

      // Generate and log report
      const report = this.generateReport();
      
      if (report.regressions.length > 0) {
        console.warn('Performance regressions detected:', report.regressions);
      }

      // Emit custom event for external listeners
      window.dispatchEvent(new CustomEvent('gallery-performance-report', {
        detail: report
      }));

    }, this.config.reportingInterval);
  }

  /**
   * Detect performance regressions
   */
  private detectRegressions(currentMetrics: PerformanceMetrics): RegressionAlert[] {
    const alerts: RegressionAlert[] = [];

    if (this.metricsHistory.length === 0) {
      return alerts; // Need history to detect regressions
    }

    const previousMetrics = this.metricsHistory[this.metricsHistory.length - 1];

    // Check initial load time regression
    const currentAvgLoadTime = this.calculateAverageLoadTime(currentMetrics);
    const previousAvgLoadTime = this.calculateAverageLoadTime(previousMetrics);
    
    if (previousAvgLoadTime > 0) {
      const loadTimeIncrease = ((currentAvgLoadTime - previousAvgLoadTime) / previousAvgLoadTime) * 100;
      
      if (loadTimeIncrease > this.thresholds.initialLoadIncrease) {
        alerts.push({
          type: 'initial-load',
          severity: loadTimeIncrease > 50 ? 'high' : loadTimeIncrease > 30 ? 'medium' : 'low',
          message: `Image load time increased by ${loadTimeIncrease.toFixed(1)}%`,
          currentValue: currentAvgLoadTime,
          previousValue: previousAvgLoadTime,
          threshold: this.thresholds.initialLoadIncrease
        });
      }
    }

    // Check cache hit rate regression
    const cacheRateDecrease = ((previousMetrics.cacheHitRate - currentMetrics.cacheHitRate) / previousMetrics.cacheHitRate) * 100;
    
    if (cacheRateDecrease > this.thresholds.cacheHitRateDecrease) {
      alerts.push({
        type: 'cache-performance',
        severity: cacheRateDecrease > 30 ? 'high' : cacheRateDecrease > 20 ? 'medium' : 'low',
        message: `Cache hit rate decreased by ${cacheRateDecrease.toFixed(1)}%`,
        currentValue: currentMetrics.cacheHitRate,
        previousValue: previousMetrics.cacheHitRate,
        threshold: this.thresholds.cacheHitRateDecrease
      });
    }

    // Check memory usage regression
    if (previousMetrics.memoryUsage > 0) {
      const memoryIncrease = ((currentMetrics.memoryUsage - previousMetrics.memoryUsage) / previousMetrics.memoryUsage) * 100;
      
      if (memoryIncrease > this.thresholds.memoryUsageIncrease) {
        alerts.push({
          type: 'memory-usage',
          severity: memoryIncrease > 50 ? 'high' : memoryIncrease > 35 ? 'medium' : 'low',
          message: `Memory usage increased by ${memoryIncrease.toFixed(1)}%`,
          currentValue: currentMetrics.memoryUsage,
          previousValue: previousMetrics.memoryUsage,
          threshold: this.thresholds.memoryUsageIncrease
        });
      }
    }

    // Check scroll performance regression
    const currentFrameDropRate = this.calculateFrameDropRate(currentMetrics);
    const previousFrameDropRate = this.calculateFrameDropRate(previousMetrics);
    
    if (previousFrameDropRate >= 0) {
      const frameDropIncrease = currentFrameDropRate - previousFrameDropRate;
      
      if (frameDropIncrease > this.thresholds.frameDropIncrease) {
        alerts.push({
          type: 'scroll-performance',
          severity: frameDropIncrease > 30 ? 'high' : frameDropIncrease > 20 ? 'medium' : 'low',
          message: `Frame drop rate increased by ${frameDropIncrease.toFixed(1)}%`,
          currentValue: currentFrameDropRate,
          previousValue: previousFrameDropRate,
          threshold: this.thresholds.frameDropIncrease
        });
      }
    }

    return alerts;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: PerformanceMetrics, regressions: RegressionAlert[]): string[] {
    const recommendations: string[] = [];

    // Check average load time
    const avgLoadTime = this.calculateAverageLoadTime(metrics);
    if (avgLoadTime > PerformanceBenchmarks.INITIAL_LOAD_TARGET) {
      recommendations.push('Consider optimizing image sizes or implementing more aggressive caching');
    }

    // Check cache hit rate
    if (metrics.cacheHitRate < 0.8) {
      recommendations.push('Cache hit rate is below 80%. Consider increasing cache size or improving cache strategy');
    }

    // Check memory usage
    const imageCount = metrics.imageLoadTimes.size;
    const memoryPerImage = imageCount > 0 ? metrics.memoryUsage / imageCount : 0;
    const targetMemoryPerImage = PerformanceBenchmarks.MEMORY_TARGET_PER_100_IMAGES / 100;
    
    if (memoryPerImage > targetMemoryPerImage) {
      recommendations.push('Memory usage per image is high. Consider implementing more aggressive memory cleanup');
    }

    // Check scroll performance
    const frameDropRate = this.calculateFrameDropRate(metrics);
    if (frameDropRate > 10) {
      recommendations.push('Scroll performance is degraded. Consider reducing concurrent operations during scrolling');
    }

    // Add regression-specific recommendations
    for (const regression of regressions) {
      switch (regression.type) {
        case 'initial-load':
          recommendations.push('Recent load time regression detected. Check for network issues or server performance');
          break;
        case 'cache-performance':
          recommendations.push('Cache performance has degraded. Consider clearing and rebuilding cache');
          break;
        case 'memory-usage':
          recommendations.push('Memory usage has increased significantly. Check for memory leaks');
          break;
        case 'scroll-performance':
          recommendations.push('Scroll performance has degraded. Reduce DOM manipulations during scroll');
          break;
      }
    }

    return recommendations;
  }

  /**
   * Calculate average load time from metrics
   */
  private calculateAverageLoadTime(metrics: PerformanceMetrics): number {
    const loadTimes = Array.from(metrics.imageLoadTimes.values());
    return loadTimes.length > 0 
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
      : 0;
  }

  /**
   * Calculate frame drop rate from metrics
   */
  private calculateFrameDropRate(metrics: PerformanceMetrics): number {
    const frames = metrics.scrollPerformance;
    if (frames.length === 0) return 0;
    
    const droppedFrames = frames.filter(frame => frame.dropped).length;
    return (droppedFrames / frames.length) * 100;
  }

  /**
   * Determine if this event should be sampled
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }
}

/**
 * Create and configure performance dashboard UI
 */
export function createPerformanceDashboard(monitor: PerformanceMonitor): HTMLElement {
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
    const data = monitor.getDashboardData();
    
    dashboard.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold;">Performance Dashboard</div>
      
      <div style="margin-bottom: 8px;">
        <div>Avg Load Time: ${data.summary.averageLoadTime.toFixed(0)}ms</div>
        <div>Cache Hit Rate: ${(data.summary.cacheHitRate * 100).toFixed(1)}%</div>
        <div>Memory Usage: ${(data.summary.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
        <div>Average FPS: ${data.summary.averageFPS.toFixed(1)}</div>
        <div>Interactions: ${data.summary.totalInteractions}</div>
      </div>
      
      ${data.alerts.length > 0 ? `
        <div style="margin-bottom: 8px; color: #ff6b6b;">
          <div style="font-weight: bold;">Alerts:</div>
          ${data.alerts.map(alert => `
            <div style="margin-left: 10px; font-size: 11px;">
              ${alert.severity.toUpperCase()}: ${alert.message}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div style="font-size: 10px; color: #888;">
        Press 'P' to toggle dashboard
      </div>
    `;
  };

  // Update dashboard every 2 seconds
  setInterval(updateDashboard, 2000);
  updateDashboard();

  // Toggle dashboard with 'P' key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
      dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
    }
  });

  document.body.appendChild(dashboard);
  return dashboard;
}