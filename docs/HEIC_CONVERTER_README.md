# HEIC to JPG Converter

This Python script converts HEIC (High Efficiency Image Container) images to JPG format for web compatibility.

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install pillow pillow-heif
```

### 2. Run the Converter

```bash
python convert_heic_to_jpg.py
```

### 3. Follow the Prompts

The script will ask you for:
- **Input directory**: Where your HEIC images are located (default: `assets/images/gallery`)
- **Output directory**: Where to save converted JPG images (default: `assets/images/gallery/converted`)
- **Quality**: JPG quality from 1-100 (default: 95)

## 📋 Features

- ✅ Converts all HEIC/HEIF files in a directory
- ✅ Case-insensitive file detection (.heic, .HEIC, .heif, .HEIF)
- ✅ Preserves image quality with adjustable compression
- ✅ Shows file size comparison (before/after)
- ✅ Creates output directory automatically
- ✅ Detailed progress reporting
- ✅ Error handling for failed conversions
- ✅ Conversion summary at the end

## 💡 Usage Examples

### Example 1: Convert gallery images
```bash
python convert_heic_to_jpg.py
# Input: assets/images/gallery
# Output: assets/images/gallery/converted
```

### Example 2: Custom directories
```bash
python convert_heic_to_jpg.py
# Input: C:\Users\YourName\Pictures\iPhone
# Output: assets/images/gallery
```

### Example 3: High quality conversion
```bash
python convert_heic_to_jpg.py
# Quality: 100 (maximum quality, larger file size)
```

## 📊 Output Example

```
============================================================
🖼️  HEIC to JPG Converter
============================================================

Enter input directory (default: assets/images/gallery): 
Enter output directory (default: assets/images/gallery/converted): 
Enter JPG quality 1-100 (default: 95): 

📁 Output directory: C:\...\assets\images\gallery\converted

🔍 Found 5 HEIC file(s) to convert

🔄 Converting: photo1.HEIC → photo1.jpg
   ✅ Success! (3245.2 KB → 1823.4 KB)
🔄 Converting: photo2.HEIC → photo2.jpg
   ✅ Success! (2891.7 KB → 1654.8 KB)

============================================================
📊 Conversion Summary:
   ✅ Successfully converted: 5
   📁 Output location: C:\...\assets\images\gallery\converted
============================================================
```

## 🔧 Troubleshooting

### Issue: "No module named 'pillow_heif'"
**Solution**: Install the required packages:
```bash
pip install pillow pillow-heif
```

### Issue: "Input directory does not exist"
**Solution**: Make sure you enter the correct path to your HEIC images.

### Issue: Conversion fails for specific images
**Solution**: The image file might be corrupted. Try opening it in another app first.

## 📝 Notes

- **Quality Setting**: 
  - 85-95: Good balance between quality and file size (recommended)
  - 95-100: Maximum quality, larger files
  - 70-85: Smaller files, slight quality loss
  
- **File Sizes**: JPG files are typically 40-60% smaller than HEIC files

- **Color Modes**: The script automatically converts images to RGB format for JPG compatibility

## 🌐 Why Convert HEIC to JPG?

HEIC images are not supported by most web browsers:
- ❌ Chrome - No support
- ❌ Firefox - No support  
- ❌ Edge - No support
- ⚠️ Safari - Only on Apple devices

JPG is universally supported across all browsers and devices!

## 📄 License

This script is part of the Tozan Pilgrimage Website project.
