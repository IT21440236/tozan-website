# Image Optimization Guidelines

## Image Requirements

All images added to this website should follow these optimization guidelines:

### File Size

- **Maximum file size**: 500KB per image
- Compress images before adding them to the repository
- Use tools like ImageOptim, TinyPNG, or Squoosh for compression

### Dimensions

- **Gallery images**: 800x600px (4:3 aspect ratio)
- **Temple images**: 800x600px (4:3 aspect ratio)
- **Hero background**: 1920x1080px (16:9 aspect ratio)

### Format

- Use **JPEG** for photographs
- Use **PNG** for images with transparency
- Consider **WebP** format for better compression (with JPEG fallback)

### Naming Convention

- Use lowercase letters
- Use hyphens instead of spaces
- Be descriptive: `temple-main-hall.jpg` instead of `img1.jpg`

## Current Image Structure

```
assets/images/
├── hero-bg.jpg              # Hero section background (1920x1080px, <500KB)
├── temple-placeholder-1.jpg # Temple image 1 (800x600px, <500KB)
├── temple-placeholder-2.jpg # Temple image 2 (800x600px, <500KB)
└── gallery/
    ├── photo1.jpg           # Gallery photo 1 (800x600px, <500KB)
    ├── photo2.jpg           # Gallery photo 2 (800x600px, <500KB)
    ├── photo3.jpg           # Gallery photo 3 (800x600px, <500KB)
    ├── photo4.jpg           # Gallery photo 4 (800x600px, <500KB)
    ├── photo5.jpg           # Gallery photo 5 (800x600px, <500KB)
    └── photo6.jpg           # Gallery photo 6 (800x600px, <500KB)
```

## Optimization Tools

### Online Tools

- [TinyPNG](https://tinypng.com/) - PNG and JPEG compression
- [Squoosh](https://squoosh.app/) - Advanced image compression
- [ImageOptim Online](https://imageoptim.com/online) - Batch optimization

### Command Line Tools

- **ImageMagick**: `convert input.jpg -quality 85 -resize 800x600 output.jpg`
- **cwebp**: `cwebp -q 85 input.jpg -o output.webp`

## Implementation Notes

All images in the HTML already have:

- ✓ `loading="lazy"` attribute for lazy loading
- ✓ `width` and `height` attributes to prevent layout shift
- ✓ Proper `alt` text for accessibility
- ✓ Error handling for missing images

When adding new images:

1. Optimize the image file size (<500KB)
2. Resize to appropriate dimensions
3. Add to the correct directory
4. Update HTML with proper attributes
5. Test on multiple devices
