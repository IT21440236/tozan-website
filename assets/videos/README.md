# Gallery Videos - Tozan 2025 November

## Overview

This directory should contain videos from the Tozan 2025 November group pilgrimage. The HTML is configured to display 3 videos in the gallery section.

## Required Video Files

The following video files are referenced in `index.html`:

### 1. video1.mp4

- **Suggested Content**: Temple ceremony or gongyo service
- **Poster Image**: `video1-poster.jpg` (thumbnail shown before video plays)

### 2. video2.mp4

- **Suggested Content**: Temple grounds tour or Mt. Fuji views
- **Poster Image**: `video2-poster.jpg`

### 3. video3.mp4

- **Suggested Content**: Group activities or pilgrimage highlights
- **Poster Image**: `video3-poster.jpg`

## Video Specifications

### Video Files (.mp4)

- **Format**: MP4 (H.264 codec)
- **Resolution**: 1280x720px (720p) or 1920x1080px (1080p)
- **Aspect Ratio**: 16:9
- **File Size**: Recommended under 50MB per video
- **Duration**: 1-3 minutes recommended (shorter is better for web)
- **Frame Rate**: 30fps or 24fps
- **Audio**: AAC codec, stereo, 128kbps

### Poster Images (.jpg)

Each video needs a poster/thumbnail image:

- **Format**: JPEG (.jpg)
- **Dimensions**: 1280x720px (matches video aspect ratio)
- **File Size**: Less than 200KB
- **Content**: Representative frame from the video

## Video Optimization

Videos should be optimized for web delivery to ensure fast loading and smooth playback.

### Option 1: Online Tools

**CloudConvert** (https://cloudconvert.com/)

1. Upload your video
2. Convert to MP4 (H.264)
3. Set quality to "Medium" or "High"
4. Download optimized video

**Clideo** (https://clideo.com/compress-video)

1. Upload video
2. Choose compression level
3. Download compressed video

### Option 2: FFmpeg (Command Line)

**Install FFmpeg**: https://ffmpeg.org/download.html

**Compress and optimize video**:

```bash
ffmpeg -i input.mov -vcodec h264 -acodec aac -vf scale=1280:720 -crf 23 -preset medium output.mp4
```

**Create poster image from video** (extracts frame at 5 seconds):

```bash
ffmpeg -i video1.mp4 -ss 00:00:05 -vframes 1 -vf scale=1280:720 -q:v 2 video1-poster.jpg
```

**Parameters explained**:

- `-vcodec h264`: Use H.264 video codec (widely supported)
- `-acodec aac`: Use AAC audio codec
- `-vf scale=1280:720`: Resize to 720p
- `-crf 23`: Quality level (18-28, lower = better quality, larger file)
- `-preset medium`: Encoding speed vs compression (fast, medium, slow)

### Option 3: HandBrake (GUI Application)

**Download**: https://handbrake.fr/

1. Open HandBrake
2. Load your video file
3. Select "Web" preset or "Fast 720p30"
4. Adjust quality slider if needed (RF 22-24 recommended)
5. Start encoding

## File Size Guidelines

Target file sizes for good web performance:

| Duration | Target Size | Maximum Size |
| -------- | ----------- | ------------ |
| 30 sec   | 5-10 MB     | 15 MB        |
| 1 min    | 10-15 MB    | 25 MB        |
| 2 min    | 15-25 MB    | 40 MB        |
| 3 min    | 20-30 MB    | 50 MB        |

If videos are larger than maximum size, increase compression or reduce resolution to 480p.

## Creating Poster Images

Poster images are thumbnails shown before the video plays. They should be:

1. **Representative**: Show an interesting moment from the video
2. **Clear**: Not blurry or dark
3. **Optimized**: Compressed to under 200KB

### Method 1: Extract from Video (FFmpeg)

```bash
# Extract frame at 5 seconds
ffmpeg -i video1.mp4 -ss 00:00:05 -vframes 1 -vf scale=1280:720 -q:v 2 video1-poster.jpg

# Compress if needed
ffmpeg -i video1-poster.jpg -q:v 5 video1-poster-compressed.jpg
```

### Method 2: Video Player Screenshot

1. Open video in VLC or QuickTime
2. Pause at desired frame
3. Take screenshot (Tools → Take Snapshot in VLC)
4. Resize to 1280x720px
5. Compress using TinyJPG

### Method 3: Online Tool

- Use [Kapwing](https://www.kapwing.com/tools/add-video-thumbnail) to extract thumbnail

## HTML Integration

Videos are already integrated in `index.html`:

```html
<div class="gallery-item" data-type="video">
  <div class="video-wrapper">
    <video
      controls
      preload="metadata"
      width="400"
      height="300"
      poster="assets/videos/video1-poster.jpg"
    >
      <source src="assets/videos/video1.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
</div>
```

Features:

- **Controls**: Play, pause, volume, fullscreen
- **Preload metadata**: Loads video info but not full video (saves bandwidth)
- **Poster**: Shows thumbnail before playing
- **Responsive**: Adapts to screen size
- **Fallback**: Message for unsupported browsers

## Video Content Guidelines

### Appropriate Content

- ✓ Temple ceremonies and services
- ✓ Temple grounds and architecture
- ✓ Mt. Fuji views
- ✓ Group activities and fellowship
- ✓ Pilgrimage highlights
- ✓ Educational content about Nichiren Shoshu

### Privacy Considerations

- Get permission before including identifiable individuals
- Consider blurring faces if needed
- Respect temple photography restrictions
- Follow Nichiren Shoshu guidelines for sacred content

### Technical Best Practices

- Use tripod or stabilization for smooth footage
- Ensure good lighting
- Record in landscape orientation (16:9)
- Keep videos short and focused (1-3 minutes)
- Add captions if there's important dialogue

## Testing Checklist

After adding videos:

- [ ] All 3 videos load correctly
- [ ] File sizes are reasonable (under 50MB each)
- [ ] Poster images display before video plays
- [ ] Videos play smoothly without buffering
- [ ] Controls work (play, pause, volume, fullscreen)
- [ ] Videos display correctly on mobile devices
- [ ] Videos work in different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Gallery filter shows/hides videos correctly

## Current Status

### ✅ Completed

- HTML structure with video elements
- Poster image support
- Responsive video sizing
- Browser controls integration
- Gallery filter functionality
- Error handling for missing videos

### ⚠️ Pending

- Actual videos from Tozan 2025 November group
- Video optimization and compression
- Poster image creation
- Final testing across devices

## Troubleshooting

### Video Won't Play

- Check file format is MP4 with H.264 codec
- Verify file path is correct
- Test in different browser
- Check browser console for errors

### Video File Too Large

- Reduce resolution to 720p or 480p
- Increase compression (higher CRF value)
- Trim video length
- Use more aggressive preset (fast vs slow)

### Poor Video Quality

- Reduce compression (lower CRF value)
- Use higher resolution source
- Use slower encoding preset
- Check source video quality

## Resources

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [HandBrake Guide](https://handbrake.fr/docs/)
- [Web Video Best Practices](https://web.dev/fast/#optimize-your-videos)
- [HTML5 Video Guide](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)

## Contact

For questions about video content or technical specifications, contact the Tozan 2025 November group coordinator or website administrator.
