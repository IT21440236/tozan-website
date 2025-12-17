/**
 * Test setup file for vitest
 * Configures the testing environment for gallery components
 */

// Mock IntersectionObserver for testing
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  
  callback: IntersectionObserverCallback;
  
  observe() {
    // Mock implementation
  }
  
  unobserve() {
    // Mock implementation
  }
  
  disconnect() {
    // Mock implementation
  }
};

// Mock ResizeObserver for testing
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  callback: ResizeObserverCallback;
  
  observe() {
    // Mock implementation
  }
  
  unobserve() {
    // Mock implementation
  }
  
  disconnect() {
    // Mock implementation
  }
};

// Mock performance API
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
    getEntriesByName: () => [],
  } as any;
}

// Mock navigator.connection for network testing
Object.defineProperty(navigator, 'connection', {
  writable: true,
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  },
});

// Mock Image constructor for testing
global.Image = class MockImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.src = '';
  }
  
  onload: ((this: GlobalEventHandlers, ev: Event) => any) | null;
  onerror: ((this: GlobalEventHandlers, ev: string | Event) => any) | null;
  src: string;
  
  // Simulate successful image load
  triggerLoad() {
    if (this.onload) {
      this.onload.call(this, new Event('load'));
    }
  }
  
  // Simulate image load error
  triggerError() {
    if (this.onerror) {
      this.onerror.call(this, new Event('error'));
    }
  }
} as any;