from pathlib import Path

converted_dir = Path('assets/images/gallery/converted')

jpg_files = sorted(converted_dir.glob('*.jpg'))
png_files = sorted(list(converted_dir.glob('*.png')) + list(converted_dir.glob('*.PNG')))
all_files = sorted(jpg_files + png_files)

with open('image_count_result.txt', 'w') as f:
    f.write(f"JPG files: {len(jpg_files)}\n")
    f.write(f"PNG files: {len(png_files)}\n")
    f.write(f"Total: {len(all_files)}\n\n")
    f.write("PNG Files:\n")
    for pf in png_files:
        f.write(f"  {pf.name}\n")
    f.write(f"\nAll files (first 20):\n")
    for af in all_files[:20]:
        f.write(f"  {af.name}\n")

print("Results written to image_count_result.txt")
