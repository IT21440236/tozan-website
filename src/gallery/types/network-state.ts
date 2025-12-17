/**
 * Network state and connection information
 * Used for adaptive loading based on network conditions
 */
export interface NetworkState {
  /** Connection speed classification */
  speed: 'slow' | 'medium' | 'fast';
  /** Effective connection type from Network Information API */
  effectiveType: string;
  /** Downlink speed in Mbps */
  downlink: number;
  /** Round-trip time in milliseconds */
  rtt: number;
  /** Whether the user has enabled data saver mode */
  saveData: boolean;
}

/**
 * Network speed classifications with thresholds
 */
export const NetworkSpeedThresholds = {
  SLOW_RTT: 1000,      // > 1000ms RTT = slow
  SLOW_DOWNLINK: 1.5,  // < 1.5 Mbps = slow
  FAST_RTT: 300,       // < 300ms RTT = fast
  FAST_DOWNLINK: 10,   // > 10 Mbps = fast
} as const;

/**
 * Network error types
 */
export interface NetworkError extends Error {
  type: 'timeout' | 'offline' | 'server-error' | 'rate-limit' | 'unknown';
  statusCode?: number;
  retryAfter?: number;
}