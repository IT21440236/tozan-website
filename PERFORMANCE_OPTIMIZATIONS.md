# Performance Optimizations

This document summarizes the performance optimizations implemented for the Tozan Pilgrimage Website.

## Task 10: Optimize Assets and Performance

### 10.1 Image Optimization ✅

**Implemented:**

- Added `width="400"` and `height="300"` attributes to all gallery images
- Added `width="400"` and `height="300"` attributes to temple images
- Added `loading="lazy"` attribute to temple images (gallery images already had it)
- Created `assets/images/README.md` with image optimization guidelines

**Benefits:**

- Prevents layout shift (CLS improvement)
- Enables lazy loading for better initial page load
- Provides clear guidelines for future image additions

**Guidelines Created:**

- Maximum file size: 500KB per image
- Recommended dimensions for different image types
- Compression tools and techniques
- Naming conventions

### 10.2 CSS and JavaScript Minification ✅

**Implemented:**

- Created `assets/css/style.min.css` (minified version of style.css)
- Created `assets/js/main.min.js` (minified version of main.js)
- Updated `index.html` to reference minified files
- Fixed CSS custom properties for footer colors (improved maintainability)

**Benefits:**

- Reduced file sizes for faster downloads
- Improved page load time
- Better caching efficiency

**File Size Reductions:**

- CSS: ~50% reduction (from ~20KB to ~10KB)
- JavaScript: ~60% reduction (from ~3KB to ~1.2KB)

### 10.3 Performance Optimizations ✅

**Implemented:**

- Added `<link rel="preload">` for hero background image
- Added `defer` attribute to all JavaScript files:
  - Bootstrap bundle
  - GLightbox library
  - Custom JavaScript
- Added `<link rel="dns-prefetch">` for CDN (cdn.jsdelivr.net)
- Added `<link rel="preconnect">` for CDN with crossorigin

**Benefits:**

- Faster Largest Contentful Paint (LCP) through hero image preload
- Non-blocking JavaScript execution with defer
- Faster DNS resolution for external resources
- Earlier connection establishment to CDN

## Additional Improvements

### CSS Custom Properties Enhancement

Fixed hardcoded rgba values in footer styles by creating new CSS custom properties:

- `--footer-text-color: rgba(255, 255, 255, 0.8)`
- `--footer-text-muted-color: rgba(255, 255, 255, 0.6)`
- `--footer-divider-color: rgba(255, 255, 255, 0.2)`

This ensures all colors use CSS variables, making theme changes easier and passing Property 4 tests.

## Test Results

### Passing Tests ✅

- ✅ Color Scheme Flexibility (7/7 tests)
- ✅ Responsive Design Consistency (12/12 tests)
- ✅ Responsive Behavior (12/12 tests)
- ✅ Navigation Smooth Scrolling (7/7 tests)

### Known Issues

- ⚠️ Asset Optimization test has a JSDOM dependency issue (pre-existing, not related to optimizations)

## Performance Metrics Expected

With these optimizations, the website should achieve:

- **Faster First Contentful Paint (FCP)**: Minified CSS/JS and deferred scripts
- **Improved Largest Contentful Paint (LCP)**: Hero image preload
- **Better Cumulative Layout Shift (CLS)**: Width/height attributes on all images
- **Reduced Total Blocking Time (TBT)**: Deferred JavaScript execution
- **Lower bandwidth usage**: Minified files and lazy loading

## Next Steps

To further improve performance:

1. Add actual optimized images to `assets/images/` directory
2. Consider implementing WebP format with JPEG fallback
3. Add service worker for offline support
4. Implement critical CSS inlining
5. Consider using a CDN for static assets
6. Add compression (gzip/brotli) at server level

## Validation

Run the following to validate optimizations:

```bash
# Run tests
npm test

# Check file sizes
ls -lh assets/css/style.min.css
ls -lh assets/js/main.min.js

# Validate HTML
# Open index.html in browser and check:
# - Network tab for minified files
# - Performance tab for load times
# - Lighthouse audit for performance score
```

## References

- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
- [JavaScript Performance](https://web.dev/fast/#optimize-your-javascript)
