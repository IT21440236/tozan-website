# Design Document

## Overview

This design document outlines the integration of video support into the existing Tozan pilgrimage photo gallery. The solution extends the current gallery architecture to handle video content alongside images while maintaining the same user experience, performance characteristics, and visual consistency.

The design leverages the existing GLightbox library for video playback, extends the current performance monitoring system to track video metrics, and integrates seamlessly with the established category filtering and lazy loading mechanisms.

## Architecture

### High-Level Architecture

The video integration follows the existing gallery architecture pattern:

```
Gallery Component (Enhanced)
├── Media Manager (Extended from Image Manager)
│   ├── Image Loading & Caching
│   └── Video Loading & Caching (NEW)
├── Viewport Manager (Enhanced)
│   ├── Image Viewport Tracking
│   └── Video Viewport Tracking (NEW)
├── Performance Monitor (Enhanced)
│   ├── Image Performance Metrics
│   └── Video Performance Metrics (NEW)
└── UI Feedback Manager (Enhanced)
    ├── Image Loading States
    └── Video Loading States (NEW)
```

### Integration Points

1. **GLightbox Enhancement**: Extend existing GLightbox configuration to support video playback
2. **Media Type Detection**: Add logic to distinguish between image and video content
3. **Performance Monitoring**: Extend existing performance system to track video metrics
4. **Category System**: Integrate videos into existing category filtering
5. **Lazy Loading**: Apply existing lazy loading patterns to video thumbnails

## Components and Interfaces

### Enhanced Media Manager

Extends the existing `ImageManager` to become a `MediaManager`:

```typescript
interface MediaManager extends ImageManager {
  loadVideo(metadata: VideoMetadata): Promise<HTMLVideoElement>;
  generateVideoThumbnail(videoUrl: string): Promise<string>;
  preloadVideos(metadataList: VideoMetadata[]): Promise<void>;
  getVideoLoadingState(): VideoLoadingState;
}

interface VideoMetadata extends ImageMetadata {
  type: 'video';
  videoUrl: string;
  duration?: number;
  thumbnailUrl: string;
  format: 'mov' | 'mp4' | 'webm';
}
```

### Video Thumbnail Generator

```typescript
interface VideoThumbnailGenerator {
  generateThumbnail(videoUrl: string, timeOffset?: number): Promise<string>;
  extractVideoMetadata(videoUrl: string): Promise<VideoMetadata>;
  createVideoPreview(videoElement: HTMLVideoElement): string;
}
```

### Enhanced GLightbox Configuration

```typescript
interface EnhancedLightboxConfig {
  touchNavigation: boolean;
  loop: boolean;
  autoplayVideos: boolean;
  videoControls: {
    showPlayButton: boolean;
    showProgressBar: boolean;
    showVolumeControl: boolean;
    showFullscreenButton: boolean;
  };
  videoSettings: {
    preload: 'none' | 'metadata' | 'auto';
    muted: boolean;
    playsinline: boolean;
  };
}
```

## Data Models

### Unified Media Item Model

```typescript
type MediaItem = ImageMetadata | VideoMetadata;

interface BaseMediaMetadata {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  alt: string;
  category: string;
  priority: number;
  dimensions: {
    width: number;
    height: number;
  };
}

interface ImageMetadata extends BaseMediaMetadata {
  type: 'image';
}

interface VideoMetadata extends BaseMediaMetadata {
  type: 'video';
  videoUrl: string;
  duration?: number;
  format: 'mov' | 'mp4' | 'webm';
}
```

### Video Loading State

```typescript
interface VideoLoadingState {
  totalVideos: number;
  loadedVideos: number;
  failedVideos: number;
  currentBatch: string[];
  pendingBatches: string[][];
  isLoading: boolean;
  thumbnailsGenerated: number;
  error: string | null;
}
```

### Enhanced Performance Metrics

```typescript
interface EnhancedPerformanceMetrics {
  imageLoadTimes: Map<string, number>;
  videoLoadTimes: Map<string, number>;
  thumbnailGenerationTimes: Map<string, number>;
  videoPlaybackMetrics: Map<string, VideoPlaybackMetrics>;
  cacheHitRate: number;
  memoryUsage: number;
  networkRequests: number;
}

interface VideoPlaybackMetrics {
  loadTime: number;
  bufferingEvents: number;
  totalBufferTime: number;
  playbackErrors: number;
  qualityChanges: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

<function_calls>
<invoke name="prework">
<parameter name="featureName">gallery-video-integration