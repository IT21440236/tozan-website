# Gallery Photos - Tozan 2025 November

## Required Photos

This directory should contain photos from the Tozan 2025 November group pilgrimage. The HTML is configured to display 6 photos in the gallery section.

### Photo Requirements

Each photo should be:

- **Format**: JPEG (.jpg)
- **Dimensions**: 800x600px (4:3 aspect ratio)
- **File Size**: Less than 500KB (optimized for web)
- **Quality**: High quality but compressed for web delivery

### Expected Photo Files

The following photo files are referenced in `index.html`:

1. **photo1.jpg** - Taisekiji Temple grounds
2. **photo2.jpg** - Mt. Fuji view from temple
3. **photo3.jpg** - Group pilgrimage ceremony
4. **photo4.jpg** - Temple architecture detail
5. **photo5.jpg** - Pilgrims at prayer
6. **photo6.jpg** - Temple gardens

### Photo Optimization Steps

Before adding photos to this directory:

1. **Resize**: Ensure photos are exactly 800x600px

   ```bash
   # Using ImageMagick
   convert input.jpg -resize 800x600^ -gravity center -extent 800x600 output.jpg
   ```

2. **Compress**: Reduce file size to under 500KB

   - Use [TinyPNG](https://tinypng.com/) for online compression
   - Use [Squoosh](https://squoosh.app/) for advanced compression
   - Or use ImageMagick: `convert input.jpg -quality 85 output.jpg`

3. **Rename**: Use descriptive names with hyphens

   - Good: `temple-main-hall.jpg`, `group-ceremony.jpg`
   - Bad: `IMG_1234.jpg`, `photo 1.jpg`

4. **Add Alt Text**: Update the HTML with descriptive alt text for each photo

### Current Status

⚠️ **Photos Not Yet Added**

The gallery currently uses placeholder references. Once actual photos from the Tozan 2025 November group are available:

1. Optimize the photos following the guidelines above
2. Add them to this directory with the correct filenames
3. Verify they display correctly in the gallery
4. Test lazy loading functionality
5. Ensure the lightbox works for full-size viewing

### HTML Integration

Photos are already integrated in `index.html` with:

- ✓ Lazy loading (`loading="lazy"`)
- ✓ Proper dimensions (`width="400" height="300"`)
- ✓ Descriptive alt text
- ✓ GLightbox integration for full-size viewing
- ✓ Error handling for missing images

### Testing Checklist

After adding photos:

- [ ] All 6 photos load correctly
- [ ] File sizes are under 500KB each
- [ ] Photos display at correct dimensions
- [ ] Lazy loading works (photos load as you scroll)
- [ ] Lightbox opens when clicking photos
- [ ] Alt text is descriptive and accurate
- [ ] Photos look good on mobile, tablet, and desktop

## Contact

For questions about which photos to include or photo specifications, contact the Tozan 2025 November group coordinator.
