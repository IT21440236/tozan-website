/**
 * Gallery Integration Module
 * Integrates the performance optimization system with existing gallery HTML
 */

import { GalleryComponent } from './gallery-component';
import { ImageMetadata } from './types';

/**
 * Configuration for gallery integration
 */
interface GalleryIntegrationConfig {
  containerId: string;
  filterButtonsSelector: string;
  loadingSpinnerId: string;
  enableProgressiveLoading: boolean;
  enablePerformanceMonitoring: boolean;
  preserveExistingStyles: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: GalleryIntegrationConfig = {
  containerId: 'gallery-content',
  filterButtonsSelector: '.filter-btn',
  loadingSpinnerId: 'loading',
  enableProgressiveLoading: true,
  enablePerformanceMonitoring: true,
  preserveExistingStyles: true
};

/**
 * Gallery Integration class
 * Handles the integration between the existing HTML gallery and the new performance system
 */
export class GalleryIntegration {
  private config: GalleryIntegrationConfig;
  private galleryComponent: GalleryComponent | null = null;
  private originalImages: ImageMetadata[] = [];
  private container: HTMLElement | null = null;
  private filterButtons: NodeListOf<Element> | null = null;
  private loadingSpinner: HTMLElement | null = null;
  private isInitialized = false;

  constructor(config: Partial<GalleryIntegrationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the gallery integration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Gallery integration already initialized');
      return;
    }

    try {
      // Find DOM elements
      this.container = document.getElementById(this.config.containerId);
      this.filterButtons = document.querySelectorAll(this.config.filterButtonsSelector);
      this.loadingSpinner = document.getElementById(this.config.loadingSpinnerId);

      if (!this.container) {
        throw new Error(`Gallery container not found: ${this.config.containerId}`);
      }

      // Extract existing image data
      this.originalImages = this.extractImageMetadata();

      // Create gallery component
      this.galleryComponent = new GalleryComponent(this.container, this.originalImages);

      // Set up filter integration
      this.setupFilterIntegration();

      // Set up loading state integration
      this.setupLoadingStateIntegration();

      // Initialize the gallery component
      await this.galleryComponent.initialize();

      // Hide original loading spinner
      this.hideLoadingSpinner();

      this.isInitialized = true;
      console.log('Gallery integration initialized successfully');

    } catch (error) {
      console.error('Failed to initialize gallery integration:', error);
      throw error;
    }
  }

  /**
   * Extract image metadata from existing HTML structure
   */
  private extractImageMetadata(): ImageMetadata[] {
    const images: ImageMetadata[] = [];
    
    // Find all gallery categories
    const categories = document.querySelectorAll('.gallery-category');
    
    categories.forEach((category) => {
      const categoryId = category.id;
      const categoryName = this.extractCategoryName(categoryId);
      
      // Find all images in this category
      const imageElements = category.querySelectorAll('.gallery-item img');
      
      imageElements.forEach((img, index) => {
        const imgElement = img as HTMLImageElement;
        const linkElement = img.closest('a') as HTMLAnchorElement;
        
        if (linkElement && imgElement) {
          const imageMetadata: ImageMetadata = {
            id: this.generateImageId(categoryId, index),
            url: linkElement.href,
            thumbnailUrl: imgElement.src,
            category: categoryName,
            alt: imgElement.alt || `Image ${index + 1}`,
            dimensions: {
              width: imgElement.naturalWidth || 800,
              height: imgElement.naturalHeight || 600
            },
            priority: this.calculateImagePriority(category, index),
            cached: false
          };
          
          images.push(imageMetadata);
        }
      });
    });

    console.log(`Extracted ${images.length} images from existing HTML`);
    return images;
  }

  /**
   * Extract category name from category ID
   */
  private extractCategoryName(categoryId: string): string {
    // Convert kebab-case to title case
    return categoryId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Generate unique image ID
   */
  private generateImageId(categoryId: string, index: number): string {
    return `${categoryId}-${index}`;
  }

  /**
   * Calculate image priority based on position and category
   */
  private calculateImagePriority(category: Element, index: number): number {
    // Higher priority for images that appear earlier
    const basePriority = Math.max(0, 100 - index * 2);
    
    // Boost priority for certain categories
    const categoryId = category.id;
    if (categoryId.includes('members') || categoryId.includes('temple')) {
      return basePriority + 20;
    }
    
    return basePriority;
  }

  /**
   * Set up integration with existing filter buttons
   */
  private setupFilterIntegration(): void {
    if (!this.filterButtons || !this.galleryComponent) {
      return;
    }

    this.filterButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        
        // Remove active class from all buttons
        this.filterButtons?.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get filter value
        const filter = button.getAttribute('data-filter') || 'all';
        
        // Apply filter through gallery component
        this.galleryComponent?.applyFilter(this.mapFilterToCategory(filter));
        
        // Smooth scroll to gallery content
        this.container?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
    });
  }

  /**
   * Map filter button values to category names
   */
  private mapFilterToCategory(filter: string): string {
    const filterMap: Record<string, string> = {
      'all': 'all',
      'members': 'Members Group Photos',
      'temple': 'Head Temple Premises',
      'fuji': 'Mount Fuji Views',
      'ceremony': 'Ceremony Special Events',
      'travel': 'Travel Journey',
      'hotels': 'Hotels Accommodation',
      'local': 'Local Places Food'
    };
    
    return filterMap[filter] || 'all';
  }

  /**
   * Set up loading state integration
   */
  private setupLoadingStateIntegration(): void {
    if (!this.galleryComponent) {
      return;
    }

    // Monitor loading state changes
    const checkLoadingState = () => {
      if (this.galleryComponent?.isReady()) {
        this.hideLoadingSpinner();
        this.showGalleryContent();
      } else {
        this.showLoadingSpinner();
      }
    };

    // Check loading state periodically
    const loadingInterval = setInterval(() => {
      checkLoadingState();
      
      if (this.galleryComponent?.isReady()) {
        clearInterval(loadingInterval);
      }
    }, 100);

    // Clear interval after maximum wait time
    setTimeout(() => {
      clearInterval(loadingInterval);
      this.hideLoadingSpinner();
      this.showGalleryContent();
    }, 10000);
  }

  /**
   * Hide the loading spinner
   */
  private hideLoadingSpinner(): void {
    if (this.loadingSpinner) {
      this.loadingSpinner.style.display = 'none';
    }
  }

  /**
   * Show the loading spinner
   */
  private showLoadingSpinner(): void {
    if (this.loadingSpinner) {
      this.loadingSpinner.style.display = 'block';
    }
  }

  /**
   * Show gallery content
   */
  private showGalleryContent(): void {
    if (this.container) {
      this.container.style.opacity = '1';
      this.container.style.visibility = 'visible';
    }
  }

  /**
   * Replace static image loading with progressive loading
   */
  async replaceStaticLoading(): Promise<void> {
    if (!this.container || !this.galleryComponent) {
      return;
    }

    // Hide existing gallery categories temporarily
    const categories = this.container.querySelectorAll('.gallery-category');
    categories.forEach(category => {
      (category as HTMLElement).style.display = 'none';
    });

    // Let the gallery component handle the rendering
    // The gallery component will create its own optimized structure
    console.log('Static loading replaced with progressive loading system');
  }

  /**
   * Update filter functionality to work with new system
   */
  updateFilterFunctionality(): void {
    // The filter integration is already set up in setupFilterIntegration()
    // This method can be used for additional filter customizations
    
    if (this.filterButtons) {
      this.filterButtons.forEach(button => {
        // Add performance monitoring to filter clicks
        button.addEventListener('click', () => {
          const startTime = performance.now();
          const filter = button.getAttribute('data-filter') || 'all';
          
          // Track filter change performance
          setTimeout(() => {
            const duration = performance.now() - startTime;
            console.log(`Filter change to '${filter}' took ${duration.toFixed(2)}ms`);
          }, 0);
        });
      });
    }
  }

  /**
   * Maintain existing visual design and user experience
   */
  preserveVisualDesign(): void {
    if (!this.config.preserveExistingStyles || !this.container) {
      return;
    }

    // Preserve existing CSS classes and styles
    const existingClasses = this.container.className;
    
    // Add performance system classes while preserving existing ones
    this.container.className = `${existingClasses} gallery-performance-enabled`;
    
    // Preserve existing CSS custom properties
    const computedStyle = window.getComputedStyle(this.container);
    const cssVariables = [
      '--primary-gradient',
      '--secondary-gradient',
      '--success-gradient',
      '--shadow-light',
      '--shadow-medium',
      '--shadow-heavy',
      '--border-radius',
      '--transition'
    ];
    
    cssVariables.forEach(variable => {
      const value = computedStyle.getPropertyValue(variable);
      if (value) {
        this.container?.style.setProperty(variable, value);
      }
    });
  }

  /**
   * Get gallery component instance
   */
  getGalleryComponent(): GalleryComponent | null {
    return this.galleryComponent;
  }

  /**
   * Get loading progress (0-1)
   */
  getLoadingProgress(): number {
    return this.galleryComponent?.getLoadingProgress() || 0;
  }

  /**
   * Check if gallery is ready
   */
  isReady(): boolean {
    return this.galleryComponent?.isReady() || false;
  }

  /**
   * Get visible images
   */
  getVisibleImages(): string[] {
    return this.galleryComponent?.getVisibleImages() || [];
  }

  /**
   * Destroy the integration and clean up resources
   */
  destroy(): void {
    if (this.galleryComponent) {
      this.galleryComponent.destroy();
      this.galleryComponent = null;
    }
    
    this.isInitialized = false;
    console.log('Gallery integration destroyed');
  }
}

/**
 * Initialize gallery integration when DOM is ready
 */
export function initializeGalleryIntegration(config?: Partial<GalleryIntegrationConfig>): Promise<GalleryIntegration> {
  return new Promise((resolve, reject) => {
    const init = async () => {
      try {
        const integration = new GalleryIntegration(config);
        await integration.initialize();
        
        // Replace static loading with progressive loading
        await integration.replaceStaticLoading();
        
        // Update filter functionality
        integration.updateFilterFunctionality();
        
        // Preserve visual design
        integration.preserveVisualDesign();
        
        resolve(integration);
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