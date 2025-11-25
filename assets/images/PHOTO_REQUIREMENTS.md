# Photo Requirements for Tozan 2025 Website

## Overview

This document outlines all photos needed for the Tozan 2025 November pilgrimage website. The site structure is complete, but actual photos from the pilgrimage need to be added.

## Required Photos by Section

### 1. Hero Section

**File**: `hero-bg.jpg`

- **Purpose**: Background image for the hero section (first thing visitors see)
- **Dimensions**: 1920x1080px (16:9 aspect ratio)
- **File Size**: Less than 500KB
- **Suggested Content**:
  - Panoramic view of Taisekiji with Mt. Fuji in background
  - Temple entrance or main hall
  - Scenic view that captures the spiritual atmosphere
- **Technical Requirements**:
  - High quality but optimized for web
  - Should work well with text overlay
  - Consider slightly darker/muted tones for text readability

### 2. Temple Section

**File**: `temple-placeholder-1.jpg`

- **Purpose**: Primary temple image in the "Taisekiji & Dai-Gohonzon" section
- **Dimensions**: 800x600px (4:3 aspect ratio)
- **File Size**: Less than 500KB
- **Suggested Content**: Main temple building or significant temple structure

**File**: `temple-placeholder-2.jpg`

- **Purpose**: Secondary temple image
- **Dimensions**: 800x600px (4:3 aspect ratio)
- **File Size**: Less than 500KB
- **Suggested Content**: Mt. Fuji view from Taisekiji grounds

### 3. Gallery Section - Photos

**Location**: `assets/images/gallery/`

Six photos are needed for the gallery:

1. **photo1.jpg** - "Taisekiji Temple grounds"

   - Wide shot of temple grounds
   - Shows the scale and beauty of the complex

2. **photo2.jpg** - "Mt. Fuji view from temple"

   - Clear view of Mt. Fuji from temple grounds
   - Captures the iconic location

3. **photo3.jpg** - "Group pilgrimage ceremony"

   - Group photo during ceremony
   - Shows the community aspect of Tozan

4. **photo4.jpg** - "Temple architecture detail"

   - Close-up of temple architecture
   - Traditional Japanese design elements

5. **photo5.jpg** - "Pilgrims at prayer"

   - Pilgrims engaged in prayer or ceremony
   - Captures the spiritual practice

6. **photo6.jpg** - "Temple gardens"
   - Beautiful garden areas
   - Natural beauty of the temple grounds

**All gallery photos**:

- **Dimensions**: 800x600px (4:3 aspect ratio)
- **File Size**: Less than 500KB each
- **Format**: JPEG

## Photo Optimization Workflow

### Step 1: Select Photos

- Choose high-quality photos from the Tozan 2025 November group
- Ensure photos represent different aspects of the pilgrimage
- Get permission from individuals if faces are clearly visible

### Step 2: Resize Photos

Use one of these methods:

**Option A: Online Tool**

- Upload to [Squoosh.app](https://squoosh.app/)
- Resize to required dimensions
- Adjust quality to achieve target file size

**Option B: ImageMagick (Command Line)**

```bash
# For hero image
convert input.jpg -resize 1920x1080^ -gravity center -extent 1920x1080 -quality 85 hero-bg.jpg

# For temple/gallery images
convert input.jpg -resize 800x600^ -gravity center -extent 800x600 -quality 85 output.jpg
```

**Option C: Photoshop/GIMP**

- Open image
- Image → Image Size → Set to required dimensions
- File → Export → Save for Web → JPEG quality 80-85%

### Step 3: Compress Photos

- Use [TinyPNG](https://tinypng.com/) or [TinyJPG](https://tinyjpg.com/)
- Upload optimized images
- Download compressed versions
- Verify file size is under 500KB

### Step 4: Add to Repository

- Place files in correct directories
- Use exact filenames as specified
- Commit and push to repository

### Step 5: Verify

- Check website displays all photos correctly
- Test on mobile, tablet, and desktop
- Verify lazy loading works
- Test lightbox functionality for gallery

## Alt Text Guidelines

Each photo needs descriptive alt text for accessibility. Current alt text in HTML:

- Hero: (background image, no alt needed)
- Temple 1: "Taisekiji Head Temple"
- Temple 2: "Mt. Fuji view from Taisekiji"
- Gallery 1: "Taisekiji Temple grounds"
- Gallery 2: "Mt. Fuji view from temple"
- Gallery 3: "Group pilgrimage ceremony"
- Gallery 4: "Temple architecture detail"
- Gallery 5: "Pilgrims at prayer"
- Gallery 6: "Temple gardens"

Update alt text in `index.html` if actual photo content differs from these descriptions.

## Current Status

### ✅ Completed

- HTML structure with proper image tags
- Lazy loading attributes
- Responsive image sizing
- Error handling for missing images
- Lightbox integration
- Optimization guidelines documented

### ⚠️ Pending

- Actual photos from Tozan 2025 November group
- Photo optimization and resizing
- Final alt text verification

## Technical Implementation

All photos are already integrated in the HTML with:

```html
<!-- Example gallery photo -->
<img
  src="assets/images/gallery/photo1.jpg"
  alt="Taisekiji Temple grounds"
  loading="lazy"
  width="400"
  height="300"
  onerror="this.style.display='none'; this.parentElement.parentElement.querySelector('.placeholder-box').style.display='flex';"
/>
```

Features:

- **Lazy Loading**: Photos load as user scrolls (improves performance)
- **Dimensions**: Width and height prevent layout shift
- **Error Handling**: Graceful fallback if photo is missing
- **Accessibility**: Descriptive alt text for screen readers

## Contact

For questions about photo selection or technical requirements, contact the website administrator or Tozan 2025 November group coordinator.

## Resources

- [TinyPNG](https://tinypng.com/) - Image compression
- [Squoosh](https://squoosh.app/) - Advanced image optimization
- [ImageOptim](https://imageoptim.com/) - Mac image optimization tool
- [JPEG Optimizer](http://jpeg-optimizer.com/) - Online JPEG compression
