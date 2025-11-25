# Media Guide - Tozan 2025 November Website

## Overview

This guide provides complete instructions for adding photos and videos to the Tozan 2025 November pilgrimage website. The website structure is complete and ready for media content from the pilgrimage.

## Quick Start

1. **Gather Media**: Collect photos and videos from the Tozan 2025 November group
2. **Optimize**: Resize and compress media files following specifications below
3. **Add Files**: Place optimized files in the correct directories
4. **Test**: Verify media displays correctly on the website

## 📸 Photo Requirements

### Required Photos

| File                       | Location                 | Dimensions  | Max Size | Purpose                 |
| -------------------------- | ------------------------ | ----------- | -------- | ----------------------- |
| `hero-bg.jpg`              | `assets/images/`         | 1920x1080px | 500KB    | Hero section background |
| `temple-placeholder-1.jpg` | `assets/images/`         | 800x600px   | 500KB    | Temple section image 1  |
| `temple-placeholder-2.jpg` | `assets/images/`         | 800x600px   | 500KB    | Temple section image 2  |
| `photo1.jpg`               | `assets/images/gallery/` | 800x600px   | 500KB    | Gallery photo 1         |
| `photo2.jpg`               | `assets/images/gallery/` | 800x600px   | 500KB    | Gallery photo 2         |
| `photo3.jpg`               | `assets/images/gallery/` | 800x600px   | 500KB    | Gallery photo 3         |
| `photo4.jpg`               | `assets/images/gallery/` | 800x600px   | 500KB    | Gallery photo 4         |
| `photo5.jpg`               | `assets/images/gallery/` | 800x600px   | 500KB    | Gallery photo 5         |
| `photo6.jpg`               | `assets/images/gallery/` | 800x600px   | 500KB    | Gallery photo 6         |

### Photo Content Suggestions

- **Hero Background**: Panoramic view of Taisekiji with Mt. Fuji
- **Temple Images**: Main temple buildings, Mt. Fuji views
- **Gallery Photos**:
  - Temple grounds and architecture
  - Mt. Fuji views
  - Group ceremonies
  - Pilgrims at prayer
  - Temple gardens
  - Architectural details

### Photo Optimization Steps

#### 1. Resize Photos

**Online Tool** (Easiest):

- Go to [Squoosh.app](https://squoosh.app/)
- Upload photo
- Set dimensions (e.g., 800x600 for gallery)
- Download resized image

**ImageMagick** (Command Line):

```bash
# Gallery/temple photos (800x600)
convert input.jpg -resize 800x600^ -gravity center -extent 800x600 output.jpg

# Hero background (1920x1080)
convert input.jpg -resize 1920x1080^ -gravity center -extent 1920x1080 hero-bg.jpg
```

#### 2. Compress Photos

**Online Tool**:

- Upload to [TinyJPG.com](https://tinyjpg.com/)
- Download compressed version
- Verify file size is under 500KB

**ImageMagick**:

```bash
convert input.jpg -quality 85 output.jpg
```

#### 3. Verify Quality

- Check image looks good at target size
- Ensure file size is under limit
- Test on different screens if possible

## 🎥 Video Requirements

### Required Videos

| File         | Location         | Poster Image        | Max Size | Purpose         |
| ------------ | ---------------- | ------------------- | -------- | --------------- |
| `video1.mp4` | `assets/videos/` | `video1-poster.jpg` | 50MB     | Gallery video 1 |
| `video2.mp4` | `assets/videos/` | `video2-poster.jpg` | 50MB     | Gallery video 2 |
| `video3.mp4` | `assets/videos/` | `video3-poster.jpg` | 50MB     | Gallery video 3 |

### Video Specifications

- **Format**: MP4 (H.264 codec)
- **Resolution**: 1280x720px (720p) recommended
- **Aspect Ratio**: 16:9
- **Duration**: 1-3 minutes (shorter is better)
- **Frame Rate**: 30fps or 24fps
- **Audio**: AAC codec, stereo, 128kbps

### Video Content Suggestions

- Temple ceremonies or gongyo services
- Temple grounds tour
- Mt. Fuji views and scenery
- Group activities and fellowship
- Pilgrimage highlights and testimonials

### Video Optimization Steps

#### Option 1: Online Tool (Easiest)

**CloudConvert**:

1. Go to [CloudConvert.com](https://cloudconvert.com/)
2. Upload video
3. Convert to MP4 (H.264)
4. Set quality to "Medium" or "High"
5. Download optimized video

#### Option 2: FFmpeg (Best Quality Control)

**Install FFmpeg**: https://ffmpeg.org/download.html

**Optimize video**:

```bash
ffmpeg -i input.mov -vcodec h264 -acodec aac -vf scale=1280:720 -crf 23 -preset medium output.mp4
```

**Create poster image** (thumbnail):

```bash
ffmpeg -i video1.mp4 -ss 00:00:05 -vframes 1 -vf scale=1280:720 -q:v 2 video1-poster.jpg
```

#### Option 3: HandBrake (GUI Application)

1. Download [HandBrake](https://handbrake.fr/)
2. Load video file
3. Select "Fast 720p30" preset
4. Adjust quality if needed (RF 22-24)
5. Start encoding

### Creating Poster Images

Each video needs a thumbnail (poster image):

**Method 1: Extract from Video**

```bash
ffmpeg -i video1.mp4 -ss 00:00:05 -vframes 1 video1-poster.jpg
```

**Method 2: Screenshot**

1. Open video in VLC or QuickTime
2. Pause at interesting frame
3. Take screenshot
4. Resize to 1280x720px
5. Compress to under 200KB

## 📁 File Organization

```
tozan-website/
├── assets/
│   ├── images/
│   │   ├── hero-bg.jpg                    # Hero background (1920x1080)
│   │   ├── temple-placeholder-1.jpg       # Temple image 1 (800x600)
│   │   ├── temple-placeholder-2.jpg       # Temple image 2 (800x600)
│   │   └── gallery/
│   │       ├── photo1.jpg                 # Gallery photos (800x600)
│   │       ├── photo2.jpg
│   │       ├── photo3.jpg
│   │       ├── photo4.jpg
│   │       ├── photo5.jpg
│   │       └── photo6.jpg
│   └── videos/
│       ├── video1.mp4                     # Videos (720p MP4)
│       ├── video1-poster.jpg              # Video thumbnails (1280x720)
│       ├── video2.mp4
│       ├── video2-poster.jpg
│       ├── video3.mp4
│       └── video3-poster.jpg
```

## ✅ Quality Checklist

### Before Adding Media

- [ ] Photos are from Tozan 2025 November group
- [ ] Videos are from Tozan 2025 November group
- [ ] Permission obtained for identifiable individuals
- [ ] Content respects temple photography guidelines
- [ ] Content follows Nichiren Shoshu guidelines

### Photo Checklist

- [ ] Correct dimensions (1920x1080 for hero, 800x600 for others)
- [ ] File size under 500KB
- [ ] JPEG format (.jpg)
- [ ] Good quality (not blurry or pixelated)
- [ ] Proper filename (matches HTML references)

### Video Checklist

- [ ] MP4 format with H.264 codec
- [ ] Resolution 1280x720px (720p)
- [ ] File size under 50MB
- [ ] Duration 1-3 minutes
- [ ] Poster image created (1280x720px, under 200KB)
- [ ] Video plays smoothly

### After Adding Media

- [ ] All photos load correctly on website
- [ ] All videos load correctly on website
- [ ] Poster images display before video plays
- [ ] Gallery filter works (All/Photos/Videos)
- [ ] Lightbox works for photos
- [ ] Video controls work (play, pause, fullscreen)
- [ ] Media looks good on mobile devices
- [ ] Media looks good on tablet devices
- [ ] Media looks good on desktop devices
- [ ] Page loads reasonably fast

## 🧪 Testing Instructions

### Local Testing

1. **Start a local server**:

   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000

   # Node.js (if you have http-server installed)
   npx http-server
   ```

2. **Open in browser**: http://localhost:8000

3. **Test each section**:

   - Hero section: Check background image loads
   - Temple section: Check both temple images load
   - Gallery: Check all 6 photos load
   - Gallery: Check all 3 videos load and play
   - Gallery: Test filter buttons (All/Photos/Videos)
   - Gallery: Click photos to test lightbox
   - Gallery: Test video controls

4. **Test responsive design**:
   - Open browser DevTools (F12)
   - Toggle device toolbar
   - Test at different screen sizes:
     - Mobile: 375px width
     - Tablet: 768px width
     - Desktop: 1920px width

### Browser Testing

Test in multiple browsers:

- [ ] Google Chrome
- [ ] Mozilla Firefox
- [ ] Safari (Mac/iOS)
- [ ] Microsoft Edge

### Performance Testing

1. **Check page load speed**:

   - Open DevTools → Network tab
   - Reload page
   - Check total load time and size
   - Target: Under 5 seconds on good connection

2. **Run Lighthouse audit**:
   - Open DevTools → Lighthouse tab
   - Run audit
   - Check Performance score
   - Target: 80+ score

## 🚨 Troubleshooting

### Photos Not Displaying

**Problem**: Photo shows placeholder or broken image
**Solutions**:

- Check filename matches exactly (case-sensitive)
- Verify file is in correct directory
- Check file format is JPEG (.jpg)
- Try clearing browser cache

### Videos Not Playing

**Problem**: Video won't play or shows error
**Solutions**:

- Verify format is MP4 with H.264 codec
- Check file size isn't too large
- Test in different browser
- Check browser console for errors
- Ensure video isn't corrupted

### Page Loads Slowly

**Problem**: Website takes long to load
**Solutions**:

- Compress images more (reduce quality)
- Reduce video file sizes
- Check all files are under size limits
- Verify lazy loading is working

### Poor Image Quality

**Problem**: Photos look blurry or pixelated
**Solutions**:

- Use higher quality source images
- Reduce compression (increase quality setting)
- Ensure correct dimensions before compression
- Don't upscale small images

## 📚 Additional Resources

### Optimization Tools

- **Photos**: [TinyJPG](https://tinyjpg.com/), [Squoosh](https://squoosh.app/)
- **Videos**: [CloudConvert](https://cloudconvert.com/), [HandBrake](https://handbrake.fr/)
- **FFmpeg**: [Official Documentation](https://ffmpeg.org/documentation.html)

### Learning Resources

- [Web Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Web Video Best Practices](https://web.dev/fast/#optimize-your-videos)
- [Responsive Images Guide](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

### Technical Documentation

- [HTML5 Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Image Lazy Loading](https://web.dev/browser-level-image-lazy-loading/)
- [GLightbox Documentation](https://github.com/biati-digital/glightbox)

## 📞 Support

For questions or assistance:

1. **Technical Issues**: Check the troubleshooting section above
2. **Content Questions**: Contact Tozan 2025 November group coordinator
3. **Website Issues**: Contact website administrator

## 📝 Current Status

### ✅ Completed

- Website structure and design
- HTML integration for all media
- Lazy loading implementation
- Responsive design
- Gallery filtering
- Lightbox for photos
- Video player controls
- Error handling for missing media
- Optimization guidelines

### ⚠️ Pending

- Actual photos from Tozan 2025 November group
- Actual videos from Tozan 2025 November group
- Media optimization and processing
- Final testing and verification

---

**Last Updated**: November 2025  
**Website**: Tozan 2025 November Pilgrimage  
**Version**: 1.0
