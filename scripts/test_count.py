from pathlib import Path

converted_dir = Path('assets/images/gallery/converted')
jpg_images = list(converted_dir.glob('*.jpg'))
png_images = list(converted_dir.glob('*.png')) + list(converted_dir.glob('*.PNG'))
all_images = jpg_images + png_images

print(f"JPG images: {len(jpg_images)}")
print(f"PNG images: {len(png_images)}")
print(f"Total images: {len(all_images)}")

print("\nNew images (not in first 134):")
for img in sorted(all_images)[134:]:
    print(f"  - {img.name}")
